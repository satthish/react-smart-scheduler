import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '../types';
import { EVENT_COLORS } from '../utils/eventUtils';

interface EventModalProps {
  /** Existing event being edited, or null when creating a new one */
  event: CalendarEvent | null;
  /** Pre-filled start/end when creating from an empty slot click */
  initialStart?: Date;
  initialEnd?: Date;
  onSave: (data: { title: string; start: Date; end: Date; color?: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

/** Format a Date into a value suitable for <input type="datetime-local"> */
function toDateTimeLocal(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

/** Parse a datetime-local string back to a Date */
function fromDateTimeLocal(s: string): Date {
  return new Date(s);
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  initialStart,
  initialEnd,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEditing = event !== null;
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(event?.title ?? '');
  const [start, setStart] = useState(
    toDateTimeLocal(event?.start ?? initialStart ?? new Date()),
  );
  const [end, setEnd] = useState(
    toDateTimeLocal(event?.end ?? initialEnd ?? new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [color, setColor] = useState(event?.color ?? EVENT_COLORS[0]);

  // Auto-focus the title field when the modal opens
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      start: fromDateTimeLocal(start),
      end: fromDateTimeLocal(end),
      color,
    });
  };

  return (
    // Backdrop — click outside to close
    <div
      className="rss-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit event' : 'New event'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rss-modal">
        <h3 className="rss-modal-title">{isEditing ? 'Edit Event' : 'New Event'}</h3>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          {/* Title */}
          <div className="rss-form-group">
            <label className="rss-label" htmlFor="rss-event-title">
              Title
            </label>
            <input
              id="rss-event-title"
              ref={titleRef}
              className="rss-input"
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Start / End */}
          <div className="rss-form-row">
            <div className="rss-form-group">
              <label className="rss-label" htmlFor="rss-event-start">
                Start
              </label>
              <input
                id="rss-event-start"
                className="rss-input"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>

            <div className="rss-form-group">
              <label className="rss-label" htmlFor="rss-event-end">
                End
              </label>
              <input
                id="rss-event-end"
                className="rss-input"
                type="datetime-local"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Color palette */}
          <div className="rss-form-group">
            <span className="rss-label">Color</span>
            <div className="rss-color-row" role="radiogroup" aria-label="Event color">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === color}
                  aria-label={`Color ${c}`}
                  className={`rss-color-swatch ${c === color ? 'rss-color-swatch--selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rss-modal-actions">
            {isEditing && onDelete && (
              <div className="rss-modal-actions-left">
                <button
                  type="button"
                  className="rss-btn rss-btn--danger"
                  onClick={onDelete}
                >
                  Delete
                </button>
              </div>
            )}
            <button type="button" className="rss-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="rss-btn rss-btn--primary">
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
