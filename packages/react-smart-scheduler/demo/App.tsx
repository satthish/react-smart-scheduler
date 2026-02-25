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
  | 'overview' | 'api'
  | 'basic' | 'week-view' | 'day-view' | 'month-view'
  | 'theme-default' | 'theme-tailwind' | 'theme-mui'
  | 'privacy' | 'terms';

type BgMode      = 'light' | 'gray' | 'dark';
type Viewport    = 'desktop' | 'tablet' | 'mobile';
type AddonTab    = 'controls' | 'code';

interface NavItem  { id: Page; label: string; }
interface NavGroup { label: string; icon: string; items: NavItem[]; }

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  { label: 'Documentation', icon: '📚', items: [
    { id: 'overview', label: 'Overview'      },
    { id: 'api',      label: 'API Reference' },
  ]},
  { label: 'Examples', icon: '🧪', items: [
    { id: 'basic',      label: 'Basic'      },
    { id: 'week-view',  label: 'Week View'  },
    { id: 'day-view',   label: 'Day View'   },
    { id: 'month-view', label: 'Month View' },
  ]},
  { label: 'Themes', icon: '🎨', items: [
    { id: 'theme-default',  label: 'Default'  },
    { id: 'theme-tailwind', label: 'Tailwind' },
    { id: 'theme-mui',      label: 'MUI'      },
  ]},
  { label: 'Legal', icon: '⚖️', items: [
    { id: 'privacy', label: 'Privacy Policy'   },
    { id: 'terms',   label: 'Terms of Service' },
  ]},
];

const LINKS = {
  github:   'https://github.com/satthish/react-smart-scheduler',
  npm:      'https://www.npmjs.com/package/react-smart-scheduler',
  bmc:      'https://buymeacoffee.com/sathish.hazhtech',
  sponsors: 'https://github.com/sponsors/satthish',
  issues:   'https://github.com/satthish/react-smart-scheduler/issues',
  hazhtech: 'https://hazhtech.com',
};

// ─── Seed events ──────────────────────────────────────────────────────────────

function makeDate(d: number, h: number, m = 0): Date {
  const dt = new Date(); dt.setDate(dt.getDate() + d); dt.setHours(h, m, 0, 0); return dt;
}
const SEED: CalendarEvent[] = [
  { id: generateId(), title: 'Team standup',    start: makeDate(0,  9, 0),  end: makeDate(0,  9,30), color: '#3b82f6' },
  { id: generateId(), title: 'Product review',  start: makeDate(0,  11,0),  end: makeDate(0,  12,0), color: '#8b5cf6' },
  { id: generateId(), title: 'Lunch break',     start: makeDate(0,  12,30), end: makeDate(0,  13,30),color: '#10b981' },
  { id: generateId(), title: 'Sprint planning', start: makeDate(1,  10,0),  end: makeDate(1,  12,0), color: '#f59e0b' },
  { id: generateId(), title: 'Design sync',     start: makeDate(1,  14,0),  end: makeDate(1,  15,0), color: '#ef4444' },
  { id: generateId(), title: 'Code review',     start: makeDate(1,  14,30), end: makeDate(1,  16,0), color: '#06b6d4' },
  { id: generateId(), title: '1:1 meeting',     start: makeDate(2,  15,0),  end: makeDate(2,  15,45),color: '#f97316' },
  { id: generateId(), title: 'Client call',     start: makeDate(-1, 13,0),  end: makeDate(-1, 14,0), color: '#84cc16' },
  { id: generateId(), title: 'Retrospective',   start: makeDate(3,  16,0),  end: makeDate(3,  17,0), color: '#8b5cf6' },
];

// ─── Hazhtech Logo ────────────────────────────────────────────────────────────

const LogoMark: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect x="2"  y="9"  width="16" height="6"  rx="3" fill="#F72585" />
    <rect x="7"  y="3"  width="6"  height="16" rx="3" fill="#F72585" />
    <rect x="20" y="4"  width="16" height="6"  rx="3" fill="#7209B7" />
    <rect x="30" y="4"  width="6"  height="14" rx="3" fill="#7209B7" />
    <circle cx="44" cy="5" r="4" fill="#4CC9F0" />
    <rect x="2"  y="38" width="16" height="6"  rx="3" fill="#7209B7" />
    <rect x="2"  y="28" width="6"  height="16" rx="3" fill="#7209B7" />
    <rect x="26" y="30" width="16" height="6"  rx="3" fill="#FB8500" />
    <rect x="31" y="25" width="6"  height="16" rx="3" fill="#FB8500" />
    <circle cx="4" cy="44" r="4" fill="#4CC9F0" />
  </svg>
);

// ─── Canvas Toolbar ───────────────────────────────────────────────────────────

interface CanvasToolbarProps {
  bg: BgMode; setBg: (v: BgMode) => void;
  viewport: Viewport; setViewport: (v: Viewport) => void;
}
const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ bg, setBg, viewport, setViewport }) => (
  <div className="sb-canvas-toolbar" role="toolbar" aria-label="Canvas controls">
    {/* Background */}
    <div className="sb-ct-group">
      <span className="sb-ct-label">Background</span>
      <div className="sb-ct-btns">
        {(['light','gray','dark'] as BgMode[]).map(m => (
          <button key={m} className={`sb-ct-btn ${bg === m ? 'sb-ct-btn--on' : ''}`} onClick={() => setBg(m)} title={`${m} background`}>
            {m === 'light' ? '☀' : m === 'gray' ? '🌤' : '🌙'}
          </button>
        ))}
      </div>
    </div>
    <div className="sb-ct-divider" />
    {/* Viewport */}
    <div className="sb-ct-group">
      <span className="sb-ct-label">Viewport</span>
      <div className="sb-ct-btns">
        <button className={`sb-ct-btn ${viewport==='desktop'?'sb-ct-btn--on':''}`} onClick={()=>setViewport('desktop')} title="Desktop"><DesktopIcon/></button>
        <button className={`sb-ct-btn ${viewport==='tablet' ?'sb-ct-btn--on':''}`} onClick={()=>setViewport('tablet')}  title="Tablet"><TabletIcon/></button>
        <button className={`sb-ct-btn ${viewport==='mobile' ?'sb-ct-btn--on':''}`} onClick={()=>setViewport('mobile')}  title="Mobile (375px)"><MobileIcon/></button>
      </div>
    </div>
    <div className="sb-ct-divider" />
    <span className="sb-ct-hint">
      {viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : 'Full width'}
    </span>
  </div>
);

// ─── Controls panel ───────────────────────────────────────────────────────────

interface StoryControls { hourHeight: number; startHour: number; endHour: number; }

interface ControlsPanelProps {
  controls: StoryControls;
  setControls: React.Dispatch<React.SetStateAction<StoryControls>>;
  defaultControls: StoryControls;
}

const HOUR_OPTIONS = Array.from({ length: 25 }, (_, i) => i);

const ControlsPanel: React.FC<ControlsPanelProps> = ({ controls, setControls, defaultControls }) => {
  const reset = () => setControls(defaultControls);
  const changed = JSON.stringify(controls) !== JSON.stringify(defaultControls);
  return (
    <div className="sb-controls">
      <div className="sb-controls-header">
        <span className="sb-controls-title">Controls</span>
        {changed && <button className="sb-controls-reset" onClick={reset}>Reset</button>}
      </div>
      <table className="sb-controls-table">
        <thead>
          <tr><th>Name</th><th>Control</th><th>Value</th><th>Default</th></tr>
        </thead>
        <tbody>
          {/* hourHeight */}
          <tr>
            <td><code>hourHeight</code></td>
            <td>
              <input
                type="range" min={40} max={120} step={4}
                value={controls.hourHeight}
                onChange={e => setControls(p => ({ ...p, hourHeight: +e.target.value }))}
                className="sb-range"
              />
            </td>
            <td className="sb-val">{controls.hourHeight}px</td>
            <td className="sb-default">{defaultControls.hourHeight}px</td>
          </tr>
          {/* startHour */}
          <tr>
            <td><code>startHour</code></td>
            <td>
              <select value={controls.startHour} onChange={e => setControls(p => ({ ...p, startHour: +e.target.value }))} className="sb-select">
                {HOUR_OPTIONS.slice(0,13).map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </td>
            <td className="sb-val">{controls.startHour}</td>
            <td className="sb-default">{defaultControls.startHour}</td>
          </tr>
          {/* endHour */}
          <tr>
            <td><code>endHour</code></td>
            <td>
              <select value={controls.endHour} onChange={e => setControls(p => ({ ...p, endHour: +e.target.value }))} className="sb-select">
                {HOUR_OPTIONS.slice(12).map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </td>
            <td className="sb-val">{controls.endHour}</td>
            <td className="sb-default">{defaultControls.endHour}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ─── Canvas story page ────────────────────────────────────────────────────────

interface CanvasPageProps {
  title: string; description: string; code: string;
  events: CalendarEvent[];
  onEventAdd: (e: Omit<CalendarEvent, 'id'>) => void;
  onEventChange: (e: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  defaultView?: ViewType;
  defaultControls?: Partial<StoryControls>;
  SchedulerComp?: React.ComponentType<SchedulerProps>;
}

const VIEWPORT_MAX: Record<Viewport, string | undefined> = {
  desktop: undefined,
  tablet:  '768px',
  mobile:  '375px',
};

const CanvasPage: React.FC<CanvasPageProps> = ({
  title, description, code,
  events, onEventAdd, onEventChange, onEventDelete,
  defaultView = 'week',
  defaultControls: dc = {},
  SchedulerComp = Scheduler,
}) => {
  const defaults: StoryControls = { hourHeight: dc.hourHeight ?? 64, startHour: dc.startHour ?? 0, endHour: dc.endHour ?? 24 };

  const [view,     setView]     = useState<ViewType>(defaultView);
  const [date,     setDate]     = useState(() => new Date());
  const [mainTab,  setMainTab]  = useState<'canvas' | 'docs'>('canvas');
  const [addon,    setAddon]    = useState<AddonTab>('controls');
  const [bg,       setBg]       = useState<BgMode>('gray');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [ctrls,    setCtrls]    = useState<StoryControls>(defaults);
  const [copied,   setCopied]   = useState(false);

  const handleCopy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="sb-page">
      {/* Story header */}
      <div className="sb-story-header">
        <div>
          <h1 className="sb-story-title">{title}</h1>
          <p className="sb-story-desc">{description}</p>
        </div>
        <div className="sb-main-tabs" role="tablist">
          <button className={`sb-main-tab ${mainTab==='canvas'?'sb-main-tab--on':''}`} onClick={()=>setMainTab('canvas')} role="tab" aria-selected={mainTab==='canvas'}>Canvas</button>
          <button className={`sb-main-tab ${mainTab==='docs'  ?'sb-main-tab--on':''}`} onClick={()=>setMainTab('docs')}   role="tab" aria-selected={mainTab==='docs'}>Docs</button>
        </div>
      </div>

      {mainTab === 'canvas' ? (
        <>
          {/* Canvas toolbar */}
          <CanvasToolbar bg={bg} setBg={setBg} viewport={viewport} setViewport={setViewport} />

          {/* Canvas */}
          <div className={`sb-canvas sb-canvas--${bg}`}>
            <div className="sb-canvas-frame" style={{ maxWidth: VIEWPORT_MAX[viewport] }}>
              <SchedulerComp
                events={events}
                view={view} date={date}
                onEventAdd={onEventAdd} onEventChange={onEventChange} onEventDelete={onEventDelete}
                onViewChange={setView} onDateChange={setDate}
                hourHeight={ctrls.hourHeight}
                startHour={ctrls.startHour}
                endHour={ctrls.endHour}
              />
            </div>
          </div>

          {/* Addons panel */}
          <div className="sb-addons">
            <div className="sb-addons-bar">
              <div className="sb-addon-tabs" role="tablist">
                <button className={`sb-addon-tab ${addon==='controls'?'sb-addon-tab--on':''}`} onClick={()=>setAddon('controls')} role="tab">Controls</button>
                <button className={`sb-addon-tab ${addon==='code'    ?'sb-addon-tab--on':''}`} onClick={()=>setAddon('code')}     role="tab">Code</button>
              </div>
              {addon === 'code' && (
                <button className="sb-copy-btn" onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy'}</button>
              )}
            </div>
            <div className="sb-addons-body">
              {addon === 'controls'
                ? <ControlsPanel controls={ctrls} setControls={setCtrls} defaultControls={defaults} />
                : <pre className="sb-code"><code>{code}</code></pre>
              }
            </div>
          </div>
        </>
      ) : (
        /* Docs tab */
        <div className="sb-docs-tab-body">
          <div className="sb-doc-body">
            <section className="sb-section">
              <h2>{title}</h2>
              <p>{description}</p>
            </section>
            <section className="sb-section">
              <h2>Usage</h2>
              <div className="sb-panel-hdr">
                <span className="sb-panel-label">Code</span>
                <button className="sb-copy-btn" onClick={handleCopy}>{copied ? '✓ Copied!' : 'Copy'}</button>
              </div>
              <pre className="sb-code"><code>{code}</code></pre>
            </section>
            <section className="sb-section">
              <h2>Props</h2>
              <p>See the <strong>API Reference</strong> page for the full props table.</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Overview page ────────────────────────────────────────────────────────────

const OverviewPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--flat">
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
        <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/react-smart-scheduler?color=3b82f6&logo=npm&label=npm"          alt="npm"       /></a>
        <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dm/react-smart-scheduler?color=10b981&label=downloads"             alt="downloads" /></a>
        <a href={LINKS.github} target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/stars/satthish/react-smart-scheduler?style=flat&color=f59e0b"  alt="stars"     /></a>
        <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/bundlephobia/minzip/react-smart-scheduler?color=8b5cf6&label=gzipped"  alt="size"      /></a>
      </div>

      <section className="sb-section">
        <h2>✨ Features</h2>
        <div className="sb-feat-grid">
          {[['📅','Day, Week & Month views'],['🖱️','Drag to move (across days & times)'],['↕️','Drag bottom edge to resize'],['➕','Click slot → create event'],['📐','Concurrent event overlap layout'],['🕐','"Now" line indicator'],['📱','Responsive — mobile / tablet / desktop'],['👆','Touch drag & drop'],['🎨','Headless · Tailwind · MUI adapters'],['🔌','Slots API — swap Header / EventModal'],['🔒','Controlled component API'],['♿','Accessible (ARIA + keyboard nav)'],['📝','TypeScript — fully typed'],['🪶','Zero heavy UI framework deps']].map(([icon,label])=>(
            <div key={String(label)} className="sb-feat-card"><span aria-hidden="true">{icon}</span><span>{label}</span></div>
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
        onEventAdd={(p) => setEvents(prev => [...prev, { ...p, id: generateId() }])}
        onEventChange={(u) => setEvents(prev => prev.map(e => e.id===u.id ? u : e))}
        onEventDelete={(id) => setEvents(prev => prev.filter(e => e.id!==id))}
      />
    </div>
  );
}`}</code></pre>
      </section>

      <section className="sb-section">
        <h2>🎨 Adapter themes</h2>
        <div className="sb-theme-cards">
          {[
            { name:'Default',  pkg:'Scheduler',          color:'#3b82f6', desc:'Built-in blue — zero config'  },
            { name:'Tailwind', pkg:'TailwindScheduler',  color:'#6366f1', desc:'Indigo, Inter font — CSS only' },
            { name:'MUI',      pkg:'MuiScheduler',       color:'#1976d2', desc:'Material Design — CSS only'   },
            { name:'Headless', pkg:'HeadlessScheduler',  color:'#6b7280', desc:'Bring your own CSS'           },
          ].map(t=>(
            <div key={t.name} className="sb-theme-card">
              <div className="sb-theme-dot" style={{background:t.color}}/>
              <div className="sb-theme-info">
                <strong>{t.name}</strong><span>{t.desc}</span>
                <code>{"import { "+t.pkg+" } from 'react-smart-scheduler';"}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sb-section sb-section--donate">
        <h2>❤️ Support the project</h2>
        <p>react-smart-scheduler is <strong>free &amp; MIT-licensed</strong>. If it saves you time, please consider supporting:</p>
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
    <div className="sb-story-header sb-story-header--flat">
      <div>
        <h1 className="sb-story-title">API Reference</h1>
        <p className="sb-story-desc">Props, types, hooks and utilities — v{VERSION}.</p>
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
                ['events','CalendarEvent[]','—','Controlled events list (required)'],
                ['view',"'day'|'week'|'month'","'week'",'Active view'],
                ['date','Date','new Date()','Anchor date for the current view'],
                ['onEventAdd',"(e: Omit<CalendarEvent,'id'>) => void",'—','Fired when user creates an event'],
                ['onEventChange','(e: CalendarEvent) => void','—','Fired after drag-move or resize'],
                ['onEventDelete','(id: string) => void','—','Fired when user deletes an event'],
                ['onViewChange','(v: ViewType) => void','—','Fired when view changes'],
                ['onDateChange','(d: Date) => void','—','Fired on navigation'],
                ['hourHeight','number','64','Pixel height of each hour row'],
                ['startHour','number','0','First visible hour (0–23)'],
                ['endHour','number','24','Last visible hour (1–24)'],
                ['className','string',"''",'Extra CSS class on root element'],
                ['slots','SchedulerSlots','—','Swap Header or EventModal'],
              ] as const).map(([p,t,d,desc])=>(
                <tr key={p}><td><code className="sb-prop">{p}</code></td><td><code className="sb-type">{t}</code></td><td><code>{d}</code></td><td>{desc}</td></tr>
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
  start:  Date;     // inclusive start
  end:    Date;     // exclusive end
  color?: string;   // any valid CSS colour
}`}</code></pre>
      </section>
      <section className="sb-section">
        <h2>Slots API</h2>
        <pre className="sb-code"><code>{`import { Scheduler, HeaderSlotProps } from 'react-smart-scheduler';

const MyHeader: React.FC<HeaderSlotProps> = ({ view, date, onViewChange }) => (
  // your custom header
);

<Scheduler events={events} slots={{ Header: MyHeader }} {...handlers} />`}</code></pre>
      </section>
      <section className="sb-section">
        <h2>Utilities &amp; hooks</h2>
        <pre className="sb-code"><code>{`import { generateId, EVENT_COLORS, pickColor, useBreakpoint, VERSION } from 'react-smart-scheduler';

generateId()           // unique id for new events
EVENT_COLORS           // string[] — built-in 12-colour palette
pickColor(id)          // deterministic colour from palette
useBreakpoint()        // 'mobile' | 'tablet' | 'desktop'
VERSION                // '${VERSION}'`}</code></pre>
      </section>
      <section className="sb-section">
        <h2>CSS custom properties</h2>
        <pre className="sb-code"><code>{`.rss-root {
  --rss-primary:        #3b82f6;
  --rss-primary-light:  #eff6ff;
  --rss-border:         #e5e7eb;
  --rss-bg:             #ffffff;
  --rss-radius:         6px;
  --rss-event-radius:   4px;
  --rss-header-h:       56px;
  --rss-time-gutter-w:  52px;
}`}</code></pre>
      </section>
    </div>
  </div>
);

// ─── Privacy page ─────────────────────────────────────────────────────────────

const PrivacyPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--flat"><div><h1 className="sb-story-title">Privacy Policy</h1><p className="sb-story-desc">Last updated: February 25, 2026</p></div></div>
    <div className="sb-doc-body sb-legal">
      <section className="sb-section"><h2>1. Introduction</h2><p>This Privacy Policy describes how <strong>Hazhtech</strong> handles information when you use the demo at <code>scheduler.hazhtech.com</code>.</p></section>
      <section className="sb-section"><h2>2. Information We Collect</h2><p>We do not collect personally identifiable information. The demo runs entirely in your browser.</p><p><strong>Third-party services</strong> (advertising, analytics) may independently collect information using cookies and tracking technologies. Please review each service's privacy policy.</p></section>
      <section className="sb-section"><h2>3. Cookies</h2><p>This site does not set first-party cookies. Third-party ad and analytics services may set their own cookies.</p></section>
      <section className="sb-section"><h2>4. npm Package</h2><p>The <code>react-smart-scheduler</code> package does <strong>not</strong> collect telemetry or analytics of any kind.</p></section>
      <section className="sb-section"><h2>5. GitHub</h2><p>Source code on <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a> — interactions governed by <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub's Privacy Statement</a>.</p></section>
      <section className="sb-section"><h2>6. Advertising</h2><p>This site is supported by third-party advertising. Ad networks may use cookies and similar technologies to serve personalised ads. You can opt out via your browser settings or a privacy-focused extension.</p></section>
      <section className="sb-section"><h2>7. Contact</h2><p>Questions? <a href={LINKS.issues} target="_blank" rel="noopener noreferrer">Open a GitHub issue</a>.</p></section>
    </div>
  </div>
);

// ─── Terms page ───────────────────────────────────────────────────────────────

const TermsPage: React.FC = () => (
  <div className="sb-page sb-page--docs">
    <div className="sb-story-header sb-story-header--flat"><div><h1 className="sb-story-title">Terms of Service</h1><p className="sb-story-desc">Last updated: February 25, 2026</p></div></div>
    <div className="sb-doc-body sb-legal">
      <section className="sb-section"><h2>1. Acceptance</h2><p>By using <code>scheduler.hazhtech.com</code> or the <code>react-smart-scheduler</code> package, you agree to these Terms.</p></section>
      <section className="sb-section"><h2>2. License</h2><p>The library is released under the <strong>MIT License</strong> — free to use, copy, modify, and distribute. See the <a href={`${LINKS.github}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">LICENSE file</a>.</p></section>
      <section className="sb-section"><h2>3. Demo Website</h2><p>Provided "as is" for demonstration purposes. No warranty of uptime or accuracy. We may modify or discontinue it at any time without notice.</p></section>
      <section className="sb-section"><h2>4. Intellectual Property</h2><p>The <strong>Hazhtech</strong> name and logo are owned by Hazhtech. Library code is open-source under MIT License.</p></section>
      <section className="sb-section"><h2>5. Limitation of Liability</h2><p>In no event shall Hazhtech or contributors be liable for any indirect, incidental, or consequential damages arising from use of this software or demo.</p></section>
      <section className="sb-section"><h2>6. Advertising</h2><p>This demo is supported by third-party advertising. Ad networks operate under their own terms and privacy policies.</p></section>
      <section className="sb-section"><h2>7. Changes</h2><p>We may update these Terms. Continued use constitutes acceptance of the revised Terms.</p></section>
      <section className="sb-section"><h2>8. Contact</h2><p><a href={LINKS.issues} target="_blank" rel="noopener noreferrer">Open a GitHub issue</a>.</p></section>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>(() => (window.location.hash.slice(1) as Page) || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fn = () => { const h = window.location.hash.slice(1) as Page; if (h) setPage(h); };
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);

  const navigate = (to: Page) => { window.location.hash = to; setPage(to); setSearch(''); };

  const [events, setEvents] = useState<CalendarEvent[]>(SEED);
  const handleEventAdd    = useCallback((p: Omit<CalendarEvent,'id'>) => setEvents(prev => [...prev, { ...p, id: generateId() }]), []);
  const handleEventChange = useCallback((u: CalendarEvent)             => setEvents(prev => prev.map(e => e.id===u.id ? u : e)), []);
  const handleEventDelete = useCallback((id: string)                   => setEvents(prev => prev.filter(e => e.id!==id)), []);
  const shared = { events, onEventAdd: handleEventAdd, onEventChange: handleEventChange, onEventDelete: handleEventDelete };

  const addRandom = () => {
    const titles = ['Meeting','Review','Sync','Call','Workshop','Demo'];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const color = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
    const start = new Date(); start.setMinutes(0, 0, 0);
    handleEventAdd({ title, start, end: new Date(start.getTime() + 3_600_000), color });
  };

  const isCanvasPage = !['overview','api','privacy','terms'].includes(page);

  // Filtered nav for search
  const filteredGroups = search.trim()
    ? NAV_GROUPS.map(g => ({
        ...g,
        items: g.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
      })).filter(g => g.items.length > 0)
    : NAV_GROUPS;

  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === page));
  const currentItem  = currentGroup?.items.find(i => i.id === page);

  const renderPage = () => {
    switch (page) {
      case 'overview': return <OverviewPage />;
      case 'api':      return <ApiPage />;
      case 'basic':
        return <CanvasPage title="Basic Usage" description="Minimal controlled setup — events + add / change / delete handlers." defaultView="week"
          code={`import { Scheduler, generateId } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

<Scheduler
  events={events}
  onEventAdd={(p) => setEvents(prev => [...prev, { ...p, id: generateId() }])}
  onEventChange={(u) => setEvents(prev => prev.map(e => e.id===u.id ? u : e))}
  onEventDelete={(id) => setEvents(prev => prev.filter(e => e.id!==id))}
/>`} {...shared} />;
      case 'week-view':
        return <CanvasPage title="Week View" description="7-day week grid with concurrent event layout, drag-to-move, and drag-to-resize." defaultView="week"
          defaultControls={{ startHour: 7, endHour: 20 }}
          code={`<Scheduler
  events={events}
  view="week"
  startHour={7}
  endHour={20}
  {...handlers}
/>`} {...shared} />;
      case 'day-view':
        return <CanvasPage title="Day View" description="Single-day time grid — ideal for dense hourly scheduling." defaultView="day"
          defaultControls={{ hourHeight: 80 }}
          code={`<Scheduler
  events={events}
  view="day"
  hourHeight={80}
  {...handlers}
/>`} {...shared} />;
      case 'month-view':
        return <CanvasPage title="Month View" description="Monthly overview with drag-and-drop between days." defaultView="month"
          code={`<Scheduler
  events={events}
  view="month"
  {...handlers}
/>`} {...shared} />;
      case 'theme-default':
        return <CanvasPage title="Default Theme" description="Built-in blue theme — no extra configuration required." defaultView="week"
          code={`import { Scheduler } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

<Scheduler events={events} {...handlers} />`} {...shared} />;
      case 'theme-tailwind':
        return <CanvasPage title="Tailwind Theme" description="Indigo palette, rounder corners, Inter font. CSS-only — no Tailwind install needed." defaultView="week"
          SchedulerComp={TailwindScheduler as React.ComponentType<SchedulerProps>}
          code={`import { TailwindScheduler } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

<TailwindScheduler events={events} {...handlers} />`} {...shared} />;
      case 'theme-mui':
        return <CanvasPage title="MUI Theme" description="Material Design — MUI blue, Roboto, elevation. No @mui/material required." defaultView="week"
          SchedulerComp={MuiScheduler as React.ComponentType<SchedulerProps>}
          code={`import { MuiScheduler } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

<MuiScheduler events={events} {...handlers} />`} {...shared} />;
      case 'privacy': return <PrivacyPage />;
      case 'terms':   return <TermsPage />;
      default:        return <OverviewPage />;
    }
  };

  return (
    <div className="sb-layout">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`sb-sidebar ${sidebarOpen ? '' : 'sb-sidebar--collapsed'}`} aria-label="Navigation">

        {/* Logo */}
        <button className="sb-logo-btn" onClick={() => navigate('overview')} aria-label="Home">
          <div className={`sb-logo ${!sidebarOpen ? 'sb-logo--collapsed' : ''}`}>
            <LogoMark size={32} />
            {sidebarOpen && (
              <div className="sb-logo-text">
                <span className="sb-logo-name">Hazhtech</span>
                <span className="sb-logo-pkg">react-smart-scheduler</span>
              </div>
            )}
          </div>
        </button>

        {/* Version row */}
        {sidebarOpen && (
          <div className="sb-version-row">
            <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer" className="sb-version-pill">v{VERSION}</a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="sb-ext-link">GitHub ↗</a>
            <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer" className="sb-ext-link">npm ↗</a>
          </div>
        )}

        {/* Search */}
        {sidebarOpen && (
          <div className="sb-search-wrap">
            <span className="sb-search-icon">🔍</span>
            <input
              className="sb-search"
              type="search"
              placeholder="Search stories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search stories"
            />
          </div>
        )}

        {/* Nav */}
        <nav className="sb-nav" aria-label="Stories">
          {filteredGroups.map(group => (
            <div key={group.label} className="sb-nav-group">
              {sidebarOpen
                ? <div className="sb-nav-group-hdr"><span className="sb-nav-group-icon" aria-hidden="true">{group.icon}</span><span className="sb-nav-group-label">{group.label}</span></div>
                : <div className="sb-nav-group-icon-only" title={group.label} aria-hidden="true">{group.icon}</div>
              }
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`sb-nav-item ${page === item.id ? 'sb-nav-item--active' : ''}`}
                  onClick={() => navigate(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  aria-current={page === item.id ? 'page' : undefined}
                >
                  <span className={`sb-nav-dot ${page === item.id ? 'sb-nav-dot--active' : ''}`} aria-hidden="true" />
                  {sidebarOpen && <span className="sb-nav-label">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="sb-search-empty">No stories match "{search}"</p>
          )}
        </nav>

        {/* Donate */}
        {sidebarOpen && (
          <div className="sb-sidebar-footer">
            <a href={LINKS.bmc} target="_blank" rel="noopener noreferrer" className="sb-sidebar-bmc">☕ Buy Me a Coffee</a>
          </div>
        )}

        <button className="sb-toggle" onClick={() => setSidebarOpen(p => !p)} aria-label={sidebarOpen ? 'Collapse' : 'Expand'}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* ── Right column ─────────────────────────────────────── */}
      <div className="sb-right">

        {/* Monetag ad banner */}
        <div className="sb-ad-banner" aria-label="Advertisement">
          {/* Monetag Smart Tag renders into this area — zone 214195 */}
        </div>

        {/* Top bar */}
        <header className="sb-topbar" aria-label="Toolbar">
          <div className="sb-breadcrumb">
            {currentGroup && <span className="sb-bc-group">{currentGroup.label}</span>}
            {currentItem  && <><span className="sb-bc-sep">›</span><span className="sb-bc-page">{currentItem.label}</span></>}
          </div>
          <div className="sb-topbar-actions">
            {isCanvasPage && <>
              <button className="sb-action-btn"                   onClick={addRandom}>+ Add event</button>
              <button className="sb-action-btn sb-action-btn--ghost" onClick={() => setEvents(SEED)}>↺ Reset</button>
            </>}
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="sb-action-btn sb-action-btn--ghost"><GithubIcon /> GitHub</a>
          </div>
        </header>

        {/* Content */}
        <main className="sb-main" aria-label="Content">{renderPage()}</main>

        {/* Footer */}
        <footer className="sb-footer">
          <span>© {new Date().getFullYear()} <a href={LINKS.hazhtech} target="_blank" rel="noopener noreferrer">Hazhtech</a> · react-smart-scheduler v{VERSION} · MIT</span>
          <nav className="sb-footer-nav">
            <button className="sb-footer-link" onClick={() => navigate('privacy')}>Privacy</button>
            <button className="sb-footer-link" onClick={() => navigate('terms')}>Terms</button>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="sb-footer-link">GitHub</a>
            <a href={LINKS.npm}    target="_blank" rel="noopener noreferrer" className="sb-footer-link">npm</a>
          </nav>
        </footer>
      </div>
    </div>
  );
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const GithubIcon  = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>;
const DesktopIcon = () => <svg width="16" height="14" viewBox="0 0 24 20" fill="currentColor" aria-hidden="true"><path d="M21 0H3C1.34 0 0 1.34 0 3v12c0 1.66 1.34 3 3 3h7l-1 2H8v2h8v-2h-1l-1-2h7c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zm0 14H3V3h18v11z"/></svg>;
const TabletIcon  = () => <svg width="12" height="16" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true"><path d="M11 0H3C1.34 0 0 1.34 0 3v14c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zm-1 17H4v-1h6v1zm2-3H2V3h10v11z"/></svg>;
const MobileIcon  = () => <svg width="10" height="16" viewBox="0 0 10 18" fill="currentColor" aria-hidden="true"><path d="M8 0H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zM5 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-3H2V2h6v11z"/></svg>;
