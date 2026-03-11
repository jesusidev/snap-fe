'use client';

import { useEffect } from 'react';
import { useLenis } from './use-lenis';

interface LenisConfigProps {
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

/**
 * Override Lenis scroll settings for a specific page.
 * Sets config overrides via context, causing LenisProvider to
 * recreate the Lenis instance with the new multipliers.
 * Clears overrides on unmount (restoring defaults).
 *
 * Usage:
 *   <LenisConfig wheelMultiplier={0.35} touchMultiplier={0.6} />
 */
export function LenisConfig({ wheelMultiplier, touchMultiplier }: LenisConfigProps) {
  const { setConfigOverrides } = useLenis();

  useEffect(() => {
    setConfigOverrides({ wheelMultiplier, touchMultiplier });

    return () => {
      setConfigOverrides(null);
    };
  }, [setConfigOverrides, wheelMultiplier, touchMultiplier]);

  return null;
}
