'use client';

import { PokemonCard } from './PokemonCard';

interface PokemonCardComposedProps {
  id: number;
  name: string;
  image: string;
  types?: string[];
}

/**
 * Pre-composed Pokemon card showing the standard layout.
 * Uses the compound component pattern -- see PokemonCard for the building blocks.
 */
export function PokemonCardComposed({ id, name, image, types }: PokemonCardComposedProps) {
  return (
    <PokemonCard id={id} name={name} image={image} types={types}>
      <PokemonCard.Image />
      <PokemonCard.Id />
      <PokemonCard.Name />
      <PokemonCard.Types />
      <PokemonCard.Actions />
    </PokemonCard>
  );
}
