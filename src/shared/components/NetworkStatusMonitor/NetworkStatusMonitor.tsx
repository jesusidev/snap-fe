'use client';

import { useEffect, useRef } from 'react';
import { useNotificationDispatcher } from '~/events';

// Extend Navigator type to include connection property
interface NetworkInformation {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

/**
 * Monitors network status and shows notifications for offline or slow connections.
 * Should be placed in the app's provider tree.
 */
export function NetworkStatusMonitor() {
  const notificationDispatcher = useNotificationDispatcher();
  const wasOffline = useRef(false);
  const slowNotificationShown = useRef(false);

  useEffect(() => {
    const getConnection = (): NetworkInformation | undefined => {
      return navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    };

    const handleOffline = () => {
      wasOffline.current = true;
      slowNotificationShown.current = false;

      notificationDispatcher.show({
        message: 'No internet connection. Please check your network.',
        type: 'error',
        persistent: true,
      });
    };

    const handleOnline = () => {
      // Only show "back online" if we were previously offline
      if (wasOffline.current) {
        wasOffline.current = false;

        notificationDispatcher.show({
          message: 'You are back online.',
          type: 'success',
          duration: 3000,
        });
      }
    };

    const checkSlowConnection = () => {
      const connection = getConnection();
      if (!connection) {
        return;
      }

      const isSlowConnection =
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        (connection.rtt && connection.rtt > 1000) || // RTT > 1 second
        (connection.downlink && connection.downlink < 0.5); // Less than 0.5 Mbps

      if (isSlowConnection && navigator.onLine && !wasOffline.current) {
        if (!slowNotificationShown.current) {
          slowNotificationShown.current = true;
          notificationDispatcher.show({
            message: 'Slow internet connection detected. Pages may take longer to load.',
            type: 'warning',
            duration: 8000,
          });
        }
      } else {
        // Reset slow notification flag when connection improves
        slowNotificationShown.current = false;
      }
    };

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    } else {
      checkSlowConnection();
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (if supported)
    const connection = getConnection();
    if (connection?.addEventListener) {
      connection.addEventListener('change', checkSlowConnection);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      const conn = getConnection();
      if (conn?.removeEventListener) {
        conn.removeEventListener('change', checkSlowConnection);
      }
    };
  }, [notificationDispatcher]);

  return null;
}
