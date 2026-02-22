// ─────────────────────────────────────────────
// Public API types — exported from the library
// ─────────────────────────────────────────────

export type ViewType = 'day' | 'week' | 'month';

/**
 * The shape of a single calendar event.
 *
 * To attach custom metadata, extend this interface:
 *   interface MyEvent extends CalendarEvent { roomId: string; }
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** Optional hex/named color for the event chip */
  color?: string;
}

/** Props accepted by the top-level <Scheduler /> component. */
export interface SchedulerProps {
  /** Controlled list of events to display */
  events: CalendarEvent[];

  /** Which view to render (default: 'week') */
  view?: ViewType;

  /** The "anchor" date for the current view (default: today) */
  date?: Date;

  /**
   * Called when the user clicks an empty time slot.
   * The consumer is responsible for generating an id and adding
   * the event to their own state.
   */
  onEventAdd?: (event: Omit<CalendarEvent, 'id'>) => void;

  /** Called after a drag-move or resize completes. */
  onEventChange?: (event: CalendarEvent) => void;

  /** Called when the user deletes an event via the event modal. */
  onEventDelete?: (id: string) => void;

  /** Called when the user switches views via the header. */
  onViewChange?: (view: ViewType) => void;

  /** Called when the user navigates forward/back or clicks "Today". */
  onDateChange?: (date: Date) => void;

  /** Height of each hour row in pixels (default: 64). */
  hourHeight?: number;

  /** First hour shown in the time grid (default: 0). */
  startHour?: number;

  /** Last hour shown in the time grid (default: 24). */
  endHour?: number;

  /** Extra CSS class applied to the root element. */
  className?: string;
}

// ─────────────────────────────────────────────
// Internal types — not part of the public API
// ─────────────────────────────────────────────

/**
 * A CalendarEvent enriched with layout information computed by
 * the overlap-resolution algorithm so EventItem can be positioned.
 */
export interface PositionedEvent extends CalendarEvent {
  /** Distance from top of the time grid, as a % of total height */
  topPercent: number;
  /** Height of the event chip, as a % of total height */
  heightPercent: number;
  /** Left offset within the column, as a % of column width */
  leftPercent: number;
  /** Width of the event chip, as a % of column width */
  widthPercent: number;
}

/** Data attached to every dnd-kit draggable event item. */
export interface DraggableEventData {
  type: 'event';
  event: CalendarEvent;
}

/** Shared grid dimensions read by drag handlers. */
export interface GridMetrics {
  hourHeight: number;
  columnWidth: number; // 0 in day view; measured in week view
}
