'use client';

import { use } from 'react';
import { TrainerContext } from './trainer-context';

export function useTrainer() {
  const context = use(TrainerContext);

  if (!context) {
    throw new Error('useTrainer must be used within a TrainerProvider');
  }

  return context;
}
