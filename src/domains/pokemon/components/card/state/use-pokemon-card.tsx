import { useContext } from 'react';
import { PokemonCardContext } from './card-context';

export function usePokemonCard() {
  const context = useContext(PokemonCardContext);
  if (context === undefined) {
    throw new Error('usePokemonCard must be used within a PokemonCardProvider');
  }
  return context;
}
