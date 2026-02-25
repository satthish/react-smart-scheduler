import React, { useCallback, useEffect, useState } from 'react';
import {
  Scheduler,
  TailwindScheduler,
  MuiScheduler,
  CalendarEvent,
  SchedulerProps,
  ViewType,
  generateId,
  EVENT_COLORS,
  VERSION,
} from 'react-smart-scheduler';

// ─── Types ────────────────────────────────────────────────────────────────────

type Page =
  | 'overview'
  | 'api'
  | 'basic'
  | 'week-view'
  | 'day-view'
  | 'month-view'
  | 'theme-default'
  | 'theme-tailwind'
  | 'theme-mui'
  | 'privacy'
  | 'terms';

interface NavItem  { id: Page; label: string; icon: string; }
interface NavGroup { label: string; items: NavItem[]; }

// ─── Navigation structure ─────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Documentation',
    items: [
      { id: 'overview', label: 'Overview',      icon: '🏠' },
      { id: 'api',      label: 'API Reference', icon: '📖' },
    ],
  },
  {
    label: 'Examples',
    items: [
      { id: 'basic',      label: 'Basic',      icon: '📋' },
      { id: 'week-view',  label: 'Week View',  icon: '📅' },
      { id: 'day-view',   label: 'Day View',   icon: '🕐' },
      { id: 'month-view', label: 'Month View', icon: '🗓️' },
    ],
  },
  {
    label: 'Themes',
    items: [
      { id: 'theme-default',  label: 'Default',  icon: '🎨' },
      { id: 'theme-tailwind', label: 'Tailwind', icon: '💜' },
      { id: 'theme-mui',      label: 'MUI',      icon: '🔵' },
    ],
  },
  {
    label: 'Legal',
    items: [
      { id: 'privacy', label: 'Privacy Policy',   icon: '🔒' },
      { id: 'terms',   label: 'Terms of Service', icon: '📜' },
    ],
  },
];

// ─── External links ───────────────────────────────────────────────────────────

const LINKS = {
  github:   'https://github.com/satthish/react-smart-scheduler',
  npm:      'https://www.npmjs.com/package/react-smart-scheduler',
  bmc:      'https://buymeacoffee.com/sathish.hazhtech',
  sponsors: 'https://github.com/sponsors/satthish',
  issues:   'https://github.com/satthish/react-smart-scheduler/issues',
  hazhtech: 'https://hazhtech.com',
};

// ─── Seed events ──────────────────────────────────────────────────────────────

function makeDate(offsetDays: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const SEED_EVENTS: CalendarEvent[] = [
  { id: generateId(), title: 'Team standup',    start: makeDate(0,  9, 0),  end: makeDate(0,  9, 30), color: '#3b82f6' },
  { id: generateId(), title: 'Product review',  start: makeDate(0,  11, 0), end: makeDate(0,  12, 0), color: '#8b5cf6' },
  { id: generateId(), title: 'Lunch break',     start: makeDate(0,  12,30), end: makeDate(0,  13,30), color: '#10b981' },
  { id: generateId(), title: 'Sprint planning', start: makeDate(1,  10, 0), end: makeDate(1,  12, 0), color: '#f59e0b' },
  { id: generateId(), title: 'Design sync',     start: makeDate(1,  14, 0), end: makeDate(1,  15, 0), color: '#ef4444' },
  { id: generateId(), title: 'Code review',     start: makeDate(1,  14,30), end: makeDate(1,  16, 0), color: '#06b6d4' },
  { id: generateId(), title: '1:1 meeting',     start: makeDate(2,  15, 0), end: makeDate(2,  15,45), color: '#f97316' },
  { id: generateId(), title: 'Client call',     start: makeDate(-1, 13, 0), end: makeDate(-1, 14, 0), color: '#84cc16' },
  { id: generateId(), title: 'Retrospective',   start: makeDate(3,  16, 0), end: makeDate(3,  17, 0), color: '#8b5cf6' },
];

// ─── Hazhtech Logo ────────────────────────────────────────────────────────────
// SVG approximation of the Hazhtech logo mark:
//   top-left:     pink cross   |  top-right: purple hook ┐  |  teal dot
//   bottom-left:  purple hook └  |  bottom-right: orange cross  |  teal dot

const LogoMark: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    {/* Pink cross — top-left */}
    <rect x="2"  y="9"  width="16" height="6"  rx="3" fill="#F72585" />
    <rect x="7"  y="3"  width="6"  height="16" rx="3" fill="#F72585" />
    {/* Purple hook ┐ — top-right */}
    <rect x="20" y="4"  width="16" height="6"  rx="3" fill="#7209B7" />
    <rect x="30" y="4"  width="6"  height="14" rx="3" fill="#7209B7" />
    {/* Teal dot — far top-right */}
    <circle cx="44" cy="5" r="4" fill="#4CC9F0" />
    {/* Purple hook └ — bottom-left */}
    <rect x="2"  y="38" width="16" height="6"  rx="3" fill="#7209B7" />
    <rect x="2"  y="28" width="6"  height="16" rx="3" fill="#7209B7" />
    {/* Orange cross — bottom-right */}
    <rect x="26" y="30" width="16" height="6"  rx="3" fill="#FB8500" />
    <rect x="31" y="25" width="6"  height="16" rx="3" fill="#FB8500" />
    {/* Teal dot — far bottom-left */}
    <circle cx="4" cy="44" r="4" fill="#4CC9F0" />
  </svg>
);

const SidebarLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className={`sb-logo ${collapsed ? 'sb-logo--collapsed' : ''}`}>
    <LogoMark />
    {!collapsed && (
      <div className="sb-logo-text">
        <span className="sb-logo-name">Hazhtech</span>
        <span className="sb-logo-pkg">react-smart-scheduler</span>
      </div>
    )}
  </div>
);

// ─── Canvas story page ────────────────────────────────────────────────────────

interface CanvasPageProps {
  title: string;
  description: string;
  code: string;
  events: CalendarEvent[];
  onEventAdd: (e: Omit<CalendarEvent, 'id'>) => void;
  onEventChange: (e: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  defaultView?: ViewType;
  extraProps?: Partial<SchedulerProps>;
  SchedulerComp?: React.ComponentType<SchedulerProps>;
}

const CanvasPage: React.FC<CanvasPageProps> = ({
  title, description, code,
  events, onEventAdd, onEventChange, onEventDelete,
  defaultView = 'week',
  extraProps = {},
  SchedulerComp = Scheduler,
}) => {
  const [view,   setView]   = useState<ViewType>(defaultView);
  const [date,   setDate]   = useState(() => new Date());
  const [tab,    setTab]    = useState<'canvas' | 'code'>('canvas');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sb-page">
      <div className="sb-story-header">
        <div>
          <h1 className="sb-story-title">{title}</h1>
          <p className="sb-story-desc">{description}</p>
        </div>
        <div className="sb-tabs" role="tablist">
          <button className={`sb-tab ${tab === 'canvas' ? 'sb-tab--active' : ''}`} onClick={() => setTab('canvas')} role="tab" aria-selected={tab === 'canvas'}>Canvas</button>
          <button className={`sb-tab ${tab === 'code'   ? 'sb-tab--active' : ''}`} onClick={() => setTab('code')}   role="tab" aria-selected={tab === 'code'}>Code</button>
        </div>
      </div>

      {tab === 'canvas' ? (
        <>
          <div className="sb-canvas">
            <SchedulerComp
              events={events}
              view={view}
              date={date}
              onEventAdd={onEventAdd}
              onEventChange={onEventChange}
              onEventDelete={onEventDelete}
              onViewChange={setView}
              onDateChange={setDate}
              {...extraProps}
            />
          </div>
          <div className="sb-panel">
            <div className="sb-panel-hdr">
              <span className="sb-panel-label">Code snippet</span>
              <button className="sb-copy-btn" onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy'}</button>
            </div>
            <pre className="sb-code"><code>{code}</code></pre>
          </div>
        </>
      ) : (
        <div className="sb-code-view">
          <div className="sb-panel-hdr">
            <span className="sb-panel-label">Full code</span>
            <button className="sb-copy-btn" onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy'}</button>
          </div>
          <pre className="sb-code sb-code--full"><code>{code}</code></pre>
        </div>
      )}
    </div>
  );
};

// ─── Overview page ────────────────────────────────────────────────────────────

const OverviewPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--docs">
      <div>
        <h1 className="sb-story-title">Overview</h1>
        <p className="sb-story-desc">A production-ready, open-source React scheduler component library by Hazhtech.</p>
      </div>
      <div className="sb-donate-row">
        <a href={LINKS.bmc}      target="_blank" rel="noopener noreferrer" className="sb-donate-btn sb-donate-btn--bmc">☕ Buy Me a Coffee</a>
        <a href={LINKS.sponsors} target="_blank" rel="noopener noreferrer" className="sb-donate-btn sb-donate-btn--gh">🩷 Sponsors</a>
      </div>
    </div>

    <div className="sb-doc-body">
      <div className="sb-badges">
        <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/react-smart-scheduler?color=3b82f6&logo=npm&label=npm"           alt="npm" /></a>
        <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dm/react-smart-scheduler?color=10b981&label=downloads"              alt="downloads" /></a>
        <a href={LINKS.github} target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/stars/satthish/react-smart-scheduler?style=flat&color=f59e0b"   alt="stars" /></a>
        <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/bundlephobia/minzip/react-smart-scheduler?color=8b5cf6&label=gzipped"   alt="size" /></a>
      </div>

      <section className="sb-section">
        <h2>✨ Features</h2>
        <div className="sb-feat-grid">
          {[
            ['📅','Day, Week & Month views'],
            ['🖱️','Drag to move (across days & times)'],
            ['↕️','Drag bottom edge to resize'],
            ['➕','Click slot → create event modal'],
            ['📐','Concurrent event overlap layout'],
            ['🕐','"Now" line (current time indicator)'],
            ['📱','Responsive — mobile / tablet / desktop'],
            ['👆','Touch drag & drop (mobile-friendly)'],
            ['🎨','Headless · Tailwind · MUI adapter themes'],
            ['🔌','Slots API — swap Header / EventModal'],
            ['🔒','Controlled component API'],
            ['♿','Accessible (ARIA + keyboard nav)'],
            ['📝','TypeScript — fully typed'],
            ['🪶','Zero heavy UI framework deps'],
          ].map(([icon, label]) => (
            <div key={String(label)} className="sb-feat-card">
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sb-section">
        <h2>📦 Installation</h2>
        <pre className="sb-code"><code>npm install react-smart-scheduler</code></pre>
      </section>

      <section className="sb-section">
        <h2>🚀 Quick start</h2>
        <pre className="sb-code"><code>{`import { Scheduler, generateId } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';
import { useState } from 'react';

export default function App() {
  const [events, setEvents] = useState([]);

  return (
    <div style={{ height: '100vh' }}>
      <Scheduler
        events={events}
        onEventAdd={(partial) =>
          setEvents(prev => [...prev, { ...partial, id: generateId() }])
        }
        onEventChange={(updated) =>
          setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
        }
        onEventDelete={(id) =>
          setEvents(prev => prev.filter(e => e.id !== id))
        }
      />
    </div>
  );
}`}</code></pre>
      </section>

      <section className="sb-section">
        <h2>🎨 Adapter themes</h2>
        <div className="sb-theme-cards">
          {[
            { name: 'Default',  pkg: 'Scheduler',          color: '#3b82f6', desc: 'Built-in blue — zero config'       },
            { name: 'Tailwind', pkg: 'TailwindScheduler',  color: '#6366f1', desc: 'Indigo palette, Inter font'         },
            { name: 'MUI',      pkg: 'MuiScheduler',       color: '#1976d2', desc: 'Material Design, Roboto font'       },
            { name: 'Headless', pkg: 'HeadlessScheduler',  color: '#6b7280', desc: 'Bring your own CSS'                },
          ].map((t) => (
            <div key={t.name} className="sb-theme-card">
              <div className="sb-theme-dot" style={{ background: t.color }} />
              <div className="sb-theme-info">
                <strong>{t.name}</strong>
                <span>{t.desc}</span>
                <code>{"import { " + t.pkg + " } from 'react-smart-scheduler';"}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sb-section sb-section--donate">
        <h2>❤️ Support the project</h2>
        <p>react-smart-scheduler is <strong>free &amp; MIT-licensed</strong>. If it saves you development time, please consider supporting continued maintenance:</p>
        <div className="sb-support-btns">
          <a href={LINKS.bmc}      target="_blank" rel="noopener noreferrer" className="sb-donate-btn sb-donate-btn--bmc sb-donate-btn--lg">☕ Buy Me a Coffee</a>
          <a href={LINKS.sponsors} target="_blank" rel="noopener noreferrer" className="sb-donate-btn sb-donate-btn--gh  sb-donate-btn--lg">🩷 GitHub Sponsors</a>
          <a href={LINKS.github}   target="_blank" rel="noopener noreferrer" className="sb-donate-btn sb-donate-btn--star sb-donate-btn--lg">⭐ Star on GitHub</a>
        </div>
      </section>
    </div>
  </div>
);

// ─── API Reference page ───────────────────────────────────────────────────────

const ApiPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--docs">
      <div>
        <h1 className="sb-story-title">API Reference</h1>
        <p className="sb-story-desc">Props, types, hooks, and utilities — v{VERSION}.</p>
      </div>
    </div>
    <div className="sb-doc-body">
      <section className="sb-section">
        <h2>{'<Scheduler />'} props</h2>
        <div className="sb-table-wrap">
          <table className="sb-table">
            <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {([
                ['events',        'CalendarEvent[]',                       '—',          'Controlled events list (required)'],
                ['view',          "'day'|'week'|'month'",                  "'week'",     'Active calendar view'],
                ['date',          'Date',                                   'new Date()', 'Anchor date for the current view'],
                ['onEventAdd',    "(e: Omit<CalendarEvent,'id'>) => void", '—',          'Fired when user creates an event'],
                ['onEventChange', '(e: CalendarEvent) => void',            '—',          'Fired after drag-move or resize'],
                ['onEventDelete', '(id: string) => void',                  '—',          'Fired when user deletes an event'],
                ['onViewChange',  '(v: ViewType) => void',                 '—',          'Fired when view changes'],
                ['onDateChange',  '(d: Date) => void',                     '—',          'Fired on navigation'],
                ['hourHeight',    'number',                                 '64',         'Pixel height of each hour row'],
                ['startHour',     'number',                                 '0',          'First visible hour (0–23)'],
                ['endHour',       'number',                                 '24',         'Last visible hour (1–24)'],
                ['className',     'string',                                 "''",         'Extra CSS class on root element'],
                ['slots',         'SchedulerSlots',                        '—',          'Swap Header or EventModal'],
              ] as const).map(([prop, type, def, desc]) => (
                <tr key={prop}>
                  <td><code className="sb-prop">{prop}</code></td>
                  <td><code className="sb-type">{type}</code></td>
                  <td><code>{def}</code></td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sb-section">
        <h2>CalendarEvent</h2>
        <pre className="sb-code"><code>{`interface CalendarEvent {
  id:     string;   // unique identifier
  title:  string;   // displayed on the event chip
  start:  Date;     // inclusive start — must be before end
  end:    Date;     // exclusive end   — must be after start
  color?: string;   // any valid CSS colour (optional)
}`}</code></pre>
      </section>

      <section className="sb-section">
        <h2>Slots API</h2>
        <pre className="sb-code"><code>{`import { Scheduler, HeaderSlotProps } from 'react-smart-scheduler';

// Custom header component
const MyHeader: React.FC<HeaderSlotProps> = ({
  view, date, onViewChange, onDateChange, isMobile
}) => (
  // your JSX here
);

<Scheduler
  events={events}
  slots={{ Header: MyHeader }}
  {...handlers}
/>`}</code></pre>
      </section>

      <section className="sb-section">
        <h2>Utilities &amp; hooks</h2>
        <pre className="sb-code"><code>{`import {
  generateId,    // () => string — unique id for new events
  EVENT_COLORS,  // string[] — built-in 12-colour palette
  pickColor,     // (id: string) => string — deterministic colour
  useBreakpoint, // () => 'mobile' | 'tablet' | 'desktop'
  VERSION,       // '${VERSION}'
} from 'react-smart-scheduler';`}</code></pre>
      </section>

      <section className="sb-section">
        <h2>CSS custom properties</h2>
        <pre className="sb-code"><code>{`.rss-root {
  --rss-primary:        #3b82f6;  /* accent & today highlight */
  --rss-primary-light:  #eff6ff;
  --rss-border:         #e5e7eb;
  --rss-text:           #111827;
  --rss-bg:             #ffffff;
  --rss-radius:         6px;      /* container corner radius  */
  --rss-event-radius:   4px;      /* event chip corner radius */
  --rss-header-h:       56px;
  --rss-time-gutter-w:  52px;
}`}</code></pre>
      </section>
    </div>
  </div>
);

// ─── Privacy Policy page ──────────────────────────────────────────────────────

const PrivacyPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--docs">
      <div>
        <h1 className="sb-story-title">Privacy Policy</h1>
        <p className="sb-story-desc">Last updated: February 25, 2026</p>
      </div>
    </div>
    <div className="sb-doc-body sb-legal">
      <section className="sb-section"><h2>1. Introduction</h2><p>Welcome to <strong>react-smart-scheduler</strong>, an open-source React component library maintained by <strong>Hazhtech</strong>. This Privacy Policy describes how we handle information when you use our demo website at <code>scheduler.hazhtech.com</code>.</p></section>
      <section className="sb-section"><h2>2. Information We Collect</h2><p>We do not collect any personally identifiable information. The demo runs entirely in your browser — no user data is transmitted to our servers.</p><p><strong>Third-party services</strong> on this site may independently collect information:</p><ul><li><strong>Advertising networks</strong> — This site serves ads through third-party networks that may use cookies and similar tracking technologies to deliver personalised advertisements. Please review each ad network's privacy policy for details.</li><li><strong>Analytics</strong> — We may use anonymised, aggregate analytics to understand traffic patterns.</li></ul></section>
      <section className="sb-section"><h2>3. Cookies</h2><p>This site does not set first-party cookies. Third-party advertising and analytics services may set their own cookies. You can control or block cookies through your browser settings.</p></section>
      <section className="sb-section"><h2>4. npm Package</h2><p>The <code>react-smart-scheduler</code> npm package does <strong>not</strong> collect telemetry, usage data, or analytics of any kind. Installing and using the package is completely private.</p></section>
      <section className="sb-section"><h2>5. GitHub</h2><p>Source code is hosted on <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>. Interactions (stars, issues, PRs) are governed by <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub's Privacy Statement</a>.</p></section>
      <section className="sb-section"><h2>6. Children's Privacy</h2><p>This service is not directed to children under 13. We do not knowingly collect personal information from children.</p></section>
      <section className="sb-section"><h2>7. Changes</h2><p>We may update this policy. Material changes will be reflected in the "Last updated" date. Continued use of this site constitutes acceptance of the revised policy.</p></section>
      <section className="sb-section"><h2>8. Contact</h2><p>Questions? Open an issue on <a href={LINKS.issues} target="_blank" rel="noopener noreferrer">GitHub</a>.</p></section>
    </div>
  </div>
);

// ─── Terms of Service page ────────────────────────────────────────────────────

const TermsPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--docs">
      <div>
        <h1 className="sb-story-title">Terms of Service</h1>
        <p className="sb-story-desc">Last updated: February 25, 2026</p>
      </div>
    </div>
    <div className="sb-doc-body sb-legal">
      <section className="sb-section"><h2>1. Acceptance</h2><p>By accessing <code>scheduler.hazhtech.com</code> or using the <code>react-smart-scheduler</code> npm package, you agree to these Terms.</p></section>
      <section className="sb-section"><h2>2. License</h2><p><strong>react-smart-scheduler</strong> is released under the <strong>MIT License</strong>. You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software under its terms. Full license: <a href={`${LINKS.github}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">LICENSE file</a>.</p></section>
      <section className="sb-section"><h2>3. Demo Website</h2><p>The demo is provided "as is" for demonstration purposes only. We make no warranties regarding uptime, accuracy, or fitness for a particular purpose, and may modify or discontinue the demo at any time without notice.</p></section>
      <section className="sb-section"><h2>4. Intellectual Property</h2><p>The <strong>Hazhtech</strong> name and logo are owned by Hazhtech. The library source code is open-source under the MIT License. Contributors retain copyright over their contributions as defined by that license.</p></section>
      <section className="sb-section"><h2>5. Limitation of Liability</h2><p>In no event shall Hazhtech or react-smart-scheduler contributors be liable for any indirect, incidental, special, or consequential damages arising from use of the software or demo site.</p></section>
      <section className="sb-section"><h2>6. Third-Party Services</h2><p>This site links to third-party services (npm, GitHub, Buy Me a Coffee, ad networks, etc.). We are not responsible for their content, terms, or privacy practices.</p></section>
      <section className="sb-section"><h2>7. Advertising</h2><p>This demo site is supported by advertising served by third-party ad networks. By using this site, you acknowledge that ads may be displayed. Ad networks operate under their own terms and privacy policies.</p></section>
      <section className="sb-section"><h2>8. Changes</h2><p>We may update these Terms at any time. Continued use of the site or package constitutes acceptance of the revised Terms.</p></section>
      <section className="sb-section"><h2>9. Contact</h2><p>Questions? Open an issue on <a href={LINKS.issues} target="_blank" rel="noopener noreferrer">GitHub</a>.</p></section>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>(() => {
    const h = window.location.hash.slice(1) as Page;
    return h || 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1) as Page;
      if (h) setPage(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: Page) => { window.location.hash = to; setPage(to); };

  // Shared event state across all canvas stories
  const [events, setEvents] = useState<CalendarEvent[]>(SEED_EVENTS);

  const handleEventAdd    = useCallback((partial: Omit<CalendarEvent, 'id'>) => { setEvents(prev => [...prev, { ...partial, id: generateId() }]); }, []);
  const handleEventChange = useCallback((updated: CalendarEvent)              => { setEvents(prev => prev.map(e => e.id === updated.id ? updated : e)); }, []);
  const handleEventDelete = useCallback((id: string)                          => { setEvents(prev => prev.filter(e => e.id !== id)); }, []);

  const sharedProps = { events, onEventAdd: handleEventAdd, onEventChange: handleEventChange, onEventDelete: handleEventDelete };

  const addRandom = () => {
    const titles = ['Meeting', 'Review', 'Sync', 'Call', 'Workshop', 'Demo', 'Interview'];
    const title  = titles[Math.floor(Math.random() * titles.length)];
    const color  = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
    const start  = new Date(); start.setMinutes(0, 0, 0);
    handleEventAdd({ title, start, end: new Date(start.getTime() + 3600_000), color });
  };

  const isCanvasPage = !['overview', 'api', 'privacy', 'terms'].includes(page);

  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === page));
  const currentItem  = currentGroup?.items.find(i => i.id === page);

  const renderPage = () => {
    switch (page) {
      case 'overview': return <OverviewPage />;
      case 'api':      return <ApiPage />;

      case 'basic':
        return <CanvasPage title="Basic Usage" description="Minimal controlled setup — events list plus add / change / delete handlers." defaultView="week"
          code={`import { Scheduler, generateId } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

const [events, setEvents] = useState([]);

<Scheduler
  events={events}
  onEventAdd={(partial) =>
    setEvents(prev => [...prev, { ...partial, id: generateId() }])
  }
  onEventChange={(updated) =>
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
  }
  onEventDelete={(id) =>
    setEvents(prev => prev.filter(e => e.id !== id))
  }
/>`} {...sharedProps} />;

      case 'week-view':
        return <CanvasPage title="Week View" description="7-day week grid with concurrent event layout, drag-to-move, and drag-to-resize." defaultView="week"
          extraProps={{ startHour: 7, endHour: 20 }}
          code={`<Scheduler
  events={events}
  view="week"
  startHour={7}
  endHour={20}
  onEventAdd={handleAdd}
  onEventChange={handleChange}
  onEventDelete={handleDelete}
/>`} {...sharedProps} />;

      case 'day-view':
        return <CanvasPage title="Day View" description="Single-day time grid — ideal for dense hourly scheduling." defaultView="day"
          extraProps={{ hourHeight: 80 }}
          code={`<Scheduler
  events={events}
  view="day"
  hourHeight={80}
  onEventAdd={handleAdd}
  onEventChange={handleChange}
  onEventDelete={handleDelete}
/>`} {...sharedProps} />;

      case 'month-view':
        return <CanvasPage title="Month View" description="Monthly overview with drag-and-drop between days." defaultView="month"
          code={`<Scheduler
  events={events}
  view="month"
  onEventAdd={handleAdd}
  onEventChange={handleChange}
  onEventDelete={handleDelete}
/>`} {...sharedProps} />;

      case 'theme-default':
        return <CanvasPage title="Default Theme" description="Built-in blue theme — no extra configuration required." defaultView="week"
          code={`import { Scheduler } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

<Scheduler events={events} {...handlers} />`} {...sharedProps} />;

      case 'theme-tailwind':
        return <CanvasPage title="Tailwind Theme" description="Indigo palette, rounder corners, Inter font. CSS-only — no Tailwind installation required." defaultView="week"
          SchedulerComp={TailwindScheduler as React.ComponentType<SchedulerProps>}
          code={`import { TailwindScheduler } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

// Drop-in replacement — identical props to <Scheduler />
<TailwindScheduler events={events} {...handlers} />`} {...sharedProps} />;

      case 'theme-mui':
        return <CanvasPage title="MUI Theme" description="Material Design — MUI blue, Roboto font, elevation shadows. No @mui/material required." defaultView="week"
          SchedulerComp={MuiScheduler as React.ComponentType<SchedulerProps>}
          code={`import { MuiScheduler } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

// Drop-in replacement — identical props to <Scheduler />
<MuiScheduler events={events} {...handlers} />`} {...sharedProps} />;

      case 'privacy': return <PrivacyPage />;
      case 'terms':   return <TermsPage />;
      default:        return <OverviewPage />;
    }
  };

  return (
    <div className="sb-layout">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`sb-sidebar ${sidebarOpen ? '' : 'sb-sidebar--collapsed'}`} aria-label="Navigation">
        <button className="sb-logo-btn" onClick={() => navigate('overview')} aria-label="Home">
          <SidebarLogo collapsed={!sidebarOpen} />
        </button>

        {sidebarOpen && (
          <div className="sb-version-row">
            <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer" className="sb-version-pill">v{VERSION}</a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="sb-ext-link">GitHub ↗</a>
            <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer" className="sb-ext-link">npm ↗</a>
          </div>
        )}

        <nav className="sb-nav" aria-label="Stories">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="sb-nav-group">
              {sidebarOpen && <p className="sb-nav-group-label">{group.label}</p>}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`sb-nav-item ${page === item.id ? 'sb-nav-item--active' : ''}`}
                  onClick={() => navigate(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  aria-current={page === item.id ? 'page' : undefined}
                >
                  <span className="sb-nav-icon" aria-hidden="true">{item.icon}</span>
                  {sidebarOpen && <span className="sb-nav-label">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sb-sidebar-footer">
            <a href={LINKS.bmc} target="_blank" rel="noopener noreferrer" className="sb-sidebar-bmc">☕ Buy Me a Coffee</a>
          </div>
        )}

        <button className="sb-toggle" onClick={() => setSidebarOpen(p => !p)} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* ── Right column (header + main + footer) ───────────────── */}
      <div className="sb-right">

        {/* Top header */}
        <header className="sb-topbar" aria-label="Toolbar">
          <div className="sb-breadcrumb">
            {currentGroup && <span className="sb-bc-group">{currentGroup.label}</span>}
            {currentItem  && <><span className="sb-bc-sep">›</span><span className="sb-bc-page">{currentItem.icon} {currentItem.label}</span></>}
          </div>
          <div className="sb-topbar-actions">
            {isCanvasPage && (
              <>
                <button className="sb-action-btn" onClick={addRandom}>+ Add event</button>
                <button className="sb-action-btn sb-action-btn--ghost" onClick={() => setEvents(SEED_EVENTS)}>↺ Reset</button>
              </>
            )}
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="sb-action-btn sb-action-btn--ghost">
              <GithubIcon /> GitHub
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="sb-main" aria-label="Content">{renderPage()}</main>

        {/* Footer */}
        <footer className="sb-footer">
          <span>© {new Date().getFullYear()} <a href={LINKS.hazhtech} target="_blank" rel="noopener noreferrer">Hazhtech</a> · react-smart-scheduler v{VERSION} · MIT License</span>
          <nav className="sb-footer-nav" aria-label="Footer links">
            <button className="sb-footer-link" onClick={() => navigate('privacy')}>Privacy Policy</button>
            <button className="sb-footer-link" onClick={() => navigate('terms')}>Terms of Service</button>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="sb-footer-link">GitHub</a>
            <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer" className="sb-footer-link">npm</a>
          </nav>
        </footer>
      </div>
    </div>
  );
};

// ─── Inline icons ─────────────────────────────────────────────────────────────

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);
