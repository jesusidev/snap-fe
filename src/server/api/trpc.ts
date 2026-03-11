import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const createTRPCContext = () => ({});

type Context = ReturnType<typeof createTRPCContext>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export { createTRPCContext };
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
