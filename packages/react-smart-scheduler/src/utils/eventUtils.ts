import { differenceInMinutes, isSameDay, startOfDay } from 'date-fns';
import type { CalendarEvent, PositionedEvent } from '../types';
import { dateToGridMinutes, totalGridMinutes } from './dateUtils';

// ── Event filtering ─────────────────────────────────────────────────────────

/** Events that overlap the given calendar day. */
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => {
    // Whole-day overlap: event starts before day ends AND ends after day starts
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return e.start < dayEnd && e.end > dayStart;
  });
}

// ── Layout algorithm ────────────────────────────────────────────────────────

/**
 * Computes absolute CSS percentages for each event so that overlapping
 * events are displayed side-by-side without collisions.
 *
 * Algorithm:
 *  1. Sort events by start time (longer events first on ties).
 *  2. Group events into "clusters" — sets of events that all overlap.
 *  3. Within each cluster, greedily assign events to the first available
 *     column (a column is available if the last event in it has ended).
 *  4. Derive left/width percentages from column index / total columns.
 *
 * This is an O(n²) sweep which is fine for typical calendar event counts.
 */
export function positionEvents(
  events: CalendarEvent[],
  startHour: number,
  endHour: number,
): PositionedEvent[] {
  if (events.length === 0) return [];

  const gridMinutes = totalGridMinutes(startHour, endHour);

  // Step 1 – sort
  const sorted = [...events].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    if (diff !== 0) return diff;
    // Longer events get first column (more stable layout)
    return differenceInMinutes(b.end, b.start) - differenceInMinutes(a.end, a.start);
  });

  // Step 2 – cluster: group events that overlap with at least one other in the group
  const clusters: CalendarEvent[][] = [];

  for (const event of sorted) {
    let placed = false;
    for (const cluster of clusters) {
      const overlapsCluster = cluster.some((e) => eventsOverlap(e, event));
      if (overlapsCluster) {
        cluster.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push([event]);
  }

  // Step 3 & 4 – assign columns and compute CSS values
  const positioned: PositionedEvent[] = [];

  for (const cluster of clusters) {
    // Each column holds events that don't overlap each other
    const columns: CalendarEvent[][] = [];

    for (const event of cluster) {
      let assignedCol = -1;
      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];
        const tail = col[col.length - 1];
        if (!tail || tail.end <= event.start) {
          assignedCol = c;
          break;
        }
      }
      if (assignedCol === -1) {
        assignedCol = columns.length;
        columns.push([]);
      }
      columns[assignedCol].push(event);
    }

    const totalCols = columns.length;

    columns.forEach((col, colIdx) => {
      col.forEach((event) => {
        const startMin = Math.max(0, dateToGridMinutes(event.start, startHour));
        const endMin = Math.min(gridMinutes, dateToGridMinutes(event.end, startHour));
        const durationMin = Math.max(15, endMin - startMin); // minimum 15 min height

        positioned.push({
          ...event,
          topPercent: (startMin / gridMinutes) * 100,
          heightPercent: (durationMin / gridMinutes) * 100,
          leftPercent: (colIdx / totalCols) * 100,
          widthPercent: (1 / totalCols) * 100,
        });
      });
    });
  }

  return positioned;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.start < b.end && a.end > b.start;
}

/** Generate a stable unique id for a new event. */
export function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** A small palette of default event colours. */
export const EVENT_COLORS: readonly string[] = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

/** Pick a colour from the palette, cycling based on a hash of the id. */
export function pickColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

/** True when two dates fall on the same calendar day. */
export { isSameDay };
