import React, { useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
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
import { useBreakpoint } from './hooks/useBreakpoint';
import { snapMinutes } from './utils/dateUtils';
import { pickColor } from './utils/eventUtils';

const DEFAULT_HOUR_HEIGHT = 64;
const DEFAULT_START_HOUR = 0;
const DEFAULT_END_HOUR = 24;

export const Scheduler: React.FC<SchedulerProps> = ({
  events,
  view: viewProp,
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
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';

  // Uncontrolled fallbacks — mobile defaults to day view, tablet/desktop to week.
  const [internalView, setInternalView] = useState(() => {
    if (viewProp !== undefined) return viewProp;
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 'day' as const;
    return 'week' as const;
  });
  const [internalDate, setInternalDate] = useState(dateProp ?? new Date());

  const view = viewProp !== undefined ? viewProp : internalView;
  const date = dateProp ?? internalDate;

  const handleViewChange = (v: typeof view) => {
    setInternalView(v);
    onViewChange?.(v);
  };

  const handleDateChange = (d: Date) => {
    setInternalDate(d);
    onDateChange?.(d);
  };

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

  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const gridMetrics = useRef<GridMetrics>({ hourHeight, columnWidth: 0 });
  gridMetrics.current.hourHeight = hourHeight;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  const handleDragStart = (dndEvent: DragStartEvent) => {
    const data = dndEvent.active.data.current;
    if (data?.type === 'event') setDraggedEvent(data.event as CalendarEvent);
  };

  const handleDragEnd = (dndEvent: DragEndEvent) => {
    const { delta } = dndEvent;
    const data = dndEvent.active.data.current;
    setDraggedEvent(null);

    if (!data || data.type !== 'event') return;
    const original = data.event as CalendarEvent;

    if (view === 'day' || view === 'week') {
      const minutesDelta = snapMinutes((delta.y / gridMetrics.current.hourHeight) * 60);

      let daysDelta = 0;
      if (view === 'week' && gridMetrics.current.columnWidth > 0) {
        daysDelta = Math.round(delta.x / gridMetrics.current.columnWidth);
      }

      if (minutesDelta === 0 && daysDelta === 0) return;

      const newStart = addMinutes(addDays(original.start, daysDelta), minutesDelta);
      const newEnd = addMinutes(addDays(original.end, daysDelta), minutesDelta);

      const startBound = startHour * 60;
      const endBound = endHour * 60;
      const newStartMins = newStart.getHours() * 60 + newStart.getMinutes();
      const newEndMins = newEnd.getHours() * 60 + newEnd.getMinutes();
      if (newStartMins < startBound || newEndMins > endBound) return;

      onEventChange?.({ ...original, start: newStart, end: newEnd });
      return;
    }

    if (view === 'month') {
      const over = dndEvent.over;
      if (!over?.data?.current?.date) return;

      const targetDay = over.data.current.date as Date;
      const startOfOriginalDay = new Date(original.start);
      startOfOriginalDay.setHours(0, 0, 0, 0);
      const startOfTargetDay = new Date(targetDay);
      startOfTargetDay.setHours(0, 0, 0, 0);

      const dayDiff = Math.round(
        (startOfTargetDay.getTime() - startOfOriginalDay.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (dayDiff === 0) return;

      onEventChange?.({
        ...original,
        start: addDays(original.start, dayDiff),
        end: addDays(original.end, dayDiff),
      });
    }
  };

  const handleEventResizeEnd = (id: string, newEnd: Date) => {
    const event = events.find((e) => e.id === id);
    if (event) onEventChange?.({ ...event, end: newEnd });
  };

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
        <Header
          view={view}
          date={date}
          isMobile={isMobile}
          onViewChange={handleViewChange}
          onDateChange={handleDateChange}
        />

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

        {overlayPositioned && (
          <DragOverlay>
            <div
              className="rss-drag-overlay"
              style={{
                height: isMobile ? hourHeight * 1.2 : hourHeight * 1.5,
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
