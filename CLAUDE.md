# Snap — Project Context

> A React boilerplate with domain-driven architecture, tRPC, compound components, and premium UI patterns.

## Project Types

This project supports two initialization workflows:

### 1. Domain App (`/new-project` → Domain App)
Transform the Pokemon-themed boilerplate into any domain-specific application. Preserves all architectural patterns (tRPC, compound components, service hooks, view transitions, deferred actions, event system).

### 2. Cinematic Landing Page (`/new-project` → Cinematic Landing Page, or `/cinematic-landing`)
Build a high-fidelity, cinematic landing page from scratch with GSAP animations, Tailwind CSS, and a curated design system. Four aesthetic presets available: Organic Tech, Midnight Luxe, Brutalist Signal, Vapor Clinic.

## Quick Start

```bash
# Start a new project (choose type interactively)
/new-project

# Build a cinematic landing page directly
/cinematic-landing

# Develop a feature on an existing project
/workflow-project implement user profiles

# Plan tasks for a feature
/plan-tasks-project add search filters
```

## Architecture

See `.claude/README.md` for full documentation on commands, skills, and agents.

## Critical Patterns

| Pattern | Rule |
|---------|------|
| **Notifications** | Use `useNotificationDispatcher` from `~/events`, never Mantine directly |
| **Navigation** | Use `NavLink` from `~/shared/components/NavigationLoader` |
| **Data fetching** | Use service hooks from `~/domains/<domain>/hooks`, never direct tRPC |
| **Prefetching** | Add `usePrefetch*` methods, use on `onMouseEnter` |
| **CSS** | Mobile-first `min-width`, Mantine variables only, `light-dark()` |
| **Inline styles** | Theme callback: `styles={(theme) => (...)}` |
| **Theme colors** | Extend defaults: `colors: { brand: ... }`, never replace |
| **ViewTransitions** | Use `useViewTransition` from `~/state` |
| **Env vars** | Use `env.VARNAME` from `~/env.mjs`, never `process.env` |
| **Hydration** | Defer client-only values to `useEffect` or `mounted` guard |
| **Smooth scroll** | `useLenis` / `LenisConfig` from `~/state`, `data-lenis-prevent` to opt out |

## Cinematic Landing Page Design Principles

When building cinematic landing pages:

- **Build a digital instrument, not a website.** Every scroll intentional, every animation weighted.
- **Eradicate generic AI patterns.** No default shadows, no stock layouts, no cookie-cutter components.
- **GSAP animations only.** Use `gsap.context()` in `useEffect`, return `ctx.revert()`. Default: `power3.out` for entrances, `power2.inOut` for morphs.
- **Visual texture is mandatory.** Noise overlay via SVG `<feTurbulence>` at 0.05 opacity. `rounded-[2rem]` to `rounded-[3rem]` radius system.
- **Micro-interactions matter.** Magnetic buttons (`scale(1.03)`), sliding background spans, `translateY(-1px)` lifts.
- **Real images only.** Unsplash URLs matched to preset mood. Never use placeholders.
- **No placeholders, no TODO stubs.** Every card, label, and animation must be fully implemented.
