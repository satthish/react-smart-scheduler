import { useState, useCallback } from 'react';
import type { CalendarEvent } from '../types';

/**
 * Internal hook that owns the UI-only state for the scheduler:
 * - The "add / edit" modal open state
 * - Which event is being edited (if any)
 * - The pending slot when a user clicks an empty time cell
 *
 * This is deliberately kept separate from the business state
 * (events, view, date) which is always controlled by the parent.
 */

export interface PendingSlot {
  start: Date;
  end: Date;
}

interface UseSchedulerOptions {
  onEventAdd?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventChange?: (event: CalendarEvent) => void;
  onEventDelete?: (id: string) => void;
}

export function useScheduler(options: UseSchedulerOptions) {
  const { onEventAdd, onEventChange, onEventDelete } = options;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null);

  // ── Open modal for EDITING an existing event ──────────────────────────────
  const openEditModal = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setPendingSlot(null);
    setIsModalOpen(true);
  }, []);

  // ── Open modal for CREATING a new event from a clicked slot ──────────────
  const openAddModal = useCallback((slot: PendingSlot) => {
    setEditingEvent(null);
    setPendingSlot(slot);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setPendingSlot(null);
  }, []);

  // ── Modal form submit ─────────────────────────────────────────────────────
  const handleModalSave = useCallback(
    (data: { title: string; start: Date; end: Date; color?: string }) => {
      if (editingEvent) {
        onEventChange?.({ ...editingEvent, ...data });
      } else {
        onEventAdd?.(data);
      }
      closeModal();
    },
    [editingEvent, onEventChange, onEventAdd, closeModal],
  );

  const handleModalDelete = useCallback(() => {
    if (editingEvent) {
      onEventDelete?.(editingEvent.id);
    }
    closeModal();
  }, [editingEvent, onEventDelete, closeModal]);

  return {
    isModalOpen,
    editingEvent,
    pendingSlot,
    openEditModal,
    openAddModal,
    closeModal,
    handleModalSave,
    handleModalDelete,
  };
}
