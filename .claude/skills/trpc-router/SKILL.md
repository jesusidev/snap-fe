---
name: trpc-router
description: Create tRPC routers for API endpoints
allowed-tools: Read, Write, Edit, Glob, Grep
---

# tRPC Router Skill

Create tRPC routers following project patterns. This project has no database or auth — routers call external APIs (like PokeAPI).

## File Location

```
src/domains/{domain}/server/router.ts
```

Register in `src/server/api/root.ts`.

## Template

```typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const {domain}Router = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const response = await fetch(
        `https://api.example.com/items?limit=${input.limit}&offset=${input.offset}`
      );
      const data = await response.json();

      return {
        items: data.results.map(transformItem),
        count: data.count,
        hasMore: input.offset + input.limit < data.count,
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(`https://api.example.com/items/${input.id}`);

      if (!response.ok) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Item "${input.id}" not found`,
        });
      }

      const data = await response.json();
      return transformItemDetail(data);
    }),
});
```

## Registration

```typescript
// src/server/api/root.ts
import { {domain}Router } from '~/domains/{domain}/server/router';

export const appRouter = createTRPCRouter({
  {domain}: {domain}Router,
});
```

## Key Rules

- All procedures are `publicProcedure` (no auth in this project)
- Use Zod schemas for input validation
- Transform API responses to clean TypeScript types
- Throw `TRPCError` with proper codes for errors
- Keep router files focused — one domain per router

## Zod Schema Convention

Define input schemas in `src/domains/{domain}/types/`:

```typescript
// src/domains/{domain}/types/{domain}.ts
import { z } from 'zod';

export const {domain}ListInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type {Domain}ListInput = z.infer<typeof {domain}ListInput>;
```

Then import in the router:

```typescript
import { {domain}ListInput } from '~/domains/{domain}/types';
```

## After Creating a Router

1. Register in `src/server/api/root.ts`
2. Create a service hook in `src/domains/{domain}/hooks/`
3. Include prefetch methods in the service hook
