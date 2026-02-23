// ─────────────────────────────────────────────────────────────────────────────
// react-smart-scheduler — public API
// ─────────────────────────────────────────────────────────────────────────────

export const VERSION = '0.1.3' as const;

export { Scheduler } from './Scheduler';

export type { CalendarEvent, SchedulerProps, ViewType } from './types';

export { generateId }   from './utils/eventUtils';
export { EVENT_COLORS } from './utils/eventUtils';
export { pickColor }    from './utils/eventUtils';

export { useBreakpoint } from './hooks/useBreakpoint';
export type { Breakpoint } from './hooks/useBreakpoint';
