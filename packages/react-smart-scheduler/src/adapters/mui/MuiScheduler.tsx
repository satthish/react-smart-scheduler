/**
 * MuiScheduler — Scheduler pre-themed with a Material UI-inspired palette.
 * Drop-in replacement for <Scheduler /> — no extra setup required.
 * Does NOT depend on @mui/material — uses CSS-only MUI-flavoured styling.
 *
 * Usage:
 *   import { MuiScheduler } from 'react-smart-scheduler/adapters';
 *   import 'react-smart-scheduler/dist/scheduler.css';
 */
import React from 'react';
import { Scheduler } from '../../Scheduler';
import type { SchedulerProps } from '../../types';
import './mui-scheduler.css';

export const MuiScheduler: React.FC<SchedulerProps> = ({ className = '', ...props }) => (
  <Scheduler {...props} className={`rss-theme-mui ${className}`.trim()} />
);
