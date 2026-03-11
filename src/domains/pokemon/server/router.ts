import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import type { PokemonDetail, PokemonFull, PokemonListResponse } from '../types';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

function getOfficialArtwork(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return Number(parts[parts.length - 1]);
}

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const res = await fetch(
        `${POKEAPI_BASE}/pokemon?limit=${input.limit}&offset=${input.offset}`
      );

      if (!res.ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch Pokemon' });
      }

      const data: PokemonListResponse = await res.json();

      return {
        count: data.count,
        pokemon: data.results.map((p) => {
          const id = extractIdFromUrl(p.url);
          return {
            id,
            name: p.name,
            image: getOfficialArtwork(id),
          };
        }),
        hasMore: data.next !== null,
      };
    }),

  byName: publicProcedure.input(z.object({ name: z.string().min(1) })).query(async ({ input }) => {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${input.name.toLowerCase()}`);

    if (!res.ok) {
      if (res.status === 404) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Pokemon "${input.name}" not found` });
      }
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch Pokemon' });
    }

    const data: PokemonDetail = await res.json();

    const pokemon: PokemonFull = {
      id: data.id,
      name: data.name,
      image:
        data.sprites.other?.['official-artwork']?.front_default ??
        data.sprites.front_default ??
        getOfficialArtwork(data.id),
      types: data.types.map((t) => t.type.name),
      height: data.height,
      weight: data.weight,
      baseExperience: data.base_experience,
      stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
      abilities: data.abilities.map((a) => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      })),
    };

    return pokemon;
  }),
});
