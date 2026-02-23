/**
 * react-smart-scheduler — Demo playground
 *
 * This file is intentionally written the same way a real consumer would
 * integrate the library: no internal imports, no magic, just the public API.
 *
 * Features showcased:
 *  • Day / Week / Month views
 *  • Adding events (click empty slot → modal)
 *  • Moving events (drag & drop, including touch)
 *  • Resizing events (drag bottom handle)
 *  • Controlled state from a parent component
 *  • Responsive: mobile defaults to Day view; tablet/desktop to Week view
 *  • Mobile action bar (replaces hidden sidebar on small screens)
 *  • Event activity log
 */
import React, { useState } from 'react';
import {
  Scheduler,
  CalendarEvent,
  ViewType,
  generateId,
  EVENT_COLORS,
  VERSION,
  useBreakpoint,
} from 'react-smart-scheduler';

// ── Seed events ──────────────────────────────────────────────────────────────

function makeDate(offsetDays: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const SEED_EVENTS: CalendarEvent[] = [
  { id: generateId(), title: 'Team standup',     start: makeDate(0,  9, 0),  end: makeDate(0,  9, 30), color: '#3b82f6' },
  { id: generateId(), title: 'Product review',   start: makeDate(0,  11, 0), end: makeDate(0,  12, 0), color: '#8b5cf6' },
  { id: generateId(), title: 'Lunch break',       start: makeDate(0,  12,30), end: makeDate(0,  13,30), color: '#10b981' },
  { id: generateId(), title: 'Sprint planning',  start: makeDate(1,  10, 0), end: makeDate(1,  12, 0), color: '#f59e0b' },
  { id: generateId(), title: 'Design sync',      start: makeDate(1,  14, 0), end: makeDate(1,  15, 0), color: '#ef4444' },
  { id: generateId(), title: 'Code review',      start: makeDate(1,  14,30), end: makeDate(1,  16, 0), color: '#06b6d4' },
  { id: generateId(), title: '1:1 with manager', start: makeDate(2,  15, 0), end: makeDate(2,  15,45), color: '#f97316' },
  { id: generateId(), title: 'Client call',      start: makeDate(-1, 13, 0), end: makeDate(-1, 14, 0), color: '#84cc16' },
  { id: generateId(), title: 'Retro',            start: makeDate(3,  16, 0), end: makeDate(3,  17, 0), color: '#8b5cf6' },
];

// ── Support links ─────────────────────────────────────────────────────────────
const LINKS = {
  github:     'https://github.com/satthish/react-smart-scheduler',
  bmc:        'https://buymeacoffee.com/sathish.hazhtech',
  sponsors:   'https://github.com/sponsors/satthish',
  npm:        'https://www.npmjs.com/package/react-smart-scheduler',
  issues:     'https://github.com/satthish/react-smart-scheduler/issues',
};

// ── Full-width donate top bar ─────────────────────────────────────────────────

const DonateTopBar: React.FC = () => (
  <div className="demo-topnav" role="banner">
    <div className="demo-topnav-left">
      <span className="demo-topnav-heart" aria-hidden="true">❤️</span>
      <span className="demo-topnav-msg">
        <strong>react-smart-scheduler</strong> is free &amp; open-source — if it saves you time, please support the project!
      </span>
    </div>
    <div className="demo-topnav-btns">
      <a
        href={LINKS.bmc}
        target="_blank"
        rel="noopener noreferrer"
        className="demo-topnav-btn demo-topnav-btn--bmc"
        aria-label="Buy Me a Coffee"
      >
        ☕ Buy me a coffee
      </a>
      <a
        href={LINKS.sponsors}
        target="_blank"
        rel="noopener noreferrer"
        className="demo-topnav-btn demo-topnav-btn--gh"
        aria-label="GitHub Sponsors"
      >
        🩷 GitHub Sponsors
      </a>
    </div>
  </div>
);

// ── Mobile action bar ─────────────────────────────────────────────────────────
// Shown at the bottom of the screen on small screens instead of the sidebar.
// Gives quick access to the most common playground actions.

interface MobileBarProps {
  logCount: number;
  onAdd: () => void;
  onReset: () => void;
  onClear: () => void;
}

const MobileBar: React.FC<MobileBarProps> = ({ logCount, onAdd, onReset, onClear }) => (
  <div className="demo-mobile-bar" role="toolbar" aria-label="Quick actions">
    <button className="demo-mobile-btn demo-mobile-btn--primary" onClick={onAdd}>
      <span aria-hidden="true">＋</span> Add
    </button>
    <button className="demo-mobile-btn" onClick={onReset}>
      <span aria-hidden="true">↺</span> Reset
    </button>
    <button className="demo-mobile-btn" onClick={onClear}>
      <span aria-hidden="true">✕</span> Clear
    </button>
    <a
      href={LINKS.github}
      target="_blank"
      rel="noopener noreferrer"
      className="demo-mobile-btn demo-mobile-btn--link"
      title="GitHub"
    >
      <GithubIcon /> {logCount > 0 && <span className="demo-mobile-badge">{logCount}</span>}
    </a>
  </div>
);

// ── App ──────────────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  const breakpoint = useBreakpoint();
  const isMobile   = breakpoint === 'mobile';
  const isTablet   = breakpoint === 'tablet';

  const [events, setEvents] = useState<CalendarEvent[]>(SEED_EVENTS);
  const [log,    setLog]    = useState<string[]>([]);

  // ── Responsive view default ────────────────────────────────────────────────
  // Mobile → Day view (single column fits narrow screens perfectly)
  // Tablet / Desktop → Week view (shows the full week at a glance)
  const [view, setView] = useState<ViewType>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'day' : 'week'
  );
  const [date, setDate] = useState(new Date());

  const addLog = (msg: string) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);

  // ── Event handlers (mirrors real-world consumer code) ──────────────────────

  const handleEventAdd = (partial: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...partial, id: generateId() };
    setEvents((prev) => [...prev, newEvent]);
    addLog(`✅ Created: "${newEvent.title}"`);
  };

  const handleEventChange = (updated: CalendarEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addLog(`✏️  Updated: "${updated.title}"`);
  };

  const handleEventDelete = (id: string) => {
    const evt = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    addLog(`🗑️  Deleted: "${evt?.title ?? id}"`);
  };

  // ── Quick-add helper ───────────────────────────────────────────────────────

  const addQuickEvent = () => {
    const titles = ['Meeting', 'Review', 'Sync', 'Call', 'Workshop', 'Demo', 'Interview'];
    const title  = titles[Math.floor(Math.random() * titles.length)];
    const color  = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
    const start  = new Date();
    start.setMinutes(0, 0, 0);
    const end    = new Date(start.getTime() + 60 * 60 * 1000);
    handleEventAdd({ title, start, end, color });
  };

  const resetToSeed = () => { setEvents(SEED_EVENTS); addLog('🔄 Reset to seed data'); };
  const clearAll    = () => { setEvents([]);           addLog('🧹 Cleared all events'); };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="demo-layout">

      {/* ── Full-width donate bar at the very top ──────────────── */}
      <DonateTopBar />

      {/* ── Horizontal body: sidebar + main ───────────────────── */}
      <div className="demo-body">

        {/* ── Sidebar (hidden on mobile, shown on tablet+) ──────── */}
        <aside className="demo-sidebar" aria-label="Demo controls">

          {/* Logo / title */}
          <div className="demo-logo">
            <span className="demo-logo-icon" aria-hidden="true">📅</span>
            <div>
              <div className="demo-logo-name">react-smart-scheduler</div>
              <div className="demo-logo-version">v{VERSION} — live demo</div>
            </div>
          </div>

          {/* External links */}
          <div className="demo-links">
            <a href={LINKS.github}  target="_blank" rel="noopener noreferrer" className="demo-link" title="View on GitHub">
              <GithubIcon /> GitHub
            </a>
            <a href={LINKS.npm}     target="_blank" rel="noopener noreferrer" className="demo-link" title="View on npm">
              <NpmIcon /> npm
            </a>
            <a href={LINKS.issues}  target="_blank" rel="noopener noreferrer" className="demo-link" title="Report a bug">
              🐛 Issues
            </a>
          </div>

          {/* Actions */}
          <div className="demo-section">
            <h3 className="demo-section-title">Playground actions</h3>
            <button className="demo-action-btn" onClick={addQuickEvent}>
              + Add random event
            </button>
            <button
              className="demo-action-btn demo-action-btn--secondary"
              onClick={clearAll}
            >
              Clear all events
            </button>
            <button
              className="demo-action-btn demo-action-btn--secondary"
              onClick={resetToSeed}
            >
              Reset to seed data
            </button>
          </div>

          {/* Event activity log */}
          <div className="demo-section demo-section--grow">
            <h3 className="demo-section-title">Activity log</h3>
            <div className="demo-log" aria-live="polite" aria-label="Event activity log">
              {log.length === 0 && (
                <p className="demo-log-empty">
                  Interact with the calendar to see activity here.
                </p>
              )}
              {log.map((entry, i) => (
                <div key={i} className="demo-log-entry">{entry}</div>
              ))}
            </div>
          </div>

          {/* Usage snippet */}
          <div className="demo-section">
            <h3 className="demo-section-title">Usage</h3>
            <pre className="demo-code" aria-label="Usage example">{`<Scheduler
  events={events}
  view={view}
  date={date}
  onEventAdd={handleAdd}
  onEventChange={handleChange}
  onEventDelete={handleDelete}
  onViewChange={setView}
  onDateChange={setDate}
/>`}</pre>
          </div>

        </aside>

        {/* ── Main scheduler ────────────────────────────────────── */}
        <main className="demo-main" aria-label="Scheduler demo">
          {/* Tips bar — hidden on mobile to save vertical space */}
          <div className="demo-topbar">
            <div className="demo-tips">
              <span>💡</span>
              {isMobile || isTablet ? (
                <span><strong>Tap</strong> an empty slot to add · <strong>Drag</strong> to move</span>
              ) : (
                <span><strong>Click</strong> an empty slot to add · <strong>Drag</strong> to move · <strong>Drag bottom edge</strong> to resize</span>
              )}
            </div>
          </div>

          <Scheduler
            events={events}
            view={view}
            date={date}
            onEventAdd={handleEventAdd}
            onEventChange={handleEventChange}
            onEventDelete={handleEventDelete}
            onViewChange={setView}
            onDateChange={setDate}
            hourHeight={64}
            startHour={0}
            endHour={24}
          />
        </main>
      </div>

      {/* ── Mobile action bar (visible only on small screens) ───── */}
      {/* Provides quick access to playground actions when the sidebar is hidden. */}
      <MobileBar
        logCount={log.length}
        onAdd={addQuickEvent}
        onReset={resetToSeed}
        onClear={clearAll}
      />
    </div>
  );
};

// ── Inline SVG icons (zero dependencies) ─────────────────────────────────────

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const NpmIcon = () => (
  <svg width="16" height="14" viewBox="0 0 18 7" fill="currentColor" aria-hidden="true">
    <path d="M0 0h18v6H9V7H5V6H0V0zm1 5h2V2h1v3h1V1H1v4zm5-4v5h2V5h2V1H6zm2 1h1v2H8V2zm3-1v4h2V2h1v3h1V2h1v3h1V1h-6z"/>
  </svg>
);
