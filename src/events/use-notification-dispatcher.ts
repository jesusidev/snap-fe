'use client';

import { useCallback } from 'react';

interface ShowNotificationPayload {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

/**
 * Type-safe notification dispatcher.
 * Always use this instead of Mantine's notifications directly.
 */
export function useNotificationDispatcher() {
  const show = useCallback((payload: ShowNotificationPayload) => {
    window.dispatchEvent(
      new CustomEvent('notification:show', { detail: payload })
    );
  }, []);

  return { show };
}
