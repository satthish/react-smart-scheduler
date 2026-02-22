import React, { useCallback, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addMinutes } from 'date-fns';
import type { CalendarEvent, DraggableEventData, PositionedEvent } from '../types';
import { formatEventTime } from '../utils/dateUtils';
import { snapMinutes } from '../utils/dateUtils';
import { pickColor } from '../utils/eventUtils';

interface EventItemProps {
  event: PositionedEvent;
  hourHeight: number;
  /** Total height of the grid in px — used to clamp resize */
  gridHeight: number;
  onClick: (event: CalendarEvent) => void;
  onResizeEnd: (id: string, newEnd: Date) => void;
  /** When true the item is rendered as a floating DragOverlay clone */
  isOverlay?: boolean;
}

/**
 * Renders a single event chip inside the time grid.
 *
 * Drag: handled by dnd-kit's useDraggable — the transform is applied
 *       only as a CSS property so the original position is preserved
 *       and the overlay takes care of the visual.
 *
 * Resize: handled entirely with Pointer Capture so the user can drag
 *         outside the element without losing the handle. We track a
 *         local previewEnd so the chip updates live during the resize,
 *         then commit via onResizeEnd on pointerup.
 */
export const EventItem: React.FC<EventItemProps> = ({
  event,
  hourHeight,
  gridHeight,
  onClick,
  onResizeEnd,
  isOverlay = false,
}) => {
  const color = event.color ?? pickColor(event.id);

  // ── Drag setup (dnd-kit) ───────────────────────────────────────────────
  const draggableData: DraggableEventData = { type: 'event', event };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: draggableData,
    // Disable dragging while the user is resizing (handled separately)
    disabled: isOverlay,
  });

  // ── Resize state (local preview) ──────────────────────────────────────
  const [resizePreviewEnd, setResizePreviewEnd] = useState<Date | null>(null);
  const isResizing = useRef(false);

  const displayEnd = resizePreviewEnd ?? event.end;

  // ── Resize pointer handler ────────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't start a resize if a drag is in progress
      if (isDragging) return;

      e.preventDefault();
      e.stopPropagation(); // prevent click-to-open-modal from firing

      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId); // capture all future events

      const startY = e.clientY;
      const originalEnd = event.end;
      isResizing.current = true;

      const onPointerMove = (moveEvt: PointerEvent) => {
        const deltaY = moveEvt.clientY - startY;
        const deltaMins = snapMinutes((deltaY / hourHeight) * 60);
        const candidate = addMinutes(originalEnd, deltaMins);
        // Minimum event duration: 15 minutes
        const minEnd = addMinutes(event.start, 15);
        setResizePreviewEnd(candidate > minEnd ? candidate : minEnd);
      };

      const onPointerUp = (upEvt: PointerEvent) => {
        const deltaY = upEvt.clientY - startY;
        const deltaMins = snapMinutes((deltaY / hourHeight) * 60);
        const candidate = addMinutes(originalEnd, deltaMins);
        const minEnd = addMinutes(event.start, 15);
        const finalEnd = candidate > minEnd ? candidate : minEnd;

        onResizeEnd(event.id, finalEnd);
        setResizePreviewEnd(null);
        isResizing.current = false;

        handle.removeEventListener('pointermove', onPointerMove);
        handle.removeEventListener('pointerup', onPointerUp);
      };

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
    },
    [event, hourHeight, isDragging, onResizeEnd],
  );

  // ── Derived styles ────────────────────────────────────────────────────

  // Recalculate height if resizing locally
  const totalGridMins = gridHeight / hourHeight * 60;
  let heightPercent = event.heightPercent;
  if (resizePreviewEnd) {
    const startMins = (event.start.getHours() * 60 + event.start.getMinutes());
    const endMins = (displayEnd.getHours() * 60 + displayEnd.getMinutes());
    const durationMins = Math.max(15, endMins - startMins);
    heightPercent = (durationMins / totalGridMins) * 100;
  }

  const style: React.CSSProperties = {
    top: `${event.topPercent}%`,
    height: `${heightPercent}%`,
    left: `calc(${event.leftPercent}% + 2px)`,
    width: `calc(${event.widthPercent}% - 4px)`,
    background: color,
    // Apply dnd-kit's drag transform (identity when not dragging)
    transform: CSS.Translate.toString(transform),
    // Overlap: events at higher column indices sit slightly higher
    zIndex: isOverlay ? 100 : isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={[
        'rss-event',
        isDragging ? 'rss-event--dragging' : '',
        isResizing.current ? 'rss-event--resizing' : '',
        isOverlay ? 'rss-event--overlay' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      // Drag listeners from dnd-kit
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(displayEnd)}`}
      onClick={(e) => {
        // Don't open modal when drag ends on same element
        if (isDragging) return;
        e.stopPropagation();
        onClick(event);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event);
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Keyboard shortcut hint — modal will offer delete
          onClick(event);
        }
      }}
    >
      <div className="rss-event-title">{event.title}</div>
      <div className="rss-event-time">
        {formatEventTime(event.start)} – {formatEventTime(displayEnd)}
      </div>

      {/* Resize handle — only visible on hover via CSS */}
      {!isOverlay && (
        <div
          className="rss-event-resize-handle"
          aria-hidden="true"
          onPointerDown={handleResizePointerDown}
          // Stop drag-start from firing when grabbing the resize handle
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
};
