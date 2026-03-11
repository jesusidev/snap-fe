---
name: service-hook
description: Create service hooks that wrap tRPC queries with notifications and prefetching
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Service Hook Skill

Service hooks wrap tRPC calls with domain-specific configuration, notifications, and prefetching.

## File Location

```
src/domains/{domain}/hooks/use{Domain}Service.tsx
```

## Template

```tsx
import { useNotificationDispatcher } from '~/events';
import { api } from '~/utils/trpc';

export function use{Domain}Service() {
  const notificationDispatcher = useNotificationDispatcher();

  // --- Queries ---

  function useList(params?: { limit?: number; offset?: number }) {
    return api.{domain}.list.useQuery(
      { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
      { staleTime: 1000 * 60 * 10 }  // 10 min
    );
  }

  function useById(id: string) {
    return api.{domain}.byId.useQuery(
      { id },
      {
        enabled: !!id,
        staleTime: 1000 * 60 * 30,  // 30 min
        retry: (failureCount, error) => {
          if (error.message.includes('NOT_FOUND')) return false;
          return failureCount < 2;
        },
      }
    );
  }

  // --- Prefetch ---

  function usePrefetchList() {
    const utils = api.useUtils();
    return (params?: { limit?: number; offset?: number }) => {
      void utils.{domain}.list.prefetch(
        { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
        { staleTime: 1000 * 60 * 10 }
      );
    };
  }

  function usePrefetchById() {
    const utils = api.useUtils();
    return (id: string) => {
      void utils.{domain}.byId.prefetch(
        { id },
        { staleTime: 1000 * 60 * 30 }
      );
    };
  }

  // --- Search (imperative) ---

  function useSearch() {
    const utils = api.useUtils();
    const search = async (query: string) => {
      try {
        return await utils.{domain}.byId.fetch({ id: query });
      } catch {
        notificationDispatcher.show({
          message: `"${query}" not found`,
          type: 'error',
        });
        return null;
      }
    };
    return { search };
  }

  return {
    useList,
    useById,
    useSearch,
    usePrefetchList,
    usePrefetchById,
  };
}
```

## Key Rules

- Always include `staleTime` on queries
- Always create `usePrefetch*` methods for each query
- Use `useNotificationDispatcher` for error messages, not console.log
- Handle `NOT_FOUND` errors gracefully (don't retry)
- Export from barrel: `src/domains/{domain}/hooks/index.ts`

## Prefetch Usage

```tsx
// In a card or link component
const service = use{Domain}Service();
const prefetch = service.usePrefetchById();

<Card onMouseEnter={() => prefetch(item.id)}>...</Card>

// In a CTA button
const prefetchList = service.usePrefetchList();

<Button onMouseEnter={() => prefetchList()}>View All</Button>
```
