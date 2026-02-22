import React from 'react';
import type { CalendarEvent } from '../types';
import { TimeGrid } from '../components/TimeGrid';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  hourHeight: number;
  startHour: number;
  endHour: number;
  onEventClick: (event: CalendarEvent) => void;
  onEventResizeEnd: (id: string, newEnd: Date) => void;
  onSlotClick: (start: Date, end: Date) => void;
  onColumnWidthChange: (px: number) => void;
}

/**
 * DayView renders a single-column TimeGrid for the given date.
 *
 * It's intentionally thin — all the heavy lifting (positioning,
 * drag targets, hour lines) happens inside TimeGrid so DayView
 * stays easy to read and reason about.
 */
export const DayView: React.FC<DayViewProps> = ({
  date,
  events,
  hourHeight,
  startHour,
  endHour,
  onEventClick,
  onEventResizeEnd,
  onSlotClick,
  onColumnWidthChange,
}) => {
  const columns = [{ date, key: date.toDateString() }];

  return (
    <TimeGrid
      columns={columns}
      events={events}
      hourHeight={hourHeight}
      startHour={startHour}
      endHour={endHour}
      onEventClick={onEventClick}
      onEventResizeEnd={onEventResizeEnd}
      onSlotClick={onSlotClick}
      onColumnWidthChange={onColumnWidthChange}
    />
  );
};
