# Snap FE

A minimal Next.js 16 boilerplate with all the frontend patterns from our production codebase. Uses the PokeAPI as a demo data source.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React Compiler)
- **Language:** TypeScript (strict mode)
- **API:** tRPC v11 + TanStack Query v5
- **Validation:** Zod v4
- **UI:** Mantine 8
- **Linting:** Biome

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## What's Included

### Architecture Patterns

- **Domain-driven folder structure** (`src/domains/pokemon/`)
- **Compound components** with `Object.assign` + Context (`PokemonCard`)
- **Service hooks** wrapping tRPC with notifications (`usePokemonService`)
- **Co-located state** in `components/card/state/`
- **Global state** via provider composition (`src/state/`)
- **Barrel exports** at every level (`index.ts`)

### Frontend Features

- **ViewTransitions** with source/destination mode hook (`useViewTransition`)
- **NavLink** wrapper showing loading overlay during navigation
- **Notification dispatcher** (event-based, never use Mantine directly)
- **Form initialization hook** (`useFormInitialization`)
- **Mobile-first CSS** with Mantine variables
- **Theme system** with custom colors and component variants
- **Environment validation** via `env.mjs` (Zod + `@t3-oss/env-nextjs`)

### Build Tools

- **Turbopack** for 3x faster builds
- **React Compiler** for automatic memoization
- **Biome** for linting and formatting

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── layout.tsx          # Root layout + providers
│   ├── page.tsx            # Homepage
│   ├── pokemon/
│   │   ├── page.tsx        # Pokemon list
│   │   └── [name]/page.tsx # Pokemon detail
│   └── api/trpc/           # tRPC API route
├── domains/
│   └── pokemon/
│       ├── components/     # Card (compound), Detail, List
│       │   └── card/state/ # Co-located context/provider/hook
│       ├── hooks/          # usePokemonService
│       ├── types/          # Zod schemas + TypeScript types
│       └── server/         # tRPC router (PokeAPI)
├── shared/
│   ├── components/         # NavLink, NavigationLoader
│   ├── hooks/              # useFormInitialization
│   └── types/              # Shared types
├── state/                  # Global providers
│   ├── notifications/      # Event-based notification system
│   ├── view-transition/    # ViewTransition context + hook
│   └── provider-builder.tsx
├── events/                 # Notification dispatcher
├── layouts/                # LayoutPage (header + main)
├── styles/                 # Theme, colors, breakpoints, CSS modules
├── server/api/             # tRPC setup
└── utils/                  # trpc client, queryClient, mergeclasses
```

## Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run check        # Lint + format check
npm run check:fix    # Auto-fix
npm run type-check   # TypeScript only
```

## Key Conventions

| Rule | Details |
|------|---------|
| Notifications | Use `useNotificationDispatcher()`, never `@mantine/notifications` |
| Navigation | Use `NavLink`, never `Link` from `next/link` |
| Env vars | Use `env.VARNAME` from `~/env.mjs`, never `process.env` |
| CSS | Mobile-first `min-width` only, use Mantine CSS variables |
| Inline styles | Theme callback pattern: `styles={(theme) => ({ ... })}` |
| State | Co-locate with component, or use `src/state/` for global |
