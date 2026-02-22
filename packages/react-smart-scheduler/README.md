<div align="center">

# 📅 react-smart-scheduler

**A production-ready, open-source React scheduler / calendar component**

Day · Week · Month views · Drag & drop · Resize · TypeScript · Zero UI framework dependency

[![npm version](https://img.shields.io/npm/v/react-smart-scheduler?color=blue&logo=npm)](https://www.npmjs.com/package/react-smart-scheduler)
[![npm downloads](https://img.shields.io/npm/dm/react-smart-scheduler?color=green)](https://www.npmjs.com/package/react-smart-scheduler)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-smart-scheduler?color=orange)](https://bundlephobia.com/package/react-smart-scheduler)
[![license](https://img.shields.io/npm/l/react-smart-scheduler?color=purple)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

[**Live Demo →**](https://scheduler.hazhtech.com/) &nbsp;|&nbsp;
[**GitHub →**](https://github.com/yourname/react-smart-scheduler) &nbsp;|&nbsp;
[**npm →**](https://www.npmjs.com/package/react-smart-scheduler)

</div>

---

## ✨ Features

| Feature | Status |
|---|---|
| Day / Week / Month views | ✅ |
| Drag events to move (time + day) | ✅ |
| Drag bottom edge to resize | ✅ |
| Click empty slot → create event modal | ✅ |
| Overlap / concurrent event layout | ✅ |
| Current time indicator ("now" line) | ✅ |
| Controlled component API | ✅ |
| Accessible (ARIA roles, keyboard nav) | ✅ |
| CSS custom-property theming | ✅ |
| TypeScript — fully typed | ✅ |
| Zero heavy UI framework deps | ✅ |
| Source maps included | ✅ |

---

## 📦 Installation

```bash
npm install react-smart-scheduler
# or
yarn add react-smart-scheduler
# or
pnpm add react-smart-scheduler
```

> **Peer dependencies** — make sure these are already in your project:
> ```bash
> npm install react react-dom
> ```

---

## 🚀 Quick start

```tsx
// 1. Import the component and CSS
import { Scheduler, CalendarEvent, generateId } from 'react-smart-scheduler';
import 'react-smart-scheduler/dist/scheduler.css';

// 2. Manage your own events (controlled pattern)
import { useState } from 'react';

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Scheduler
        events={events}
        view="week"
        onEventAdd={(partial) =>
          setEvents((prev) => [...prev, { ...partial, id: generateId() }])
        }
        onEventChange={(updated) =>
          setEvents((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e))
          )
        }
        onEventDelete={(id) =>
          setEvents((prev) => prev.filter((e) => e.id !== id))
        }
      />
    </div>
  );
}
```

---

## 📖 API

### `<Scheduler />` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `CalendarEvent[]` | **required** | Controlled list of events |
| `view` | `'day' \| 'week' \| 'month'` | `'week'` | Active view |
| `date` | `Date` | `new Date()` | Anchor date for the current view |
| `onEventAdd` | `(e: Omit<CalendarEvent, 'id'>) => void` | — | Fired when user creates an event |
| `onEventChange` | `(e: CalendarEvent) => void` | — | Fired after drag-move or resize |
| `onEventDelete` | `(id: string) => void` | — | Fired when user deletes an event |
| `onViewChange` | `(v: ViewType) => void` | — | Fired when the view changes |
| `onDateChange` | `(d: Date) => void` | — | Fired when the user navigates |
| `hourHeight` | `number` | `64` | Pixel height of each hour row |
| `startHour` | `number` | `0` | First visible hour (0–23) |
| `endHour` | `number` | `24` | Last visible hour (1–24) |
| `className` | `string` | `''` | Extra CSS class on the root element |

### `CalendarEvent` type

```ts
interface CalendarEvent {
  id:     string;
  title:  string;
  start:  Date;
  end:    Date;
  color?: string;  // any valid CSS colour, e.g. '#3b82f6' or 'royalblue'
}
```

To attach custom metadata, **extend** the interface:

```ts
interface MyEvent extends CalendarEvent {
  roomId:    string;
  attendees: string[];
}
```

### Exported utilities

```ts
import {
  Scheduler,      // the main component
  generateId,     // generate a unique event id
  pickColor,      // pick a colour from the palette deterministically
  EVENT_COLORS,   // the default colour palette (string[])
  VERSION,        // current library version string
} from 'react-smart-scheduler';

import type {
  CalendarEvent,  // event shape
  SchedulerProps, // props interface
  ViewType,       // 'day' | 'week' | 'month'
} from 'react-smart-scheduler';
```

---

## 🎨 Theming

Override CSS custom properties on `.rss-root` to customise appearance without touching source:

```css
.rss-root {
  --rss-primary:       #6366f1;   /* accent colour */
  --rss-primary-light: #eef2ff;
  --rss-border:        #d1d5db;   /* grid lines */
  --rss-bg:            #ffffff;   /* surface */
  --rss-bg-alt:        #f9fafb;   /* alternate bg */
  --rss-today-bg:      #eef2ff;   /* today column tint */
  --rss-text:          #111827;
  --rss-text-muted:    #9ca3af;
  --rss-time-gutter-w: 52px;
  --rss-radius:        6px;
}
```

---

## 💡 Usage patterns

### Controlled view + date (recommended)

```tsx
const [view, setView] = useState<ViewType>('week');
const [date, setDate] = useState(new Date());

<Scheduler
  view={view}
  date={date}
  onViewChange={setView}
  onDateChange={setDate}
  events={events}
  onEventAdd={...}
  onEventChange={...}
  onEventDelete={...}
/>
```

### Semi-controlled (internal navigation state)

```tsx
// Omit view/date/onViewChange/onDateChange — scheduler manages them internally
<Scheduler
  events={events}
  onEventAdd={handleAdd}
  onEventChange={handleChange}
  onEventDelete={handleDelete}
/>
```

### Custom business hours

```tsx
<Scheduler
  events={events}
  startHour={7}
  endHour={20}
  hourHeight={80}
  ...
/>
```

### With Zustand

```ts
// store.ts
import { create } from 'zustand';
import { CalendarEvent, generateId } from 'react-smart-scheduler';

const useCalendarStore = create<{
  events: CalendarEvent[];
  add: (p: Omit<CalendarEvent, 'id'>) => void;
  update: (e: CalendarEvent) => void;
  remove: (id: string) => void;
}>((set) => ({
  events: [],
  add:    (p)  => set((s) => ({ events: [...s.events, { ...p, id: generateId() }] })),
  update: (e)  => set((s) => ({ events: s.events.map((x) => x.id === e.id ? e : x) })),
  remove: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),
}));
```

---

## 🛠 Development

```bash
# Clone
git clone https://github.com/yourname/react-smart-scheduler.git
cd react-smart-scheduler/packages/react-smart-scheduler

# Install
npm install

# Start demo playground (hot-reload at http://localhost:5173)
npm run dev

# Build library → /dist  (runs tsc + vite)
npm run build

# Type-check only
npm run type-check

# Preview built demo
npm run preview
```

### Publishing to npm

```bash
# Log in (first time)
npm login

# Publish (prepublishOnly runs type-check + build automatically)
npm publish
```

The `prepublishOnly` hook ensures the published package is always a fresh, type-safe build.

---

## 📸 Demo

**[👉 Open live demo](https://scheduler.hazhtech.com/)**

Features you can try:

- Switch between **Day**, **Week**, and **Month** views
- **Click** any empty time slot to open the Create Event modal
- **Drag** an event to move it (changes time and, in week view, the day)
- **Drag the bottom edge** of an event to resize its duration
- **Click** an event chip to edit its title, time, color, or delete it
- **+ Add random event** button to quickly populate the calendar

---

## 🏗 Architecture

```
src/
├── index.ts           — public API entry point
├── types.ts           — all TypeScript interfaces
├── Scheduler.tsx      — root + single DndContext + drag math
├── scheduler.css      — all library styles
│
├── views/
│   ├── DayView.tsx    — 1-column TimeGrid wrapper
│   ├── WeekView.tsx   — 7-column TimeGrid wrapper
│   └── MonthView.tsx  — 6×7 month grid + draggable pills
│
├── components/
│   ├── Header.tsx     — navigation + view switcher
│   ├── TimeGrid.tsx   — shared hour-grid backbone
│   ├── EventItem.tsx  — chip: dnd-kit drag + Pointer Capture resize
│   └── EventModal.tsx — add / edit / delete modal
│
├── hooks/
│   └── useScheduler.ts — UI-only state (modal, pending slot)
│
└── utils/
    ├── dateUtils.ts   — date-fns wrappers, grid math, navigation
    └── eventUtils.ts  — overlap detection, column layout, colours
```

**Key decisions:**

| Decision | Why |
|---|---|
| Single `DndContext` at root | Centralised drag-end math; avoids nested context issues |
| Delta-based drag (not per-cell droppables) | Sub-cell time precision, minimal DOM nodes |
| Pointer Capture API for resize | Tracks cursor anywhere on screen without document listeners |
| Controlled component | Consumer owns state — works with any store |
| CSS custom properties | Zero-runtime theming, no CSS-in-JS required |

---

## 🗺 Roadmap

### v0.2 — Core polish
- [ ] All-day events row
- [ ] Multi-day spanning events in week view
- [ ] Keyboard shortcut to delete selected event
- [ ] Mini-month navigation widget

### v0.3 — Power features
- [ ] Drag-to-create (click-drag on empty slot)
- [ ] Recurring events (RRULE / iCal)
- [ ] Timezone-aware rendering
- [ ] External `.ics` import / export

### Future Pro features (opt-in add-ons, core stays free)
- [ ] Resource / room view (multi-column by resource)
- [ ] Gantt-style timeline
- [ ] Custom event render slot (render prop)
- [ ] Virtual scroll for large event volumes
- [ ] Backend sync hooks (optimistic updates)

---

## 🤝 Contributing

All contributions are welcome — bug fixes, features, docs, tests.

1. Fork & clone the repo
2. `npm install` in `packages/react-smart-scheduler`
3. Make your changes (`npm run dev` for hot-reload)
4. `npm run type-check && npm run build` must pass
5. Open a pull request with a clear description of *why*, not just *what*

---

## ❤️ Donate / Support

react-smart-scheduler is **free and open-source (MIT)**. Maintaining it takes real effort. If it saves you time, please consider:

| | |
|---|---|
| ☕ **[Buy Me a Coffee](https://buymeacoffee.com/sathish.hazhtech)** | One-time tip — any amount helps |
| 🩷 **[GitHub Sponsors](https://github.com/sponsors/satthish)** | Monthly support with perks |

Every ⭐ star and share also helps the project grow. Thank you 🙏

---

## 📄 License

[MIT](LICENSE) © react-smart-scheduler contributors

---

<div align="center">

Built with ❤️ and TypeScript &nbsp;·&nbsp; If this saves you time, consider [starring ⭐ the repo](https://github.com/yourname/react-smart-scheduler)

</div>
