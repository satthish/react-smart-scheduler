import React, { useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import type { CalendarEvent, PositionedEvent } from '../types';
import { formatHour, getCurrentTimeFraction, yOffsetToDate } from '../utils/dateUtils';
import { positionEvents, getEventsForDay } from '../utils/eventUtils';
import { EventItem } from './EventItem';

interface Column {
  date: Date;
  /** Key for React reconciliation */
  key: string;
}

interface TimeGridProps {
  /** The day columns to render (1 for day view, 7 for week view) */
  columns: Column[];
  events: CalendarEvent[];
  hourHeight: number;
  startHour: number;
  endHour: number;
  /** Called by Scheduler to report measured column width for drag math */
  onColumnWidthChange?: (px: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventResizeEnd: (id: string, newEnd: Date) => void;
  /** Empty cell click → open "add event" modal */
  onSlotClick: (start: Date, end: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Discard unused HOURS constant (visibleHours computed from props below)
void HOURS;

/**
 * TimeGrid is the shared backbone for both DayView and WeekView.
 *
 * Layout structure:
 *   ┌──────────┬─────────────────────────────┐
 *   │  gutter  │  day column headers         │  ← sticky top (scrolls together)
 *   ├──────────┼─────────────────────────────┤
 *   │  time    │  event columns              │
 *   │  labels  │  (hour lines + events)      │
 *   └──────────┴─────────────────────────────┘
 *
 * Responsive / horizontal scroll approach:
 *   The day-header row is placed INSIDE the single scroll container so that
 *   it scrolls horizontally together with the time columns. It is kept
 *   visible on vertical scroll via `position: sticky; top: 0`.
 *   The time-label gutter (left column) and the allday-gutter corner are
 *   kept visible on horizontal scroll via `position: sticky; left: 0`.
 *   On screens < 640 px the scroll container switches to `overflow-x: auto`,
 *   and each day column gets a minimum width (see scheduler.css) so that
 *   week view becomes horizontally scrollable rather than squishing 7 columns
 *   into a narrow viewport.
 *
 * Events are absolutely positioned within each column using percentages
 * computed by positionEvents(). The grid height is hourHeight × visible hours.
 */
export const TimeGrid: React.FC<TimeGridProps> = ({
  columns,
  events,
  hourHeight,
  startHour,
  endHour,
  onColumnWidthChange,
  onEventClick,
  onEventResizeEnd,
  onSlotClick,
}) => {
  const visibleHours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  );
  const totalHeight = visibleHours.length * hourHeight;

  // Measure column width and report it upward so the drag handler can
  // convert delta.x pixels → number of days moved.
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnsRef.current || !onColumnWidthChange) return;
    const el = columnsRef.current;

    const report = () => {
      const colCount = columns.length || 1;
      onColumnWidthChange(el.offsetWidth / colCount);
    };

    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns.length, onColumnWidthChange]);

  // "Now" indicator position
  const nowFraction = getCurrentTimeFraction(startHour, endHour);
  const nowTop = nowFraction * totalHeight;

  // The entire grid body is one big droppable so dnd-kit can detect
  // when an event is dragged above it. Actual time calculation uses
  // the delta from drag start, not per-cell targets.
  const { setNodeRef: setDropRef } = useDroppable({ id: 'timegrid-body' });

  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>, col: Column) => {
    // Ignore clicks that originated from an event chip
    const target = e.target as HTMLElement;
    if (target.closest('.rss-event')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const start = yOffsetToDate(y, col.date, hourHeight, startHour);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour default
    onSlotClick(start, end);
  };

  return (
    <div className="rss-timegrid">
      {/*
        Single unified scroll container.
        - overflow-y: auto → vertical scroll for the time grid.
        - overflow-x: hidden by default; switched to `auto` on mobile via CSS.
        Both the day-header row and the time columns live inside here so they
        scroll together horizontally. Sticky positioning keeps the header row
        at the top on vertical scroll and the gutter at the left on horizontal.
      */}
      <div className="rss-timegrid-scroll">

        {/* ── Day-of-week header row ──────────────────────────────── */}
        {/*
          position: sticky; top: 0  → sticks to top while scrolling down.
          The allday-gutter corner inside it uses sticky; left: 0  so it
          stays visible when scrolling right in week view on mobile.
        */}
        <div className="rss-timegrid-allday" aria-hidden="true">
          {/* Top-left corner spacer — matches the time gutter width */}
          <div className="rss-timegrid-allday-gutter" />
          <div className="rss-day-headers">
            {columns.map((col) => {
              const today = isToday(col.date);
              return (
                <div key={col.key} className="rss-day-header">
                  <span className="rss-day-header-weekday">
                    {WEEKDAY_SHORT[col.date.getDay()]}
                  </span>
                  <span
                    className={`rss-day-header-num ${today ? 'rss-day-header-num--today' : ''}`}
                  >
                    {format(col.date, 'd')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div
          className="rss-timegrid-body"
          ref={setDropRef}
          style={{ height: totalHeight }}
        >
          {/*
            Time-label gutter — position: sticky; left: 0 so it stays
            visible when the user scrolls the week grid horizontally on mobile.
          */}
          <div className="rss-time-gutter" aria-hidden="true">
            {visibleHours.map((hour) => (
              <div
                key={hour}
                className="rss-time-label"
                style={{ height: hourHeight, lineHeight: `${hourHeight}px` }}
              >
                {hour === startHour ? '' : formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="rss-columns" ref={columnsRef} style={{ height: totalHeight }}>
            {columns.map((col) => {
              const dayEvents = getEventsForDay(events, col.date);
              const positioned = positionEvents(dayEvents, startHour, endHour);
              const today = isToday(col.date);

              return (
                <div
                  key={col.key}
                  className={`rss-column ${today ? 'rss-column--today' : ''}`}
                  style={{ height: totalHeight }}
                  role="grid"
                  aria-label={format(col.date, 'EEEE, MMMM d')}
                  onClick={(e) => handleColumnClick(e, col)}
                >
                  {/* Hour-cell grid lines */}
                  {visibleHours.map((hour) => (
                    <div
                      key={hour}
                      className="rss-hour-cell"
                      style={{ height: hourHeight }}
                      aria-label={`${formatHour(hour)} on ${format(col.date, 'MMMM d')}`}
                    />
                  ))}

                  {/* Event chips */}
                  {positioned.map((pe: PositionedEvent) => (
                    <EventItem
                      key={pe.id}
                      event={pe}
                      hourHeight={hourHeight}
                      gridHeight={totalHeight}
                      onClick={onEventClick}
                      onResizeEnd={onEventResizeEnd}
                    />
                  ))}

                  {/* "Now" indicator line — only on today's column */}
                  {today && (
                    <div
                      className="rss-now-line"
                      style={{ top: nowTop }}
                      aria-hidden="true"
                      aria-label="Current time"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
