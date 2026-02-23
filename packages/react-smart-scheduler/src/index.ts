// ─────────────────────────────────────────────────────────────────────────────
// react-smart-scheduler — public API
//
// Import rules:
//   ✅  import { Scheduler } from 'react-smart-scheduler'
//   ✅  import type { CalendarEvent } from 'react-smart-scheduler'
//   ✅  import 'react-smart-scheduler/dist/scheduler.css'
//
// NEVER import from internal paths like 'react-smart-scheduler/src/...'
// — those paths are not part of the stable API and may change without notice.
// ─────────────────────────────────────────────────────────────────────────────

/** Library version — matches package.json version field. */
export const VERSION = '0.1.2' as const;

// ── Root component ────────────────────────────────────────────────────────────
export { Scheduler } from './Scheduler';

// ── Types (re-exported so consumers don't need to reach into src/) ────────────
export type { CalendarEvent, SchedulerProps, ViewType } from './types';

// ── Utilities consumers commonly need ─────────────────────────────────────────

/**
 * Generate a collision-resistant id for a new CalendarEvent.
 * Use this in your onEventAdd handler:
 *
 *   onEventAdd={(partial) => {
 *     setEvents(prev => [...prev, { ...partial, id: generateId() }]);
 *   }}
 */
export { generateId } from './utils/eventUtils';

/**
 * The default colour palette used by the EventModal colour picker.
 * Expose it in your own UI if you want consistent colours across the app.
 */
export { EVENT_COLORS } from './utils/eventUtils';

/**
 * Pick a deterministic colour from the palette based on the event id.
 * Useful when pre-assigning colours to events before they are created.
 */
export { pickColor } from './utils/eventUtils';

// ── Responsive utilities ──────────────────────────────────────────────────────

/**
 * React hook that returns the current responsive breakpoint and re-renders
 * whenever the window crosses a threshold.
 *
 *   'mobile'  — < 640 px   (phones)
 *   'tablet'  — 640–1023 px (tablets, small laptops)
 *   'desktop' — ≥ 1024 px  (standard laptop / desktop)
 *
 * Useful for driving responsive defaults in the consuming application,
 * e.g. defaulting to `view="day"` on mobile.
 *
 *   const bp = useBreakpoint();
 *   const [view, setView] = useState(bp === 'mobile' ? 'day' : 'week');
 */
export { useBreakpoint } from './hooks/useBreakpoint';
export type { Breakpoint } from './hooks/useBreakpoint';
