import React from 'react';
import type { ViewType } from '../types';
import { formatHeaderDate, navigateDate } from '../utils/dateUtils';

interface HeaderProps {
  view: ViewType;
  date: Date;
  onViewChange: (view: ViewType) => void;
  onDateChange: (date: Date) => void;
}

const VIEWS: { key: ViewType; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export const Header: React.FC<HeaderProps> = ({ view, date, onViewChange, onDateChange }) => {
  const handlePrev = () => onDateChange(navigateDate(date, view, -1));
  const handleNext = () => onDateChange(navigateDate(date, view, 1));
  const handleToday = () => onDateChange(new Date());

  return (
    <header className="rss-header" role="toolbar" aria-label="Calendar navigation">
      {/* Left: prev / today / next */}
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

      {/* Centre: current period label */}
      <h2 className="rss-header-title" aria-live="polite">
        {formatHeaderDate(date, view)}
      </h2>

      {/* Right: view switcher */}
      <div className="rss-view-switcher" role="group" aria-label="View">
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            className={`rss-view-btn ${view === key ? 'rss-view-btn--active' : ''}`}
            onClick={() => onViewChange(key)}
            aria-pressed={view === key}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};
