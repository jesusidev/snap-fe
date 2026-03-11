'use client';

import Lenis from 'lenis';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type LenisConfigOverrides, LenisContext } from './lenis-context';

/** Stable reference so the useEffect dependency doesn't change on every render */
const DEFAULT_EASING = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));

interface LenisProviderProps {
  children: ReactNode;
  duration?: number;
  easing?: (t: number) => number;
  lerp?: number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  syncTouch?: boolean;
  touchMultiplier?: number;
  wheelMultiplier?: number;
}

export function LenisProvider({
  children,
  duration = 1.2,
  easing = DEFAULT_EASING,
  lerp = 0.1,
  orientation = 'vertical',
  gestureOrientation = 'vertical',
  smoothWheel = true,
  syncTouch = false,
  touchMultiplier = 1,
  wheelMultiplier = 1,
}: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [configOverrides, setConfigOverrides] = useState<LenisConfigOverrides | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  // Merge base props with per-page overrides
  const effectiveWheelMultiplier = configOverrides?.wheelMultiplier ?? wheelMultiplier;
  const effectiveTouchMultiplier = configOverrides?.touchMultiplier ?? touchMultiplier;

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration,
      easing,
      lerp,
      orientation,
      gestureOrientation,
      smoothWheel,
      syncTouch,
      touchMultiplier: effectiveTouchMultiplier,
      wheelMultiplier: effectiveWheelMultiplier,
    });

    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenisInstance.destroy();
    };
  }, [
    duration,
    easing,
    lerp,
    orientation,
    gestureOrientation,
    smoothWheel,
    syncTouch,
    effectiveTouchMultiplier,
    effectiveWheelMultiplier,
  ]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        onComplete?: () => void;
      }
    ) => {
      lenis?.scrollTo(target, options);
    },
    [lenis]
  );

  const value = useMemo(
    () => ({
      lenis,
      scrollTo,
      setConfigOverrides,
    }),
    [lenis, scrollTo]
  );

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
