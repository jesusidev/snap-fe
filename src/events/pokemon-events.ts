import type { AppEvent } from './types';

export interface PokemonEvents {
  'pokemon:search': AppEvent<{
    query: string;
    resultCount: number;
  }>;
  'pokemon:viewed': AppEvent<{
    pokemonId: number;
    pokemonName: string;
  }>;
  'pokemon:page-changed': AppEvent<{
    page: number;
    offset: number;
  }>;
}

export type PokemonEventName = keyof PokemonEvents;
