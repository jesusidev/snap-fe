'use client';

import type { Dispatch } from 'react';
import { useCallback, useEffect } from 'react';
import type { AppEvent, CustomWindowEventMap } from '~/events';

/**
 * Type-safe event hook for dispatching and listening to custom DOM events.
 *
 * @param eventName - A key from the CustomWindowEventMap
 * @param callback - Optional listener that receives the event payload
 * @returns { dispatch } - Function to dispatch the event with a payload
 *
 * @example
 * ```tsx
 * // Dispatch a search event
 * const { dispatch } = useEvent('pokemon:search');
 * dispatch({ query: 'pikachu', resultCount: 1 });
 *
 * // Listen to a search event
 * useEvent('pokemon:search', (payload) => {
 *   console.log(`Searched for "${payload.query}", found ${payload.resultCount}`);
 * });
 * ```
 */
export const useEvent = <
  EventName extends keyof CustomWindowEventMap,
  PayloadType = CustomWindowEventMap[EventName] extends AppEvent<infer P> ? P : unknown,
>(
  eventName: EventName,
  callback?: Dispatch<PayloadType> | VoidFunction
) => {
  useEffect(() => {
    if (!callback) {
      return;
    }

    const listener = ((event: AppEvent<PayloadType>) => {
      if (typeof callback === 'function') {
        if (callback.length > 0) {
          (callback as Dispatch<PayloadType>)(event.detail);
        } else {
          (callback as VoidFunction)();
        }
      }
    }) as EventListener;

    window.addEventListener(eventName as string, listener);

    return () => {
      window.removeEventListener(eventName as string, listener);
    };
  }, [callback, eventName]);

  const dispatch = useCallback(
    (detail?: PayloadType) => {
      const event = new CustomEvent(eventName as string, {
        detail,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    },
    [eventName]
  );

  return { dispatch };
};
