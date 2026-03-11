# Frontend Development Guide

Onboarding guide for the Snap boilerplate. Covers folder organization, component creation, styling, state management, data fetching, navigation, and tooling.

---

## 1. Architecture Overview

```
src/
├── app/                    # Next.js App Router pages
├── domains/                # Domain-specific code
│   └── pokemon/
│       ├── components/     # UI components (card/, list/, detail/)
│       ├── hooks/          # Service hooks (usePokemonService)
│       ├── server/         # tRPC router
│       └── types/          # Zod schemas + TypeScript types
├── events/                 # Type-safe event system
├── layouts/                # Page layout components
├── shared/
│   ├── components/         # Cross-cutting UI (NavigationLoader, NetworkStatusMonitor)
│   ├── hooks/              # Shared hooks (usePendingAction, useFormInitialization)
│   └── utils/              # Utilities (pending-action storage)
├── state/                  # Global state (providers, contexts)
│   ├── lenis/
│   ├── notifications/
│   ├── trainer/
│   └── view-transition/
├── styles/                 # Theme, colors, CSS modules
└── utils/                  # Core utilities (trpc client, queryClient)
```

### Domain-driven + feature-slice

Code is organized by **business domain** first, then by feature type within:

```
domains/pokemon/
├── components/
│   ├── card/               # Card compound component
│   │   ├── state/          # Co-located context + provider + hook
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonCard.module.css
│   │   ├── PokemonCardComposed.tsx
│   │   └── index.ts
│   ├── detail/
│   └── list/
├── hooks/
│   └── usePokemonService.tsx
├── server/
│   └── router.ts
└── types/
    └── pokemon.ts
```

**Rules:**
- Domain code lives in `src/domains/<domain>/`
- Cross-cutting code lives in `src/shared/`
- Global-only state lives in `src/state/` (never component-scoped state)
- Each directory has an `index.ts` barrel export

---

## 2. Component Creation

### Simple component

```tsx
// src/domains/pokemon/components/list/PokemonList.tsx
'use client';

import { Container, Title } from '@mantine/core';
import classes from './PokemonList.module.css';

export function PokemonList() {
  return (
    <Container size="xl" py="xl">
      <Title order={2}>Pokedex</Title>
    </Container>
  );
}
```

### Compound component (Object.assign pattern)

For components with multiple related sub-parts that share state through context. See [Component Patterns](./component-patterns.md) for full details.

```tsx
// Usage
<PokemonCard id={25} name="pikachu" image="/pikachu.png" types={['electric']}>
  <PokemonCard.Image />
  <PokemonCard.Name />
  <PokemonCard.Types />
  <PokemonCard.Actions />
</PokemonCard>
```

### Pre-composed variant

Provide a convenience wrapper with a default layout:

```tsx
export function PokemonCardComposed({ id, name, image, types }: Props) {
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
```

---

## 3. Styling

### CSS Modules + Mantine

- Use **Mantine props** for simple styling: `<Text c="dimmed" fz="sm">`
- Use **CSS modules** for complex layouts, animations, or pseudo-selectors
- **Never** create custom `:root` variables — use Mantine CSS variables

```css
/* PokemonCard.module.css */
.card {
  width: 220px;
  transition: transform 200ms ease;
  background-color: light-dark(
    var(--mantine-color-white),
    var(--mantine-color-dark-6)
  );
}

.card:hover {
  transform: translateY(-4px);
}
```

### Mobile-first CSS

Always use `min-width` media queries (never `max-width`):

```css
/* Mobile base styles (no media query) */
.grid {
  justify-content: center;
}

/* Tablet and up */
@media (min-width: 48em) {
  .grid {
    justify-content: flex-start;
  }
}
```

**Breakpoints:** `36em` (mobile), `48em` (tablet), `64em` (laptop), `74em` (desktop)

### Light/dark mode

Use CSS `light-dark()` function for theme-aware values:

```css
.header {
  background-color: light-dark(
    var(--mantine-color-white),
    var(--mantine-color-dark-7)
  );
  border-bottom: 1px solid light-dark(
    var(--mantine-color-gray-3),
    var(--mantine-color-dark-5)
  );
}
```

### Common Mantine variables

| Purpose | Variable |
|---------|----------|
| Deep background | `--mantine-color-dark-9` |
| Primary background | `--mantine-color-dark-7` |
| Primary text | `--mantine-color-dark-0` |
| Muted text | `--mantine-color-dark-2` |
| Body font | `--mantine-font-family` |
| Heading font | `--mantine-font-family-headings` |

### Inline styles — always use theme callback

```tsx
// CORRECT
<Textarea styles={(theme) => ({
  input: {
    fontSize: theme.fontSizes.md,
    backgroundColor: theme.colors.dark[7],
  },
})} />

// WRONG — hardcoded values
<Textarea styles={{ input: { fontSize: '1rem' } }} />
```

---

## 4. Theme System

Defined in `src/styles/theme.ts`:

```typescript
import { createTheme } from '@mantine/core';
import { color } from './colors';

export const theme = createTheme({
  colors: {
    brand: color.brand,  // Extends Mantine defaults — never replace entirely
  },
  primaryColor: 'brand',
  primaryShade: 5,
  fontFamily: 'Inter, sans-serif',
  // ...
});
```

**Key rule:** `colors: { brand: color.brand }` extends the default palette. Using `colors: color` would replace it entirely and break light mode (Mantine needs its default colors for built-in components).

### Color scheme toggle

Uses `useMantineColorScheme` + `useComputedColorScheme`:

```tsx
function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <ActionIcon onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}>
      {mounted
        ? (computedColorScheme === 'dark' ? <IconSun /> : <IconMoon />)
        : <IconSun />  // Stable SSR default — prevents hydration mismatch
      }
    </ActionIcon>
  );
}
```

**Why the `mounted` guard?** The server doesn't know the user's color scheme, so it would render a different icon than the client. Rendering a stable default until after hydration avoids the mismatch.

---

## 5. State Management

### Provider composition

All global providers are composed via the `Providers` builder in `src/app/providers.tsx`:

```tsx
const appProviders = [
  [LenisProvider, { smoothWheel: true }],
  [ViewTransitionProvider, {}],
  [NotificationProvider, {}],
  [TrainerProvider, {}],
] as const;

<Providers providers={appProviders}>
  {children}
</Providers>
```

The `Providers` component uses `reduceRight` to nest them without deep JSX indentation.

### Co-located state (component-scoped)

State that belongs to a specific component lives next to it:

```
components/card/
├── state/
│   ├── card-context.tsx    # createContext
│   ├── card-provider.tsx   # Provider with memoized value
│   └── use-pokemon-card.tsx # Consumer hook with guard
├── PokemonCard.tsx
└── index.ts
```

### Global state (app-scoped)

State used across multiple domains lives in `src/state/`:

```
state/
├── lenis/             # Smooth scrolling (Lenis)
├── notifications/     # Listens to notification events → Mantine toasts
├── trainer/           # Trainer name (localStorage), setup modal
├── view-transition/   # Shared-element transition coordination
├── provider-builder.tsx
└── index.ts
```

**Rule:** `src/state/` is for global-only state. Never put component-scoped state here.

---

## 6. Pages & Data Fetching

### Page structure

Pages live in `src/app/` following Next.js App Router conventions:

```
app/
├── page.tsx              # Homepage (client component)
├── page.module.css
├── pokemon/
│   ├── page.tsx          # List page
│   └── [name]/
│       └── page.tsx      # Detail page (server component passing name to client)
└── api/
    └── trpc/[trpc]/
        └── route.ts      # tRPC handler
```

### Server component → Client component handoff

```tsx
// src/app/pokemon/[name]/page.tsx (Server Component)
import { use } from 'react';
import { PokemonDetailClient } from '~/domains/pokemon/components/detail';

export default function PokemonPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  return <PokemonDetailClient name={name} />;
}
```

### Service hooks (tRPC + TanStack Query)

Each domain has a service hook that wraps tRPC queries with domain-specific configuration:

```tsx
// src/domains/pokemon/hooks/usePokemonService.tsx
export function usePokemonService() {
  const notificationDispatcher = useNotificationDispatcher();

  const useList = (input: PokemonListInput) =>
    api.pokemon.list.useQuery(input, { staleTime: 10 * 60 * 1000 });

  const useByName = (name: string) =>
    api.pokemon.byName.useQuery({ name }, {
      staleTime: 30 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error.data?.code === 'NOT_FOUND') return false;
        return failureCount < 3;
      },
    });

  return { useList, useByName, usePrefetchList, usePrefetchByName };
}
```

**Usage in components:**

```tsx
const pokemonService = usePokemonService();
const { data, isPending, isError } = pokemonService.useList({ limit: 20, offset: 0 });
```

### Prefetching

Service hooks expose prefetch methods that prime the TanStack Query cache on hover, so data is ready before the user clicks.

```tsx
const pokemonService = usePokemonService();
const prefetchList = pokemonService.usePrefetchList();
const prefetchByName = pokemonService.usePrefetchByName();

// Prefetch the list when hovering a CTA button
<Button onMouseEnter={() => prefetchList()}>Explore the Pokedex</Button>

// Prefetch a detail page when hovering a card
<MantineCard onMouseEnter={() => prefetchByName('pikachu')}>...</MantineCard>
```

Prefetch methods use `api.useUtils()` under the hood:

```tsx
function usePrefetchByName() {
  const utils = api.useUtils();

  return (name: string) => {
    void utils.pokemon.byName.prefetch(
      { name },
      { staleTime: 1000 * 60 * 30 }
    );
  };
}
```

**Three layers of prefetching in the app:**

| Layer | What | When | How |
|-------|------|------|-----|
| Route bundle | Page JS/CSS | Card enters viewport | Next.js `<Link>` automatic |
| List data | First 20 Pokemon | Hover "Explore the Pokedex" | `usePrefetchList()` |
| Detail data | Single Pokemon | Hover a card | `usePrefetchByName()` |

---

## 7. Navigation

### Always use NavLink for internal navigation

`NavLink` wraps Next.js `Link` and triggers a loading overlay during navigation:

```tsx
import { NavLink } from '~/shared/components/NavigationLoader';

<NavLink href="/pokemon">Pokedex</NavLink>
<NavLink href="#section" skipLoader>Jump</NavLink>  // Skip for anchors
```

The `NavigationLoaderProvider` watches `usePathname()` changes and auto-clears the overlay when navigation completes.

**When to use each:**
- `NavLink` — All internal page navigation
- `Link` (Next.js) — External links, or when you explicitly don't want loading feedback

---

## 8. Forms

### Form initialization from async data

Use a ref to prevent infinite loops when populating forms:

```tsx
import { useFormInitialization } from '~/shared/hooks';

const form = useForm<FormValues>({ initialValues: { name: '' } });

useFormInitialization({
  form,
  opened,  // modal open state
  data,    // async data
  mapData: (data) => ({ name: data.name }),
});
```

The hook uses an `initializedRef` that resets when `opened` becomes false, so reopening the modal re-initializes the form.

---

## 9. Types Organization

### Zod schemas + inferred types

Define schemas in the domain's `types/` directory and infer TypeScript types from them:

```typescript
// src/domains/pokemon/types/pokemon.ts
import { z } from 'zod';

export const pokemonListInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type PokemonListInput = z.infer<typeof pokemonListInput>;

// Non-Zod types for API responses
export interface Pokemon {
  id: number;
  name: string;
  image: string;
}
```

**Rules:**
- Zod schemas for tRPC input validation
- Plain TypeScript interfaces for API response shapes
- Types live in `src/domains/<domain>/types/`
- Shared types live in `src/shared/types/`

---

## 10. Environment Variables

All env vars are validated through `src/env.mjs` using Zod + `@t3-oss/env-nextjs`:

```typescript
import { env } from '~/env.mjs';
const appUrl = env.NEXT_PUBLIC_APP_URL;

// WRONG — never access process.env directly
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

**Exception:** `process.env.NODE_ENV` in `'use client'` files (Next.js build-time inlining).

To add a new env var:
1. Add Zod schema to `server:` or `client:` block in `env.mjs`
2. Add to `runtimeEnv:`
3. Use `env.VAR_NAME` in code

---

## 11. Tooling

### React Compiler

Enabled in `next.config.mjs`. Automatically memoizes components and hooks — you generally don't need manual `useMemo`/`useCallback` for render optimization. Still use them when:
- A value is a dependency of `useEffect`
- You need referential stability for context values

### Turbopack

Dev server uses Turbopack for faster builds. Enabled by default in Next.js 16. No code changes needed.

### Biome

Linting and formatting in one tool. Run `npm run check` to validate, `npm run check:fix` to auto-fix.

---

## Quick Reference

### Import paths

```typescript
// Domain code
import { PokemonCard } from '~/domains/pokemon/components/card';
import { usePokemonService } from '~/domains/pokemon/hooks';
import type { Pokemon } from '~/domains/pokemon/types';

// Shared
import { NavLink } from '~/shared/components/NavigationLoader';
import { usePendingAction } from '~/shared/hooks';

// State
import { useLenis, useViewTransition, useTrainer } from '~/state';

// Events
import { useEvent, useNotificationDispatcher } from '~/events';

// Utils
import { api } from '~/utils/trpc';
import { env } from '~/env.mjs';
```

### File naming

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `PokemonCard.tsx` |
| Hook | camelCase with `use` prefix | `usePokemonService.tsx` |
| Context | kebab-case | `card-context.tsx` |
| Provider | kebab-case | `card-provider.tsx` |
| CSS Module | matches component | `PokemonCard.module.css` |
| Types | kebab-case | `pokemon.ts` |
| Barrel | `index.ts` | `index.ts` |
