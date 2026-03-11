---
name: domain-component
description: Create domain-specific React components following project patterns
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Domain Component Skill

Create React components in the Snap project following domain-driven architecture.

## File Location

```
src/domains/{domain}/components/{group}/
├── state/                    # Only if component needs shared context
│   ├── {group}-context.tsx   # createContext
│   ├── {group}-provider.tsx  # Provider with memoized value
│   └── use-{group}.tsx       # Consumer hook with guard
├── {ComponentName}.tsx       # Component (or compound root + sub-components)
├── {ComponentName}.module.css
├── {ComponentNameComposed}.tsx # Optional pre-composed wrapper
└── index.ts                  # Barrel export
```

## Component Template

```tsx
'use client';

import { Text } from '@mantine/core';
import classes from './MyComponent.module.css';

interface MyComponentProps {
  // props
}

export function MyComponent({ ...props }: MyComponentProps) {
  return (
    <div className={classes.root}>
      <Text>Content</Text>
    </div>
  );
}
```

## Compound Component Pattern

For components with multiple related sub-parts sharing state:

```tsx
// 1. Context
export const MyContext = createContext<MyContextValue | undefined>(undefined);

// 2. Provider with memoized value
export function MyProvider({ children, ...value }: Props) {
  const memoized = useMemo(() => value, [value.id, value.name]);
  return <MyContext value={memoized}>{children}</MyContext>;
}

// 3. Consumer hook
export function useMyContext() {
  const context = use(MyContext);
  if (!context) throw new Error('useMyContext must be used within MyProvider');
  return context;
}

// 4. Root + sub-components with Object.assign
export const MyComponent = Object.assign(Root, {
  Title: SubTitle,
  Content: SubContent,
  Actions: SubActions,
});
```

## CSS Module Template

```css
.root {
  /* Mobile base styles */
  padding: var(--mantine-spacing-md);
  background-color: light-dark(
    var(--mantine-color-white),
    var(--mantine-color-dark-6)
  );
}

@media (min-width: 48em) {
  .root {
    padding: var(--mantine-spacing-xl);
  }
}
```

## Critical Rules

- Use `NavLink` for internal links, never `Link`
- Use `useNotificationDispatcher` for messages, never Mantine directly
- Use service hooks for data, never direct tRPC calls
- Use `light-dark()` for theme-aware colors
- Use Mantine CSS variables only, no custom `:root`
- Use theme callback for inline styles: `styles={(theme) => (...)}`
- Add `onMouseEnter` prefetch on navigable elements
- Barrel export from `index.ts`
