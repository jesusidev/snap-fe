import { createContext } from 'react';

export interface ViewTransitionState {
  itemId: string | null;
  instanceId: string | null;
}

export interface ViewTransitionContextValue {
  activeTransition: ViewTransitionState;
  setActiveTransition: (state: ViewTransitionState) => void;
}

export const ViewTransitionContext = createContext<ViewTransitionContextValue | undefined>(
  undefined
);
