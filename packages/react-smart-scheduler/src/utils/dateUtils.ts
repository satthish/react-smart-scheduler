import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addDays,
  addWeeks,
  addMonths,
  addMinutes,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  getHours,
  getMinutes,
  startOfDay,
  differenceInMinutes,
} from 'date-fns';
import type { ViewType } from '../types';

// Re-export commonly used date-fns utilities so consumers
// and internal code only need a single import path.
export {
  format,
  addDays,
  addWeeks,
  addMonths,
  addMinutes,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  getHours,
  getMinutes,
  startOfDay,
  differenceInMinutes,
};

// ── Week helpers ────────────────────────────────────────────────────────────

/** All 7 days of the week that contains `date` (Sun → Sat). */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

// ── Month helpers ───────────────────────────────────────────────────────────

/**
 * Returns the full 6-row grid used by the month view.
 * Leading/trailing days from adjacent months pad the grid so it
 * always starts on Sunday and ends on Saturday.
 */
export function getMonthGrid(date: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

// ── Formatting ──────────────────────────────────────────────────────────────

/** Human-readable header string for the current view + date. */
export function formatHeaderDate(date: Date, view: ViewType): string {
  switch (view) {
    case 'day':
      return format(date, 'EEEE, MMMM d, yyyy');

    case 'week': {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      // Condense "January 1 – 7, 2025" vs "Dec 29 – Jan 4, 2025"
      if (format(start, 'MMMM yyyy') === format(end, 'MMMM yyyy')) {
        return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }

    case 'month':
      return format(date, 'MMMM yyyy');
  }
}

/** "12 AM", "1 PM", "12 PM" etc. for the time-gutter labels. */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/** Short time label for event chips: "9:30 AM" */
export function formatEventTime(date: Date): string {
  return format(date, 'h:mm a');
}

// ── Time-grid math ──────────────────────────────────────────────────────────

/**
 * Fractional position (0 – 1) of the current wall-clock time within the
 * visible time range. Used for the "now" indicator line.
 */
export function getCurrentTimeFraction(startHour: number, endHour: number): number {
  const now = new Date();
  const totalMinutes = (endHour - startHour) * 60;
  const elapsed = getHours(now) * 60 + getMinutes(now) - startHour * 60;
  return Math.max(0, Math.min(1, elapsed / totalMinutes));
}

/** Round `minutes` to the nearest `interval` (default 15 min). */
export function snapMinutes(minutes: number, interval = 15): number {
  return Math.round(minutes / interval) * interval;
}

// ── Navigation ──────────────────────────────────────────────────────────────

/** Move the anchor date forward (+1) or backward (-1) by one view-period. */
export function navigateDate(date: Date, view: ViewType, direction: 1 | -1): Date {
  switch (view) {
    case 'day':
      return direction === 1 ? addDays(date, 1) : subDays(date, 1);
    case 'week':
      return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
    case 'month':
      return direction === 1 ? addMonths(date, 1) : subMonths(date, 1);
  }
}

/**
 * Given a Y offset in pixels within the time grid, return the
 * corresponding Date (start of day + offset minutes).
 */
export function yOffsetToDate(
  y: number,
  dayDate: Date,
  hourHeight: number,
  startHour: number,
): Date {
  const minutesFromStart = (y / hourHeight) * 60;
  const totalMinutes = startHour * 60 + minutesFromStart;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const result = startOfDay(dayDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/** Total minutes in the visible time range. */
export function totalGridMinutes(startHour: number, endHour: number): number {
  return (endHour - startHour) * 60;
}

/** Convert a Date to minutes from the start of the visible grid. */
export function dateToGridMinutes(date: Date, startHour: number): number {
  return differenceInMinutes(date, startOfDay(date)) - startHour * 60;
}
