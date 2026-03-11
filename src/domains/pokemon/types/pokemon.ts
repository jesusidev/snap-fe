import { z } from 'zod';

// --- Zod schemas (for tRPC input validation) ---

export const pokemonListInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type PokemonListInput = z.infer<typeof pokemonListInput>;

// --- Response types (from PokeAPI) ---

export type PokemonListItem = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
};

export type PokemonStat = {
  base_stat: number;
  stat: {
    name: string;
  };
};

export type PokemonType = {
  type: {
    name: string;
  };
};

export type PokemonAbility = {
  ability: {
    name: string;
  };
  is_hidden: boolean;
};

export type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
};

// --- Derived types for our UI ---

export type Pokemon = {
  id: number;
  name: string;
  image: string;
  types: string[];
};

export type PokemonFull = Pokemon & {
  height: number;
  weight: number;
  baseExperience: number;
  stats: { name: string; value: number }[];
  abilities: { name: string; isHidden: boolean }[];
};
