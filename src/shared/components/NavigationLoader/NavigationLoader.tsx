'use client';

import { LoadingOverlay } from '@mantine/core';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface NavigationLoaderContextValue {
  isNavigating: boolean;
  startNavigation: () => void;
  stopNavigation: () => void;
}

const NavigationLoaderContext = createContext<NavigationLoaderContextValue>({
  isNavigating: false,
  startNavigation: () => {},
  stopNavigation: () => {},
});

export function useNavigationLoader() {
  return useContext(NavigationLoaderContext);
}

export function NavigationLoaderProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => setIsNavigating(true), []);
  const stopNavigation = useCallback(() => setIsNavigating(false), []);

  const value = useMemo(
    () => ({ isNavigating, startNavigation, stopNavigation }),
    [isNavigating, startNavigation, stopNavigation]
  );

  return (
    <NavigationLoaderContext.Provider value={value}>
      <LoadingOverlay
        visible={isNavigating}
        zIndex={9999}
        overlayProps={{ blur: 2 }}
        loaderProps={{ type: 'bars', color: 'brand' }}
      />
      {children}
    </NavigationLoaderContext.Provider>
  );
}
