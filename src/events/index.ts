export * from './notification-events';
export * from './pokemon-events';
export * from './types';
export * from './use-event';
export * from './use-notification-dispatcher';

import type { NotificationEvents } from './notification-events';
import type { PokemonEvents } from './pokemon-events';

// Combine all domain events into one interface
export interface CustomWindowEventMap
  extends WindowEventMap,
    NotificationEvents,
    PokemonEvents {}
