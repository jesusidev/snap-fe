---
name: view-transition
description: Implement shared-element page transitions with the useViewTransition hook
allowed-tools: Read, Write, Edit, Glob, Grep
---

# View Transition Skill

Implement smooth shared-element animations between pages using React's `<ViewTransition>` and the `useViewTransition` hook.

## Hook API

```typescript
const {
  getViewTransitionName,     // Conditional name (source elements)
  prepareViewTransition,     // Set source with flushSync (forward nav click)
  setDestinationItem,        // Set destination async (detail page mount)
  setDestinationItemSync,    // Set destination with flushSync (back nav click)
  clearViewTransition,       // Reset state
} = useViewTransition();
```

## Source Elements (List Page)

Only the clicked item gets a transition name — prevents duplicates:

```tsx
function CardImage() {
  const { id, name, image } = usePokemonCard();
  const { getViewTransitionName, prepareViewTransition } = useViewTransition();

  return (
    <NavLink href={`/pokemon/${name}`} onClick={() => prepareViewTransition(String(id))}>
      <ViewTransition name={getViewTransitionName(String(id))}>
        <Image src={image} alt={name} width={200} height={200} />
      </ViewTransition>
    </NavLink>
  );
}
```

## Destination Elements (Detail Page)

Uses a **static** transition name — only one element on the page:

```tsx
<ViewTransition name={`item-image-${pokemon.id}`}>
  <Image src={pokemon.image} alt={pokemon.name} width={300} height={300} />
</ViewTransition>
```

Set destination on mount:

```tsx
useEffect(() => {
  if (pokemon) {
    setDestinationItem(String(pokemon.id));
  }
}, [pokemon, setDestinationItem]);
```

## Back Navigation

Use `setDestinationItemSync` (with flushSync) so the name is set before navigation:

```tsx
<Button
  component={NavLink}
  href="/pokemon"
  onClick={() => setDestinationItemSync(String(pokemon.id))}
>
  Back to List
</Button>
```

## Critical Rules

| Rule | Reason |
|------|--------|
| Never call flushSync in useEffect | React will throw |
| Source elements: use `getViewTransitionName()` | Conditional — only active item gets name |
| Destination elements: use static `name={...}` | Always has name — only one element |
| Forward nav: `prepareViewTransition()` in onClick | Needs flushSync before navigation |
| Back nav: `setDestinationItemSync()` in onClick | Needs flushSync before navigation |
| Detail mount: `setDestinationItem()` in useEffect | Async is fine — page already rendering |

## Naming Convention

Transition names follow: `item-image-{id}`

Source: `getViewTransitionName(String(id))` returns `"item-image-{id}"` when matched
Destination: `name={`item-image-${pokemon.id}`}` (static)
