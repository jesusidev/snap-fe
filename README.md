# Snap

A minimal Next.js 16 boilerplate showcasing production frontend patterns without the backend complexity. No database, no auth — just clean architecture you can clone and build on. Uses the [PokeAPI](https://pokeapi.co/docs/v2) as a demo data source.

## Prerequisites

This project uses [Volta](https://volta.sh/) to pin Node.js and npm versions. Install Volta, then it automatically manages the correct versions:

```bash
curl https://get.volta.sh | bash
```

Node 24 (LTS) and npm 11 are pinned in `package.json` — Volta handles the rest.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Features

### Pages

- **Homepage** — Hero section with "Welcome back" resume modal that detects your last viewed Pokemon
- **Pokedex** (`/pokemon`) — Paginated Pokemon grid with search filter, "continue where you left off" banner, favorite buttons
- **Detail** (`/pokemon/[name]`) — Full Pokemon stats, abilities, types, with shared-element transition from the list

### Light/Dark Mode

Toggle between light and dark color schemes. Uses Mantine's `useMantineColorScheme` + `useComputedColorScheme` with a `mounted` guard to prevent SSR hydration mismatches. CSS uses `light-dark()` for theme-aware colors.

### Compound Components

`PokemonCard` uses the Object.assign + Context pattern for flexible composition:

```tsx
<PokemonCard id={25} name="pikachu" image="..." types={['electric']}>
  <PokemonCard.Image />
  <PokemonCard.Name />
  <PokemonCard.Types />
  <PokemonCard.Favorite />
  <PokemonCard.Actions />
</PokemonCard>
```

Sub-components share state through a co-located context (`components/card/state/`) without prop drilling.

### View Transitions

Smooth shared-element animations between list and detail pages using React's `<ViewTransition>` and a custom `useViewTransition` hook. Click a card and watch the image animate into the detail page. Back navigation animates in reverse.

### Type-Safe Event System

Decoupled component communication using browser CustomEvents with full TypeScript inference:

```tsx
// Dispatch
const { dispatch } = useEvent('pokemon:search');
dispatch({ query: 'pikachu', resultCount: 1 });

// Listen
useEvent('pokemon:search', (payload) => {
  console.log(payload.query); // fully typed
});
```

Event domains: `pokemon:search`, `pokemon:viewed`, `pokemon:page-changed`, `notification:show`.

### Notification Dispatcher

Event-driven notifications — components dispatch events, a centralized provider renders Mantine toasts:

```tsx
const notificationDispatcher = useNotificationDispatcher();
notificationDispatcher.show({ message: 'Added to favorites!', type: 'success' });
```

Components never call Mantine's `notifications.show()` directly.

### Deferred Actions

Pending action pattern for gating features behind a precondition. Click "favorite" without a trainer name set and the action is stored in `localStorage`. After completing setup, the action auto-executes.

Two flows built on the same storage layer:
- **Gated actions** — Favorite a Pokemon without a trainer name. Action deferred, setup modal opens, action executes after name is set.
- **Resume flow** — Visit a Pokemon detail page, navigate away, come back. Homepage shows a "Welcome back" modal offering to take you back. List page shows a banner.

Storage has per-key expiration: 10 minutes for deferred actions, 24 hours for resume (configurable).

### Service Hooks

Domain-specific hooks wrapping tRPC with TanStack Query configuration, error handling, and notifications:

```tsx
const pokemonService = usePokemonService();
const { data, isPending } = pokemonService.useList({ limit: 20, offset: 0 });
const { data: pokemon } = pokemonService.useByName('pikachu');
```

### Hover Prefetching

Three layers of prefetching for near-instant page loads:

| Layer | What | When |
|-------|------|------|
| Route bundle | Page JS/CSS | Card enters viewport (Next.js `<Link>` automatic) |
| List data | First 20 Pokemon | Hover "Explore the Pokedex" button |
| Detail data | Single Pokemon | Hover a card |

Service hooks expose `usePrefetchList()` and `usePrefetchByName()` that prime the TanStack Query cache on hover. When the user clicks, the target page renders with cached data — no loading skeleton.

```tsx
const pokemonService = usePokemonService();
const prefetchByName = pokemonService.usePrefetchByName();

<MantineCard onMouseEnter={() => prefetchByName(name)}>...</MantineCard>
```

### Smooth Scrolling (Lenis)

Butter-smooth scrolling powered by [Lenis](https://lenis.darkroom.engineering/). Enabled globally via `LenisProvider` with configurable duration, easing, and per-page overrides.

```tsx
import { useLenis, LenisConfig } from '~/state';

// Programmatic smooth scroll
const { scrollTo } = useLenis();
scrollTo('#section', { offset: -80, duration: 1.2 });

// Per-page speed override (drop into any page component)
<LenisConfig wheelMultiplier={0.35} touchMultiplier={0.6} />
```

Add `data-lenis-prevent` to any element that should keep native scroll behavior (scrollable modals, code blocks, etc.).

### Network Status Monitor

Automatic offline/online and slow connection detection. Renders nothing — just listens to browser network events and dispatches notifications through the event system:

- **Offline** — Persistent error notification: "No internet connection"
- **Back online** — Success notification (only shown if previously offline)
- **Slow connection** — Warning when `effectiveType` is 2g/slow-2g, RTT > 1s, or downlink < 0.5 Mbps

Uses the Network Information API where available, with graceful fallback to basic online/offline events.

### Navigation Loader

`NavLink` wraps Next.js `Link` and shows a loading overlay during page transitions. Auto-clears when `usePathname()` changes.

### Provider Composition

Global state providers composed without deep JSX nesting:

```tsx
const appProviders = [
  [LenisProvider, { smoothWheel: true }],
  [ViewTransitionProvider, {}],
  [NotificationProvider, {}],
  [TrainerProvider, {}],
] as const;

<Providers providers={appProviders}>{children}</Providers>
```

### Environment Validation

All env vars validated at build time via Zod + `@t3-oss/env-nextjs`. Use `env.VARNAME`, never `process.env`.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| Language | TypeScript (strict mode) |
| API | tRPC v11 + TanStack Query v5 |
| Smooth Scroll | Lenis |
| Validation | Zod v4 |
| UI | Mantine 8 |
| Linting | Biome |
| Toolchain | Volta (pinned Node 24 LTS + npm 11) |

---

## Project Structure

```
src/
├── app/                        # Next.js pages
│   ├── page.tsx                # Homepage + resume modal
│   ├── pokemon/
│   │   ├── page.tsx            # Pokemon list
│   │   └── [name]/page.tsx     # Pokemon detail
│   └── api/trpc/               # tRPC API route
├── domains/
│   └── pokemon/
│       ├── components/
│       │   ├── card/           # Compound component
│       │   │   └── state/      # Co-located context/provider/hook
│       │   ├── detail/         # Detail page client component
│       │   └── list/           # List + resume banner
│       ├── hooks/              # usePokemonService
│       ├── types/              # Zod schemas + TypeScript types
│       └── server/             # tRPC router (PokeAPI)
├── events/                     # Type-safe event system
│   ├── use-event.ts            # Core dispatch/listen hook
│   ├── use-notification-dispatcher.ts
│   ├── notification-events.ts
│   └── pokemon-events.ts
├── shared/
│   ├── components/             # NavLink, NavigationLoader, NetworkStatusMonitor
│   ├── hooks/                  # usePendingAction, useFormInitialization
│   └── utils/                  # Pending action storage
├── state/                      # Global providers
│   ├── lenis/                  # Smooth scrolling (Lenis)
│   ├── notifications/          # Event-driven notification provider
│   ├── trainer/                # Trainer name gate + setup modal
│   ├── view-transition/        # ViewTransition context + hook
│   └── provider-builder.tsx    # Composition utility
├── layouts/                    # LayoutPage (header, nav, color toggle)
├── styles/                     # Theme, colors, breakpoints, CSS modules
└── utils/                      # tRPC client, queryClient
```

---

## Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run check        # TypeScript + lint + format
npm run check:fix    # Auto-fix issues
```

---

## Key Conventions

| Rule | Details |
|------|---------|
| Notifications | Use `useNotificationDispatcher()`, never `@mantine/notifications` directly |
| Navigation | Use `NavLink` from `~/shared/components/NavigationLoader` for internal links |
| Data fetching | Service hooks from `~/domains/<domain>/hooks`, never tRPC directly |
| Prefetching | `usePrefetchList()` / `usePrefetchByName()` on `onMouseEnter` |
| Env vars | Use `env.VARNAME` from `~/env.mjs`, never `process.env` |
| CSS | Mobile-first (`min-width` only), Mantine CSS variables, `light-dark()` for theming |
| Inline styles | Theme callback: `styles={(theme) => ({ ... })}` |
| Theme colors | Extend defaults: `colors: { brand: ... }`, never replace entire palette |
| State | Co-locate with component, or `src/state/` for global-only |
| Events | `domain:action` naming, keep payloads small and serializable |
| Types | Zod schemas for validation, plain interfaces for API shapes |
| Hydration | Defer client-only values to `useEffect` or `mounted` guard |
| Smooth scroll | `useLenis` / `LenisConfig` from `~/state`, `data-lenis-prevent` to opt out |

See [Development Guidelines](./docs/guidelines.md) for the full rules and rationale.

---

## Documentation

Full developer docs in [`docs/`](./docs/README.md):

- [Development Guidelines](./docs/guidelines.md) — Coding standards, critical rules, architecture patterns
- [Frontend Guide](./docs/frontend-guide.md) — Main development guide
- [Component Patterns](./docs/component-patterns.md) — Compound components, co-located state
- [Events & Notifications](./docs/events-and-notifications.md) — Event system + dispatcher
- [View Transitions](./docs/view-transitions.md) — Shared-element page transitions
- [Deferred Actions](./docs/deferred-actions.md) — Pending action storage pattern
