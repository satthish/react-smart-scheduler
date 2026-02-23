/**
 * TailwindScheduler — Scheduler pre-themed with a Tailwind-inspired indigo palette.
 * Drop-in replacement for <Scheduler /> — no extra setup required.
 *
 * Usage:
 *   import { TailwindScheduler } from 'react-smart-scheduler/adapters';
 *   import 'react-smart-scheduler/dist/scheduler.css';
 *
 * Tip: you can still override individual tokens via CSS custom properties on a
 * parent element — TailwindScheduler just sets sensible Tailwind-flavoured defaults.
 */
import React from 'react';
import { Scheduler } from '../../Scheduler';
import type { SchedulerProps } from '../../types';
import './tailwind-scheduler.css';

export const TailwindScheduler: React.FC<SchedulerProps> = ({ className = '', ...props }) => (
  <Scheduler {...props} className={`rss-theme-tw ${className}`.trim()} />
);
