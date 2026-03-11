'use client';

import { createContext } from 'react';

export interface TrainerContextValue {
  /** The trainer name, or null if not yet set */
  trainerName: string | null;
  /** Whether the trainer setup modal is open */
  isSetupOpen: boolean;
  /** Open the trainer setup modal */
  openSetup: () => void;
  /** Close the trainer setup modal */
  closeSetup: () => void;
  /** Set trainer name and persist to localStorage */
  setTrainerName: (name: string) => void;
  /** Clear trainer name */
  clearTrainerName: () => void;
}

export const TrainerContext = createContext<TrainerContextValue | undefined>(undefined);
