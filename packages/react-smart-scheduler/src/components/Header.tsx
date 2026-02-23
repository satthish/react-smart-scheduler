import React from 'react';
import type { ViewType } from '../types';
import { formatHeaderDate, navigateDate } from '../utils/dateUtils';

interface HeaderProps {
  view: ViewType;
  date: Date;
  /** When true the header switches to a compact two-row layout. */
  isMobile?: boolean;
  onViewChange: (view: ViewType) => void;
  onDateChange: (date: Date) => void;
}

const VIEWS: { key: ViewType; label: string; labelShort: string }[] = [
  { key: 'day',   label: 'Day',   labelShort: 'Day'   },
  { key: 'week',  label: 'Week',  labelShort: 'Week'  },
  { key: 'month', label: 'Month', labelShort: 'Mo'    },
];

export const Header: React.FC<HeaderProps> = ({
  view,
  date,
  isMobile = false,
  onViewChange,
  onDateChange,
}) => {
  const handlePrev  = () => onDateChange(navigateDate(date, view, -1));
  const handleNext  = () => onDateChange(navigateDate(date, view,  1));
  const handleToday = () => onDateChange(new Date());

  return (
    <header
      className={`rss-header${isMobile ? ' rss-header--mobile' : ''}`}
      role="toolbar"
      aria-label="Calendar navigation"
    >
      {/* ── Left: prev / today / next ──────────────────────────── */}
      {/* On mobile this row also contains the view switcher (see CSS order). */}
      <div className="rss-header-nav">
        <button
          className="rss-btn rss-btn--icon"
          onClick={handlePrev}
          aria-label="Previous"
          title="Previous"
        >
          ‹
        </button>
        <button className="rss-btn" onClick={handleToday} aria-label="Go to today">
          Today
        </button>
        <button
          className="rss-btn rss-btn--icon"
          onClick={handleNext}
          aria-label="Next"
          title="Next"
        >
          ›
        </button>
      </div>

      {/* ── Centre: current period label ───────────────────────── */}
      {/* CSS `order` moves this below the nav row on mobile. */}
      <h2 className="rss-header-title" aria-live="polite">
        {formatHeaderDate(date, view)}
      </h2>

      {/* ── Right: view switcher ───────────────────────────────── */}
      <div className="rss-view-switcher" role="group" aria-label="View">
        {VIEWS.map(({ key, label, labelShort }) => (
          <button
            key={key}
            className={`rss-view-btn ${view === key ? 'rss-view-btn--active' : ''}`}
            onClick={() => onViewChange(key)}
            aria-pressed={view === key}
          >
            {/* On mobile show abbreviated label to save space */}
            {isMobile ? labelShort : label}
          </button>
        ))}
      </div>
    </header>
  );
};
