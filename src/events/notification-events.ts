import type { AppEvent } from './types';

export interface NotificationEvents {
  'notification:show': AppEvent<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }>;
}

export type NotificationEventName = keyof NotificationEvents;
