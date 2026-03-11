# Snap - Development Guidelines

> Minimal Next.js 16 boilerplate with tRPC, Mantine, and domain-driven architecture. No database, no auth — frontend patterns only. Uses PokeAPI as a demo data source.

---

## Build & Configuration

### Development Environment

```bash
npm install
npm run dev          # Start dev server at http://localhost:3000 (Turbopack)
```

### Build Commands

```bash
npm run build        # Production build (Turbopack)
npm run check        # TypeScript + lint + format check
npm run check:fix    # Auto-fix lint and format issues
```

### Environment Variables

All env vars are validated through `src/env.mjs` using `@t3-oss/env-nextjs` with Zod schemas.

**CRITICAL: Never use `process.env` directly in application code.**

```typescript
// CORRECT
import { env } from '~/env.mjs';
const appUrl = env.NEXT_PUBLIC_APP_URL;

// WRONG
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

**Exception:** `process.env.NODE_ENV` in `'use client'` files (Next.js inlines it at build time).

**Adding a new env var:**
1. Add Zod schema to `server:` or `client:` block in `src/env.mjs`
2. Add `VARNAME: process.env.VARNAME` to `runtimeEnv:`
3. Use `env.VARNAME` in code
4. Add to `.env` (safe default) or `.env.local.example` (secret)

### Next.js 16 Features

**Turbopack:** Default bundler, 3x faster builds. File system caching for dev restarts.

**React Compiler:** Automatic memoization — no manual `useMemo`/`useCallback`/`React.memo` needed for render optimization. Still use them when:
- A value is a dependency of `useEffect`
- You need referential stability for context values

**Configuration (`next.config.mjs`):**
```javascript
const config = {
  reactCompiler: true,
  experimental: {
    viewTransition: true,
    turbopackFileSystemCacheForDev: true,
  },
};
```

---

## Critical Rules

### Notifications

**ALWAYS use the notification dispatcher, NEVER Mantine notifications directly:**

```typescript
// CORRECT
import { useNotificationDispatcher } from '~/events';
const notificationDispatcher = useNotificationDispatcher();
notificationDispatcher.show({ message: 'Success', type: 'success' });

// WRONG
import { notifications } from '@mantine/notifications';
notifications.show({ message: 'Success' });  // DON'T DO THIS
```

### Navigation

**ALWAYS use `NavLink` for internal navigation:**

```typescript
// CORRECT — shows loading overlay
import { NavLink } from '~/shared/components/NavigationLoader';
<NavLink href="/pokemon">Pokedex</NavLink>

// WRONG — no loading feedback
import Link from 'next/link';
<Link href="/pokemon">Pokedex</Link>
```

Use `skipLoader` prop for same-page anchors: `<NavLink href="#section" skipLoader>`

### Service Hooks

**NEVER call tRPC directly in components. Always use service hooks:**

```typescript
// CORRECT
import { usePokemonService } from '~/domains/pokemon/hooks';
const pokemonService = usePokemonService();
const { data } = pokemonService.useList({ limit: 20, offset: 0 });

// WRONG
import { api } from '~/utils/trpc';
const { data } = api.pokemon.list.useQuery({ limit: 20, offset: 0 });
```

**Why?** Centralized error handling, notification integration, consistent staleTime config, prefetch methods, single source of truth.

### Mobile-First CSS

**ALWAYS use `min-width` media queries (never `max-width`):**

```css
/* Mobile base styles (no media query) */
.grid { justify-content: center; }

/* Tablet and up */
@media (min-width: 48em) {
  .grid { justify-content: flex-start; }
}
```

**Breakpoints:** `36em` (mobile), `48em` (tablet), `64em` (laptop), `74em` (desktop)

### CSS Variables

**ALWAYS use Mantine CSS variables, NEVER create custom `:root` variables:**

```css
/* CORRECT */
.container {
  background-color: var(--mantine-color-dark-7);
  color: var(--mantine-color-dark-0);
}

/* WRONG */
:root { --background: #121212; }
```

### Light/Dark Mode

Use the `light-dark()` CSS function for theme-aware styles:

```css
.card {
  background-color: light-dark(
    var(--mantine-color-white),
    var(--mantine-color-dark-6)
  );
}
```

### Inline Styles

**ALWAYS use theme callback, NEVER direct object pattern:**

```typescript
// CORRECT
<Textarea styles={(theme) => ({
  input: { fontSize: theme.fontSizes.md, backgroundColor: theme.colors.dark[7] },
})} />

// WRONG
<Textarea styles={{ input: { fontSize: '1rem' } }} />
```

### Theme Colors

**Extend Mantine defaults, NEVER replace entirely:**

```typescript
// CORRECT — extends default palette
export const theme = createTheme({
  colors: { brand: color.brand },
});

// WRONG — replaces entire palette, breaks light mode
export const theme = createTheme({
  colors: color,  // DON'T DO THIS
});
```

### Hydration Safety

Client-only values (localStorage, color scheme, etc.) must be deferred to `useEffect` or guarded with a `mounted` state to avoid SSR hydration mismatches:

```typescript
// Color scheme toggle — stable SSR default
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

{mounted
  ? (computedColorScheme === 'dark' ? <IconSun /> : <IconMoon />)
  : <IconSun />  // Stable default for SSR
}
```

---

## Architecture Patterns

### Domain-Driven Folder Structure

```
src/
├── app/                        # Next.js App Router pages
├── domains/                    # Domain-specific code
│   └── pokemon/
│       ├── components/         # UI components
│       │   ├── card/           # Compound component
│       │   │   └── state/      # Co-located context/provider/hook
│       │   ├── detail/
│       │   └── list/
│       ├── hooks/              # Service hooks (usePokemonService)
│       ├── types/              # Zod schemas + TypeScript types
│       └── server/             # tRPC router
├── events/                     # Type-safe event system
├── shared/
│   ├── components/             # Cross-cutting UI (NavLink, NavigationLoader, NetworkStatusMonitor)
│   ├── hooks/                  # Shared hooks (usePendingAction, useFormInitialization)
│   └── utils/                  # Shared utilities (pending-action storage)
├── state/                      # Global state (providers, contexts)
│   ├── lenis/
│   ├── notifications/
│   ├── trainer/
│   └── view-transition/
├── layouts/                    # Page layout components
├── styles/                     # Theme, colors, breakpoints, CSS modules
└── utils/                      # Core utilities (tRPC client, queryClient)
```

**When to use each location:**
- `domains/` — Code specific to a business domain
- `shared/` — Reusable code used across multiple domains
- `events/` — Event system for cross-cutting concerns
- `state/` — Global-only client state. Component-scoped state belongs co-located with its component
- `layouts/` — Page shells (header, footer, navigation)

### Service Hooks Pattern

Each domain has a service hook wrapping tRPC with domain-specific config:

```typescript
export function usePokemonService() {
  const notificationDispatcher = useNotificationDispatcher();

  function useList(params?) {
    return api.pokemon.list.useQuery(
      { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
      { staleTime: 1000 * 60 * 10 }
    );
  }

  function useByName(name: string) {
    return api.pokemon.byName.useQuery(
      { name },
      { staleTime: 1000 * 60 * 30, retry: ... }
    );
  }

  function usePrefetchList() {
    const utils = api.useUtils();
    return (params?) => {
      void utils.pokemon.list.prefetch(
        { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
        { staleTime: 1000 * 60 * 10 }
      );
    };
  }

  function usePrefetchByName() {
    const utils = api.useUtils();
    return (name: string) => {
      void utils.pokemon.byName.prefetch(
        { name },
        { staleTime: 1000 * 60 * 30 }
      );
    };
  }

  return { useList, useByName, useSearch, usePrefetchList, usePrefetchByName };
}
```

### Prefetching

Three layers of prefetching for near-instant navigation:

| Layer | What | When | How |
|-------|------|------|-----|
| Route bundle | Page JS/CSS | Element enters viewport | Next.js `<Link>` automatic |
| List data | First page of results | Hover CTA button | `usePrefetchList()` on `onMouseEnter` |
| Detail data | Single item | Hover card | `usePrefetchByName()` on `onMouseEnter` |

```tsx
// Homepage — prefetch list on hover
const prefetchList = pokemonService.usePrefetchList();
<Button onMouseEnter={() => prefetchList()}>Explore the Pokedex</Button>

// Card — prefetch detail on hover
const prefetch = pokemonService.usePrefetchByName();
<MantineCard onMouseEnter={() => prefetch(name)}>...</MantineCard>
```

### Compound Components

The Object.assign + Context pattern for flexible composition:

```tsx
// Sub-components share state through context
export const PokemonCard = Object.assign(PokemonCardRoot, {
  Image: CardImage,
  Name: CardName,
  Types: CardTypes,
  Favorite: CardFavorite,
  Actions: CardActions,
});

// Flexible usage
<PokemonCard id={25} name="pikachu" image="..." types={['electric']}>
  <PokemonCard.Image />
  <PokemonCard.Name />
  <PokemonCard.Types />
</PokemonCard>

// Or use the pre-composed convenience wrapper
<PokemonCardComposed id={25} name="pikachu" image="..." />
```

See [Component Patterns](./component-patterns.md) for full details.

### Co-Located State

State scoped to a component lives in a `state/` subdirectory next to it:

```
components/card/
├── state/
│   ├── card-context.tsx      # createContext
│   ├── card-provider.tsx     # Provider with memoized value
│   └── use-pokemon-card.tsx  # Consumer hook with guard
├── PokemonCard.tsx
└── index.ts
```

Global state shared across domains lives in `src/state/`.

### Provider Composition

Global providers are composed without deep JSX nesting:

```tsx
const appProviders = [
  [LenisProvider, { smoothWheel: true }],
  [ViewTransitionProvider, {}],
  [NotificationProvider, {}],
  [TrainerProvider, {}],
] as const;

<Providers providers={appProviders}>{children}</Providers>
```

### Event System

Type-safe CustomEvent system for decoupled communication:

```typescript
// Dispatch
const { dispatch } = useEvent('pokemon:search');
dispatch({ query: 'pikachu', resultCount: 1 });

// Listen
useEvent('pokemon:search', (payload) => {
  console.log(payload.query);
});
```

**Naming convention:** `domain:action` (e.g., `pokemon:viewed`, `notification:show`)

See [Events & Notifications](./events-and-notifications.md) for full details.

### Deferred Actions

Store user actions when a precondition isn't met, execute after it's satisfied:

```typescript
// Store action if precondition not met
const { store } = useStorePendingAction();
const deferred = store('favorite', pokemonId, pokemonName);
if (deferred) return; // Modal opened, action stored

// Auto-execute on target page when precondition is met
usePendingAction(pokemon.id, pokemon.name, {
  onFavoriteExecuted: () => setIsFavorite(true),
});
```

Two storage slots with per-key expiration:
- `pending_pokemon_action` — 10-minute expiry (gated actions)
- `last_viewed_pokemon` — 24-hour expiry (resume flow)

See [Deferred Actions](./deferred-actions.md) for full details.

### View Transitions

Shared-element transitions between list and detail pages:

```tsx
// Source (card) — conditional name
<ViewTransition name={getViewTransitionName(String(id))}>
  <Image ... />
</ViewTransition>

// Destination (detail) — static name
<ViewTransition name={`item-image-${pokemon.id}`}>
  <Image ... />
</ViewTransition>
```

See [View Transitions](./view-transitions.md) for full details.

### Smooth Scrolling (Lenis)

Global smooth scrolling via [Lenis](https://lenis.darkroom.engineering/). Enabled in `LenisProvider` with configurable per-page overrides:

```tsx
import { useLenis, LenisConfig } from '~/state';

// Access the Lenis instance and scrollTo helper
const { lenis, scrollTo } = useLenis();

// Programmatic scroll
scrollTo('#section', { offset: -80, duration: 1.2 });

// Per-page speed override (renders nothing, sets context)
<LenisConfig wheelMultiplier={0.35} touchMultiplier={0.6} />
```

**Opt out** for specific elements: add `data-lenis-prevent` attribute to prevent Lenis from intercepting scroll on that element (e.g., scrollable modals, code blocks).

### Types Organization

- **Zod schemas** for tRPC input validation
- **Plain interfaces** for API response shapes
- Domain types in `src/domains/<domain>/types/`
- Shared types in `src/shared/types/`

```typescript
// Zod schema → inferred type
export const pokemonListInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});
export type PokemonListInput = z.infer<typeof pokemonListInput>;

// Plain interface for API shape
export interface Pokemon {
  id: number;
  name: string;
  image: string;
}
```

### Form Initialization

Use the `useFormInitialization` hook to prevent infinite loops when populating forms from async data:

```typescript
useFormInitialization({
  form,
  opened,
  data,
  mapData: (data) => ({ name: data.name }),
});
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `PokemonCard.tsx` |
| Hook | camelCase with `use` prefix | `usePokemonService.tsx` |
| Context | kebab-case | `card-context.tsx` |
| Provider | kebab-case | `card-provider.tsx` |
| CSS Module | matches component | `PokemonCard.module.css` |
| Types | kebab-case | `pokemon.ts` |
| Barrel | `index.ts` | `index.ts` |

---

## Import Paths

```typescript
// Domain code
import { PokemonCard } from '~/domains/pokemon/components/card';
import { usePokemonService } from '~/domains/pokemon/hooks';
import type { Pokemon } from '~/domains/pokemon/types';

// Shared
import { NavLink } from '~/shared/components/NavigationLoader';
import { usePendingAction } from '~/shared/hooks';

// State
import { useViewTransition, useTrainer } from '~/state';

// Events
import { useEvent, useNotificationDispatcher } from '~/events';

// Utils
import { api } from '~/utils/trpc';
import { env } from '~/env.mjs';
```

---

## Quick Reference

| Rule | Details |
|------|---------|
| Notifications | `useNotificationDispatcher()`, never `@mantine/notifications` |
| Navigation | `NavLink` from `~/shared/components/NavigationLoader` |
| Data fetching | Service hooks from `~/domains/<domain>/hooks` |
| Prefetching | `usePrefetchList()` / `usePrefetchByName()` on `onMouseEnter` |
| Env vars | `env.VARNAME` from `~/env.mjs`, never `process.env` |
| CSS | Mobile-first `min-width`, Mantine variables, `light-dark()` |
| Inline styles | Theme callback: `styles={(theme) => ({ ... })}` |
| Theme colors | Extend defaults: `colors: { brand: ... }`, never replace |
| State | Co-locate with component, or `src/state/` for global |
| Events | `domain:action` naming, small serializable payloads |
| Types | Zod for validation, interfaces for API shapes |
| Hydration | Defer client-only values to `useEffect` or `mounted` guard |
| Smooth scroll | `useLenis` / `LenisConfig` from `~/state`, `data-lenis-prevent` to opt out |
