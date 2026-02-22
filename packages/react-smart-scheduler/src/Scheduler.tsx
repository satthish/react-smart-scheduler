import React, { useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { addDays, addMinutes } from 'date-fns';
import { format } from 'date-fns';

import './scheduler.css';

import type { CalendarEvent, GridMetrics, PositionedEvent, SchedulerProps } from './types';
import { Header } from './components/Header';
import { EventModal } from './components/EventModal';
import { EventItem } from './components/EventItem';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { useScheduler } from './hooks/useScheduler';
import { snapMinutes } from './utils/dateUtils';
import { pickColor } from './utils/eventUtils';

// Sensible defaults
const DEFAULT_HOUR_HEIGHT = 64; // px
const DEFAULT_START_HOUR = 0;
const DEFAULT_END_HOUR = 24;

/**
 * <Scheduler /> — the root component.
 *
 * Architecture decisions:
 *
 * 1. Fully controlled: events, view, and date are all owned by the parent.
 *    The Scheduler only owns transient UI state (drag preview, modal open).
 *
 * 2. Single DndContext: wraps all views so dnd-kit's sensors work across
 *    view transitions without needing multiple contexts.
 *
 * 3. Drag math uses delta (pixels moved from drag start) rather than
 *    absolute drop coordinates. This avoids needing per-cell droppables
 *    and gives sub-cell precision. Column width is measured via
 *    ResizeObserver and stored in a mutable ref (not state) to avoid
 *    re-renders on window resize.
 *
 * 4. Resize is handled entirely in EventItem via Pointer Capture API,
 *    completely independent of dnd-kit. EventItem calls onEventResizeEnd
 *    after commit; Scheduler forwards to onEventChange.
 */
export const Scheduler: React.FC<SchedulerProps> = ({
  events,
  view: viewProp = 'week',
  date: dateProp,
  onEventAdd,
  onEventChange,
  onEventDelete,
  onViewChange,
  onDateChange,
  hourHeight = DEFAULT_HOUR_HEIGHT,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  className = '',
}) => {
  // ── Uncontrolled fallbacks ─────────────────────────────────────────────
  // If the consumer doesn't pass view/date we manage them internally.
  const [internalView, setInternalView] = useState(viewProp);
  const [internalDate, setInternalDate] = useState(dateProp ?? new Date());

  const view = dateProp !== undefined ? viewProp : internalView;
  const date = dateProp ?? internalDate;

  const handleViewChange = (v: typeof view) => {
    setInternalView(v);
    onViewChange?.(v);
  };

  const handleDateChange = (d: Date) => {
    setInternalDate(d);
    onDateChange?.(d);
  };

  // ── Modal / UI state (via hook) ────────────────────────────────────────
  const {
    isModalOpen,
    editingEvent,
    pendingSlot,
    openEditModal,
    openAddModal,
    closeModal,
    handleModalSave,
    handleModalDelete,
  } = useScheduler({ onEventAdd, onEventChange, onEventDelete });

  // ── Drag state ─────────────────────────────────────────────────────────
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  // Mutable ref to hold grid metrics — updated by ResizeObserver without
  // triggering re-renders on every window resize.
  const gridMetrics = useRef<GridMetrics>({ hourHeight, columnWidth: 0 });
  gridMetrics.current.hourHeight = hourHeight;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a 6 px move before drag starts, so clicks still fire.
      activationConstraint: { distance: 6 },
    }),
  );

  // ── Drag handlers ──────────────────────────────────────────────────────

  const handleDragStart = (dndEvent: DragStartEvent) => {
    const data = dndEvent.active.data.current;
    if (data?.type === 'event') {
      setDraggedEvent(data.event as CalendarEvent);
    }
  };

  const handleDragEnd = (dndEvent: DragEndEvent) => {
    const { delta } = dndEvent;
    const data = dndEvent.active.data.current;
    setDraggedEvent(null);

    if (!data || data.type !== 'event') return;
    const original = data.event as CalendarEvent;

    // ── Time-grid drag (day / week view) ──────────────────────────────
    if (view === 'day' || view === 'week') {
      // Vertical delta → minutes
      const minutesDelta = snapMinutes((delta.y / gridMetrics.current.hourHeight) * 60);

      // Horizontal delta → days (week view only; 0 in day view)
      let daysDelta = 0;
      if (view === 'week' && gridMetrics.current.columnWidth > 0) {
        daysDelta = Math.round(delta.x / gridMetrics.current.columnWidth);
      }

      if (minutesDelta === 0 && daysDelta === 0) return;

      const newStart = addMinutes(addDays(original.start, daysDelta), minutesDelta);
      const newEnd = addMinutes(addDays(original.end, daysDelta), minutesDelta);

      // Clamp: don't let events go outside the visible time range
      const startBound = startHour * 60;
      const endBound = endHour * 60;
      const newStartMins = newStart.getHours() * 60 + newStart.getMinutes();
      const newEndMins = newEnd.getHours() * 60 + newEnd.getMinutes();
      if (newStartMins < startBound || newEndMins > endBound) return;

      onEventChange?.({ ...original, start: newStart, end: newEnd });
      return;
    }

    // ── Month-view drag ────────────────────────────────────────────────
    // In month view each cell is a droppable. We read the target date
    // from over.data and preserve the original time of day.
    if (view === 'month') {
      const over = dndEvent.over;
      if (!over?.data?.current?.date) return;

      const targetDay = over.data.current.date as Date;
      const originalDay = new Date(original.start);

      // How many days moved?
      const startOfOriginalDay = new Date(originalDay);
      startOfOriginalDay.setHours(0, 0, 0, 0);
      const startOfTargetDay = new Date(targetDay);
      startOfTargetDay.setHours(0, 0, 0, 0);

      const msDiff = startOfTargetDay.getTime() - startOfOriginalDay.getTime();
      const dayDiff = Math.round(msDiff / (24 * 60 * 60 * 1000));

      if (dayDiff === 0) return;

      onEventChange?.({
        ...original,
        start: addDays(original.start, dayDiff),
        end: addDays(original.end, dayDiff),
      });
    }
  };

  // ── Resize commit ──────────────────────────────────────────────────────
  const handleEventResizeEnd = (id: string, newEnd: Date) => {
    const event = events.find((e) => e.id === id);
    if (event) {
      onEventChange?.({ ...event, end: newEnd });
    }
  };

  // ── DragOverlay: floating clone while dragging ─────────────────────────
  // We create a minimal PositionedEvent for the overlay. Layout percentages
  // don't matter here since the overlay is rendered at cursor position.
  const overlayPositioned: PositionedEvent | null = draggedEvent
    ? {
        ...draggedEvent,
        color: draggedEvent.color ?? pickColor(draggedEvent.id),
        topPercent: 0,
        heightPercent: 0,
        leftPercent: 0,
        widthPercent: 100,
      }
    : null;

  // ── View rendering ─────────────────────────────────────────────────────
  // TimeGrid passes (start, end) to onSlotClick; we adapt to openAddModal({start,end})
  const handleSlotClick = (start: Date, end: Date) => openAddModal({ start, end });

  const sharedTimeGridProps = {
    events,
    hourHeight,
    startHour,
    endHour,
    onEventClick: openEditModal,
    onEventResizeEnd: handleEventResizeEnd,
    onSlotClick: handleSlotClick,
    onColumnWidthChange: (px: number) => {
      gridMetrics.current.columnWidth = px;
    },
  };

  return (
    <div className={`rss-root ${className}`.trim()}>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ── Navigation header ──────────────────────────────────── */}
        <Header
          view={view}
          date={date}
          onViewChange={handleViewChange}
          onDateChange={handleDateChange}
        />

        {/* ── Active view ────────────────────────────────────────── */}
        {view === 'day' && <DayView date={date} {...sharedTimeGridProps} />}
        {view === 'week' && <WeekView date={date} {...sharedTimeGridProps} />}
        {view === 'month' && (
          <MonthView
            date={date}
            events={events}
            onEventClick={openEditModal}
            onSlotClick={handleSlotClick}
          />
        )}

        {/* ── Floating drag preview ──────────────────────────────── */}
        {overlayPositioned && (
          <DragOverlay>
            <div
              className="rss-drag-overlay"
              style={{
                // Give the overlay a fixed height so it looks natural
                height: hourHeight * 1.5,
                width: view === 'day' ? '100%' : 120,
              }}
            >
              <div
                className="rss-event"
                style={{
                  position: 'relative',
                  height: '100%',
                  background: overlayPositioned.color,
                  opacity: 0.9,
                  top: 0,
                  left: 0,
                  width: '100%',
                  boxShadow: '0 8px 24px rgb(0 0 0 / 0.2)',
                }}
              >
                <div className="rss-event-title">{overlayPositioned.title}</div>
                <div className="rss-event-time">
                  {format(overlayPositioned.start, 'h:mm a')}
                </div>
              </div>
            </div>
          </DragOverlay>
        )}
      </DndContext>

      {/* ── Add / Edit modal (outside DndContext to avoid z-index issues) */}
      {isModalOpen && (
        <EventModal
          event={editingEvent}
          initialStart={pendingSlot?.start}
          initialEnd={pendingSlot?.end}
          onSave={handleModalSave}
          onDelete={editingEvent ? handleModalDelete : undefined}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
