'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { ViewTransitionContext, type ViewTransitionState } from './view-transition-context';

export function ViewTransitionProvider({ children }: { children: ReactNode }) {
  const [activeTransition, setActiveTransitionState] = useState<ViewTransitionState>({
    itemId: null,
    instanceId: null,
  });

  const setActiveTransition = useCallback((state: ViewTransitionState) => {
    setActiveTransitionState(state);
  }, []);

  const value = useMemo(
    () => ({ activeTransition, setActiveTransition }),
    [activeTransition, setActiveTransition]
  );

  return (
    <ViewTransitionContext.Provider value={value}>
      {children}
    </ViewTransitionContext.Provider>
  );
}
