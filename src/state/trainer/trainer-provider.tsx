'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TrainerContext } from './trainer-context';

const STORAGE_KEY = 'trainer_name';

export function TrainerProvider({ children }: { children: ReactNode }) {
  const [trainerName, setTrainerNameState] = useState<string | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTrainerNameState(stored);
    }
    setHydrated(true);
  }, []);

  const openSetup = useCallback(() => setIsSetupOpen(true), []);
  const closeSetup = useCallback(() => setIsSetupOpen(false), []);

  const setTrainerName = useCallback((name: string) => {
    setTrainerNameState(name);
    localStorage.setItem(STORAGE_KEY, name);
    setIsSetupOpen(false);
  }, []);

  const clearTrainerName = useCallback(() => {
    setTrainerNameState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      trainerName: hydrated ? trainerName : null,
      isSetupOpen,
      openSetup,
      closeSetup,
      setTrainerName,
      clearTrainerName,
    }),
    [hydrated, trainerName, isSetupOpen, openSetup, closeSetup, setTrainerName, clearTrainerName]
  );

  return <TrainerContext value={value}>{children}</TrainerContext>;
}
