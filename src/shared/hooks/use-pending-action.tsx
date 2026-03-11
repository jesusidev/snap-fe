'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useNotificationDispatcher } from '~/events';
import {
  clearPendingAction,
  getPendingAction,
  type PendingAction,
  type PendingActionType,
  storePendingAction,
} from '~/shared/utils';
import { useTrainer } from '~/state/trainer';

/**
 * Callbacks for different pending action types
 */
interface PendingActionCallbacks {
  /** Called when favorite action is executed */
  onFavoriteExecuted?: () => void;
  /** Called when compare action is pending */
  onComparePending?: () => void;
}

/**
 * Hook to execute pending actions after the precondition (trainer name) is met.
 *
 * When a user without a trainer name tries to favorite a Pokemon, the action
 * is stored in sessionStorage. After they set their trainer name, this hook
 * automatically executes the stored action on the matching detail page.
 *
 * This mirrors the catch-the-light pattern where unauthenticated users
 * trigger deferred actions that execute after sign-in.
 *
 * @param pokemonId - The Pokemon ID to check for pending actions
 * @param pokemonName - The Pokemon name for notification messages
 * @param callbacks - Optional callbacks for different action types
 *
 * @example
 * ```tsx
 * function PokemonDetail({ pokemon }) {
 *   const [isFavorite, setIsFavorite] = useState(false);
 *
 *   usePendingAction(pokemon.id, pokemon.name, {
 *     onFavoriteExecuted: () => setIsFavorite(true),
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePendingAction(
  pokemonId: number,
  _pokemonName?: string,
  callbacks?: PendingActionCallbacks
): void {
  const { trainerName } = useTrainer();
  const notificationDispatcher = useNotificationDispatcher();
  const hasProcessedRef = useRef(false);

  const executePendingAction = useCallback(
    (action: PendingAction): boolean => {
      switch (action.type) {
        case 'favorite':
          callbacks?.onFavoriteExecuted?.();
          notificationDispatcher.show({
            message: `${action.pokemonName} added to favorites!`,
            type: 'success',
          });
          return true;

        case 'view':
          // No action needed -- user is already on the page
          return true;

        case 'compare':
          callbacks?.onComparePending?.();
          notificationDispatcher.show({
            message: `${action.pokemonName} queued for comparison`,
            type: 'info',
          });
          return true;

        default:
          return true;
      }
    },
    [callbacks, notificationDispatcher]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Precondition: trainer name must be set
    if (!trainerName) return;

    // Only process once per mount
    if (hasProcessedRef.current) return;

    const pending = getPendingAction();

    // Check if there's a pending action for this Pokemon
    if (!pending || pending.pokemonId !== pokemonId) return;

    hasProcessedRef.current = true;

    const shouldClear = executePendingAction(pending);

    if (shouldClear) {
      clearPendingAction();
    }
  }, [trainerName, pokemonId, executePendingAction]);
}

/**
 * Store a pending action and open the trainer setup modal if needed.
 *
 * Use this in components where the user triggers an action
 * but hasn't set their trainer name yet.
 */
export function useStorePendingAction() {
  const { trainerName, openSetup } = useTrainer();

  const store = useCallback(
    (type: PendingActionType, pokemonId: number, pokemonName: string): boolean => {
      // If trainer name is set, no need to defer
      if (trainerName) return false;

      // Store the action for later execution
      storePendingAction({ type, pokemonId, pokemonName });

      // Open setup modal so user can set their name
      openSetup();

      return true;
    },
    [trainerName, openSetup]
  );

  return { store, needsSetup: !trainerName };
}

/**
 * Check if there's a pending action for a specific Pokemon.
 * Useful for showing loading states.
 */
export function usePendingActionState(pokemonId: number): {
  hasPendingAction: boolean;
  pendingActionType: PendingActionType | null;
} {
  const { trainerName } = useTrainer();

  if (!trainerName) {
    return { hasPendingAction: false, pendingActionType: null };
  }

  const pending = getPendingAction();

  if (!pending || pending.pokemonId !== pokemonId) {
    return { hasPendingAction: false, pendingActionType: null };
  }

  return {
    hasPendingAction: true,
    pendingActionType: pending.type,
  };
}
