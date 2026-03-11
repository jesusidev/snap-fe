import { pokemonRouter } from '~/domains/pokemon/server';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  pokemon: pokemonRouter,
});

export type AppRouter = typeof appRouter;
