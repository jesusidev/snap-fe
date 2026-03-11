'use client';

import { type ReactNode, useMemo } from 'react';
import { PokemonCardContext } from './card-context';

interface PokemonCardProviderProps {
  id: number;
  name: string;
  image: string;
  types?: string[];
  children: ReactNode;
}

export function PokemonCardProvider({
  id,
  name,
  image,
  types = [],
  children,
}: PokemonCardProviderProps) {
  const value = useMemo(
    () => ({ id, name, image, types }),
    [id, name, image, types]
  );

  return (
    <PokemonCardContext.Provider value={value}>
      {children}
    </PokemonCardContext.Provider>
  );
}
