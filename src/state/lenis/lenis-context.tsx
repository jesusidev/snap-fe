'use client';

import type Lenis from 'lenis';
import { createContext } from 'react';

export interface LenisConfigOverrides {
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

export interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
      onComplete?: () => void;
    }
  ) => void;
  setConfigOverrides: (overrides: LenisConfigOverrides | null) => void;
}

export const LenisContext = createContext<LenisContextValue | undefined>(undefined);
