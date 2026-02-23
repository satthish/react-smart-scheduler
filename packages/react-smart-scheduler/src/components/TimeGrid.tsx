import React, { useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import type { CalendarEvent, PositionedEvent } from '../types';
import { formatHour, getCurrentTimeFraction, yOffsetToDate } from '../utils/dateUtils';
import { positionEvents, getEventsForDay } from '../utils/eventUtils';
import { EventItem } from './EventItem';

interface Column {
  date: Date;
  key: string;
}

interface TimeGridProps {
  columns: Column[];
  events: CalendarEvent[];
  hourHeight: number;
  startHour: number;
  endHour: number;
  onColumnWidthChange?: (px: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventResizeEnd: (id: string, newEnd: Date) => void;
  onSlotClick: (start: Date, end: Date) => void;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Shared backbone for DayView and WeekView.
 *
 * The day-header row lives inside the scroll container so headers and
 * columns scroll together horizontally on mobile. Sticky positioning keeps
 * the header row at the top and the time gutter at the left.
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

  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnsRef.current || !onColumnWidthChange) return;
    const el = columnsRef.current;
    const report = () => onColumnWidthChange(el.offsetWidth / (columns.length || 1));
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns.length, onColumnWidthChange]);

  const nowFraction = getCurrentTimeFraction(startHour, endHour);
  const nowTop = nowFraction * totalHeight;

  const { setNodeRef: setDropRef } = useDroppable({ id: 'timegrid-body' });

  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>, col: Column) => {
    const target = e.target as HTMLElement;
    if (target.closest('.rss-event')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const start = yOffsetToDate(y, col.date, hourHeight, startHour);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    onSlotClick(start, end);
  };

  return (
    <div className="rss-timegrid">
      <div className="rss-timegrid-scroll">
        {/* Day-of-week header — sticky top; gutter corner is sticky left */}
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

        {/* Body — time gutter is sticky left for horizontal scroll */}
        <div
          className="rss-timegrid-body"
          ref={setDropRef}
          style={{ height: totalHeight }}
        >
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
                  {visibleHours.map((hour) => (
                    <div
                      key={hour}
                      className="rss-hour-cell"
                      style={{ height: hourHeight }}
                      aria-label={`${formatHour(hour)} on ${format(col.date, 'MMMM d')}`}
                    />
                  ))}

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

                  {today && (
                    <div
                      className="rss-now-line"
                      style={{ top: nowTop }}
                      aria-hidden="true"
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
