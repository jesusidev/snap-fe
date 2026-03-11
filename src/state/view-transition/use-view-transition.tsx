'use client';

import { useCallback, useContext, useId } from 'react';
import { flushSync } from 'react-dom';
import { ViewTransitionContext } from './view-transition-context';

/**
 * Hook to manage ViewTransition names for elements.
 *
 * Two modes:
 * 1. SOURCE mode (prepareViewTransition): Only the clicked element gets the name.
 * 2. DESTINATION mode (setDestinationItemSync): Any matching element gets the name.
 */
export function useViewTransition() {
  const context = useContext(ViewTransitionContext);
  const instanceId = useId();

  if (!context) {
    throw new Error('useViewTransition must be used within a ViewTransitionProvider');
  }

  const { activeTransition, setActiveTransition } = context;

  const getViewTransitionName = useCallback(
    (itemId: string): string | undefined => {
      if (activeTransition.itemId !== itemId) {
        return undefined;
      }
      if (activeTransition.instanceId === null) {
        return `item-image-${itemId}`;
      }
      if (activeTransition.instanceId === instanceId) {
        return `item-image-${itemId}`;
      }
      return undefined;
    },
    [activeTransition.itemId, activeTransition.instanceId, instanceId]
  );

  const prepareViewTransition = useCallback(
    (itemId: string) => {
      flushSync(() => {
        setActiveTransition({ itemId, instanceId });
      });
    },
    [setActiveTransition, instanceId]
  );

  const setDestinationItem = useCallback(
    (itemId: string) => {
      setActiveTransition({ itemId, instanceId: null });
    },
    [setActiveTransition]
  );

  const setDestinationItemSync = useCallback(
    (itemId: string) => {
      flushSync(() => {
        setActiveTransition({ itemId, instanceId: null });
      });
    },
    [setActiveTransition]
  );

  const clearViewTransition = useCallback(() => {
    setActiveTransition({ itemId: null, instanceId: null });
  }, [setActiveTransition]);

  return {
    activeItemId: activeTransition.itemId,
    getViewTransitionName,
    prepareViewTransition,
    setDestinationItem,
    setDestinationItemSync,
    clearViewTransition,
  };
}
