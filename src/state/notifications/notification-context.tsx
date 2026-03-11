import { createContext } from 'react';

export interface NotificationContextValue {
  initialized: boolean;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
