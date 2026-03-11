# Snap Documentation

Developer documentation for the Snap boilerplate — a minimal Next.js 16 app with tRPC, Mantine, and domain-driven architecture.

## Guides

| Document | Description |
|----------|-------------|
| [Development Guidelines](./guidelines.md) | Coding standards, critical rules, architecture patterns, quick reference |
| [Frontend Guide](./frontend-guide.md) | Main development guide — folder structure, components, styling, state, pages, env vars, tooling |
| [Component Patterns](./component-patterns.md) | Compound components, co-located state, barrel exports, subdirectory conventions |
| [Events & Notifications](./events-and-notifications.md) | Type-safe CustomEvent system and notification dispatcher |
| [View Transitions](./view-transitions.md) | Shared-element page transitions with the `useViewTransition` hook |
| [Deferred Actions](./deferred-actions.md) | Pending action storage pattern for gated and resume-style flows |

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React Compiler)
- **Language:** TypeScript (strict mode)
- **API:** tRPC v11 + TanStack Query v5
- **UI:** Mantine 8
- **Smooth Scroll:** Lenis
- **Linting:** Biome
- **Validation:** Zod v4
- **Toolchain:** Volta (pinned Node 24 LTS + npm 11)

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run check        # TypeScript + lint + format
npm run check:fix    # Auto-fix issues
```
