'use client';

import { notifications } from '@mantine/notifications';
import { type ReactNode, useEffect, useMemo } from 'react';
import { NotificationContext } from './notification-context';

/**
 * Listens for notification:show events and shows Mantine notifications.
 * Components should use useNotificationDispatcher() -- never call notifications.show() directly.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type, duration } = (e as CustomEvent).detail;

      const colorMap: Record<string, string> = {
        success: 'green',
        error: 'red',
        info: 'blue',
        warning: 'yellow',
      };

      notifications.show({
        message,
        color: colorMap[type] ?? 'blue',
        autoClose: duration ?? 4000,
      });
    };

    window.addEventListener('notification:show', handler);
    return () => window.removeEventListener('notification:show', handler);
  }, []);

  const value = useMemo(() => ({ initialized: true }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
