import { useEffect, useState } from 'react';

/** Pixel thresholds that define each breakpoint. */
export const BREAKPOINTS = {
  /** Below this width → mobile */
  mobile: 640,
  /** Below this width (≥ mobile) → tablet */
  tablet: 1024,
} as const;

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Read the current breakpoint synchronously from window.innerWidth.
 * Returns 'desktop' in SSR environments (no window object).
 */
function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < BREAKPOINTS.mobile) return 'mobile';
  if (w < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

/**
 * Returns the current responsive breakpoint and re-renders whenever the
 * window is resized across a threshold.
 *
 * Breakpoints:
 *   mobile  — < 640 px   (phones, small screens)
 *   tablet  — 640–1023 px (tablets, small laptops)
 *   desktop — ≥ 1024 px  (standard laptop / desktop)
 *
 * Usage:
 *   const bp = useBreakpoint();
 *   const isMobile = bp === 'mobile';
 */
export function useBreakpoint(): Breakpoint {
  // Initialise synchronously so the first render already has the right value.
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    // passive: true keeps scroll/resize smooth — no preventDefault needed here.
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  return bp;
}
