import React from 'react';
import type { CalendarEvent } from '../types';
import { TimeGrid } from '../components/TimeGrid';
import { getWeekDays } from '../utils/dateUtils';
import { format } from 'date-fns';

interface WeekViewProps {
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
 * WeekView renders a 7-column TimeGrid (Sun – Sat) for the week
 * containing the given anchor date.
 *
 * Column widths are reported upward so that the Scheduler's drag
 * handler can translate horizontal pixel deltas into day offsets.
 */
export const WeekView: React.FC<WeekViewProps> = ({
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
  const days = getWeekDays(date);
  const columns = days.map((d) => ({
    date: d,
    key: format(d, 'yyyy-MM-dd'),
  }));

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
