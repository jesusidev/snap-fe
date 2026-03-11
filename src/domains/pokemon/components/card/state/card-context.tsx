'use client';

import { createContext } from 'react';

export interface PokemonCardContextValue {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export const PokemonCardContext = createContext<PokemonCardContextValue | undefined>(undefined);
