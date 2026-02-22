import React from 'react';
import { format, isToday, isSameMonth } from 'date-fns';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { CalendarEvent, DraggableEventData } from '../types';
import { getMonthGrid } from '../utils/dateUtils';
import { getEventsForDay, pickColor } from '../utils/eventUtils';
import { CSS } from '@dnd-kit/utilities';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (start: Date, end: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Maximum event pills per cell before "+ N more" is shown */
const MAX_VISIBLE = 3;

// ── Draggable month event pill ─────────────────────────────────────────────

interface MonthEventPillProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const MonthEventPill: React.FC<MonthEventPillProps> = ({ event, onClick }) => {
  const data: DraggableEventData = { type: 'event', event };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `month-${event.id}`,
    data,
  });

  const color = event.color ?? pickColor(event.id);

  return (
    <div
      ref={setNodeRef}
      className="rss-month-event"
      style={{
        background: color,
        opacity: isDragging ? 0.4 : 1,
        transform: CSS.Translate.toString(transform),
        cursor: 'grab',
      }}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={event.title}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event);
        }
      }}
    >
      {event.title}
    </div>
  );
};

// ── Droppable month day cell ───────────────────────────────────────────────

interface MonthCellProps {
  day: Date;
  currentMonth: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (start: Date, end: Date) => void;
}

const MonthCell: React.FC<MonthCellProps> = ({
  day,
  currentMonth,
  events,
  onEventClick,
  onSlotClick,
}) => {
  const today = isToday(day);
  const otherMonth = !isSameMonth(day, currentMonth);

  // Each day cell is a droppable — when a dragged event is released here,
  // the Scheduler's onDragEnd handler moves the event to this date.
  const { setNodeRef, isOver } = useDroppable({
    id: `month-cell-${format(day, 'yyyy-MM-dd')}`,
    data: { date: day },
  });

  const visible = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  const handleCellClick = () => {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);
    onSlotClick(start, end);
  };

  return (
    <div
      ref={setNodeRef}
      className={[
        'rss-month-cell',
        today ? 'rss-month-cell--today' : '',
        otherMonth ? 'rss-month-cell--other-month' : '',
        isOver ? 'rss-month-cell--drop-over' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={isOver ? { background: 'rgb(59 130 246 / 0.08)' } : undefined}
      onClick={handleCellClick}
      role="gridcell"
      aria-label={format(day, 'MMMM d, yyyy')}
    >
      {/* Day number */}
      <span
        className={[
          'rss-month-day-num',
          today ? 'rss-month-day-num--today' : '',
          otherMonth ? 'rss-month-day-num--other' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {format(day, 'd')}
      </span>

      {/* Event pills */}
      {visible.map((event) => (
        <MonthEventPill key={event.id} event={event} onClick={onEventClick} />
      ))}

      {/* Overflow indicator */}
      {overflow > 0 && (
        <span className="rss-month-more" aria-label={`${overflow} more events`}>
          +{overflow} more
        </span>
      )}
    </div>
  );
};

// ── MonthView ──────────────────────────────────────────────────────────────

/**
 * MonthView renders a 6-row × 7-column calendar grid.
 *
 * Each cell is a droppable zone. Event pills are draggable.
 * When the Scheduler's DndContext fires onDragEnd over a month cell,
 * the event is moved to that day (preserving its original time of day).
 */
export const MonthView: React.FC<MonthViewProps> = ({
  date,
  events,
  onEventClick,
  onSlotClick,
}) => {
  const grid = getMonthGrid(date);

  return (
    <div className="rss-month" role="grid" aria-label={format(date, 'MMMM yyyy')}>
      {/* Weekday header row */}
      <div className="rss-month-weekdays" role="row" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <div key={d} className="rss-month-weekday" role="columnheader">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="rss-month-grid">
        {grid.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          return (
            <MonthCell
              key={format(day, 'yyyy-MM-dd')}
              day={day}
              currentMonth={date}
              events={dayEvents}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
            />
          );
        })}
      </div>
    </div>
  );
};
