---
name: notification
description: Show notifications using the event-driven dispatcher
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Notification Skill

Show user-facing messages using the notification dispatcher pattern.

## Critical Rule

**ALWAYS** use `useNotificationDispatcher` from `~/events`. **NEVER** use `@mantine/notifications` directly.

## Usage

```tsx
import { useNotificationDispatcher } from '~/events';

function MyComponent() {
  const notificationDispatcher = useNotificationDispatcher();

  const handleAction = () => {
    notificationDispatcher.show({
      message: 'Action completed successfully',
      type: 'success',
    });
  };

  const handleError = () => {
    notificationDispatcher.show({
      message: 'Something went wrong',
      type: 'error',
    });
  };
}
```

## Notification Types

| Type | Color | Use For |
|------|-------|---------|
| `success` | Green | Completed actions (saved, added, created) |
| `error` | Red | Failed operations, API errors |
| `info` | Blue | Informational messages (page changed, status update) |
| `warning` | Yellow | Caution messages, deprecation notices |

## Options

```tsx
notificationDispatcher.show({
  message: 'Text to display',
  type: 'success',           // success | error | info | warning
  duration: 3000,            // Optional: auto-dismiss in ms
});
```

## How It Works

1. `useNotificationDispatcher().show()` dispatches a `'notification:show'` CustomEvent on window
2. `NotificationProvider` (in `src/state/notifications/`) listens for this event
3. Provider calls Mantine's `notifications.show()` with the correct color mapping

Components are decoupled from the UI library — they only know about event types.

## Adding New Event Domains

If you need domain-specific notification helpers:

```typescript
// In src/events/pokemon-events.ts
export interface PokemonEvents {
  'pokemon:favorited': AppEvent<{ pokemonName: string }>;
}
```

Then dispatch with `useEvent('pokemon:favorited')`.
