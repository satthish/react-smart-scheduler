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

/**
 * TimeGrid is the shared backbone for both DayView and WeekView.
 *
 * Layout structure:
 *   ┌──────────┬─────────────────────────────┐
 *   │  gutter  │  day column headers         │
 *   ├──────────┼─────────────────────────────┤
 *   │  time    │  scrollable columns         │
 *   │  labels  │  (hour lines + events)      │
 *   └──────────┴─────────────────────────────┘
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
      {/* ── Day-of-week header row ──────────────────────────────── */}
      <div className="rss-timegrid-allday" aria-hidden="true">
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
      <div className="rss-timegrid-scroll">
        <div
          className="rss-timegrid-body"
          ref={setDropRef}
          style={{ height: totalHeight }}
        >
          {/* Time gutter */}
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
