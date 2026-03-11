/**
 * Pending Action Storage Utility
 *
 * Manages deferred actions when a precondition isn't met.
 * For example, a user tries to favorite a Pokemon but hasn't set their
 * trainer name yet -- we store the action and execute it after setup.
 *
 * In the production codebase (catch-the-light), this pattern handles
 * unauthenticated users who try to favorite/purchase before signing in.
 * The action is stored in localStorage and executed after auth completes.
 *
 * Two storage slots:
 * - `pending_pokemon_action`: deferred actions gated by a precondition (favorite, compare)
 * - `last_viewed_pokemon`: tracks the last detail page visited for "continue where you left off"
 */

export type PendingActionType = 'favorite' | 'compare' | 'view';

export interface PendingAction {
  type: PendingActionType;
  pokemonId: number;
  pokemonName: string;
  timestamp: number;
}

const STORAGE_KEY = 'pending_pokemon_action';
const LAST_VIEWED_KEY = 'last_viewed_pokemon';

/** Default expiration: 24 hours */
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Custom expiration per key (override the default) */
const keyMaxAge: Record<string, number> = {
  [STORAGE_KEY]: 10 * 60 * 1000, // 10 minutes — deferred actions are short-lived
};

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function getMaxAge(key: string): number {
  return keyMaxAge[key] ?? DEFAULT_MAX_AGE_MS;
}

function getAction(key: string): PendingAction | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const action = JSON.parse(stored) as PendingAction;

    if (Date.now() - action.timestamp > getMaxAge(key)) {
      localStorage.removeItem(key);
      return null;
    }

    if (!action.type || !action.pokemonId || !action.pokemonName) {
      localStorage.removeItem(key);
      return null;
    }

    return action;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function setAction(key: string, action: Omit<PendingAction, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const pendingAction: PendingAction = {
    ...action,
    timestamp: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(pendingAction));
}

function clearAction(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ---------------------------------------------------------------------------
// Deferred actions (gated by precondition, e.g. trainer name / auth)
// Expires after 10 minutes
// ---------------------------------------------------------------------------

/** Store a pending action in localStorage. */
export function storePendingAction(action: Omit<PendingAction, 'timestamp'>): void {
  setAction(STORAGE_KEY, action);
}

/** Retrieve the pending action. Returns null if none, expired, or invalid. */
export function getPendingAction(): PendingAction | null {
  return getAction(STORAGE_KEY);
}

/** Clear the pending action. */
export function clearPendingAction(): void {
  clearAction(STORAGE_KEY);
}

/** Check if there's a pending action for a specific Pokemon. */
export function hasPendingActionFor(pokemonId: number): boolean {
  const pending = getPendingAction();
  return pending?.pokemonId === pokemonId;
}

// ---------------------------------------------------------------------------
// Last-viewed tracking ("continue where you left off")
// Expires after 24 hours (default)
// ---------------------------------------------------------------------------

/** Store the last-viewed Pokemon so the list page can offer to resume. */
export function storeLastViewed(pokemonId: number, pokemonName: string): void {
  setAction(LAST_VIEWED_KEY, { type: 'view', pokemonId, pokemonName });
}

/** Retrieve the last-viewed Pokemon. Returns null if none or expired. */
export function getLastViewed(): PendingAction | null {
  return getAction(LAST_VIEWED_KEY);
}

/** Clear the last-viewed entry. */
export function clearLastViewed(): void {
  clearAction(LAST_VIEWED_KEY);
}
