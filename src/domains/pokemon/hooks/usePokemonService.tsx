import { useNotificationDispatcher } from '~/events';
import { api } from '~/utils/trpc';

/**
 * Pokemon service hook - wraps tRPC queries with notifications.
 * Follows the service hook pattern from the main project.
 */
export function usePokemonService() {
  const notificationDispatcher = useNotificationDispatcher();

  function useList(params?: { limit?: number; offset?: number; enabled?: boolean }) {
    return api.pokemon.list.useQuery(
      { limit: params?.limit ?? 20, offset: params?.offset ?? 0 },
      {
        enabled: params?.enabled ?? true,
        staleTime: 1000 * 60 * 10, // 10 min - Pokemon data doesn't change
      }
    );
  }

  function useByName(name: string, options?: { enabled?: boolean }) {
    return api.pokemon.byName.useQuery(
      { name },
      {
        enabled: (options?.enabled ?? true) && !!name,
        staleTime: 1000 * 60 * 30, // 30 min - individual Pokemon data is stable
        retry: (failureCount, error) => {
          if (error.message.includes('NOT_FOUND')) {
            return false;
          }
          return failureCount < 2;
        },
      }
    );
  }

  function useSearch() {
    const utils = api.useUtils();

    const search = async (name: string) => {
      try {
        const result = await utils.pokemon.byName.fetch({ name });
        return result;
      } catch {
        notificationDispatcher.show({
          message: `Pokemon "${name}" not found`,
          type: 'error',
        });
        return null;
      }
    };

    return { search };
  }

  return {
    useList,
    useByName,
    useSearch,
  };
}
