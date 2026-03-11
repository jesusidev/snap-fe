'use client';

import {
  Button,
  Center,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useEvent, useNotificationDispatcher } from '~/events';
import { usePokemonService } from '~/domains/pokemon/hooks';
import LayoutPage from '~/layouts/LayoutPage';
import { PokemonCardComposed } from '../card';
import classes from './PokemonList.module.css';
import { ResumeViewedBanner } from './ResumeViewedBanner';

const PAGE_SIZE = 20;

export function PokemonList() {
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pokemonService = usePokemonService();
  const notificationDispatcher = useNotificationDispatcher();

  const { data, isPending, isError } = pokemonService.useList({
    limit: PAGE_SIZE,
    offset,
  });

  // Dispatch search events for cross-cutting concerns (analytics, logging, etc.)
  const { dispatch: dispatchSearchEvent } = useEvent('pokemon:search');

  // Listen for page changes and show a notification
  useEvent('pokemon:page-changed', (payload) => {
    notificationDispatcher.show({
      message: `Showing page ${payload.page}`,
      type: 'info',
      duration: 2000,
    });
  });

  // Client-side filter on current page results
  const filteredPokemon = useMemo(() => {
    if (!data?.pokemon || !searchQuery.trim()) {
      return data?.pokemon ?? [];
    }
    const query = searchQuery.toLowerCase();
    return data.pokemon.filter((p) => p.name.toLowerCase().includes(query));
  }, [data?.pokemon, searchQuery]);

  // Dispatch search event when query or results change
  useEffect(() => {
    if (searchQuery.trim()) {
      dispatchSearchEvent({
        query: searchQuery,
        resultCount: filteredPokemon.length,
      });
    }
  }, [searchQuery, filteredPokemon.length, dispatchSearchEvent]);

  const { dispatch: dispatchPageChanged } = useEvent('pokemon:page-changed');

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handlePrevious = () => {
    const newOffset = Math.max(0, offset - PAGE_SIZE);
    setOffset(newOffset);
    setSearchQuery('');
    const page = Math.floor(newOffset / PAGE_SIZE) + 1;
    dispatchPageChanged({ page, offset: newOffset });
  };

  const handleNext = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setSearchQuery('');
    const page = Math.floor(newOffset / PAGE_SIZE) + 1;
    dispatchPageChanged({ page, offset: newOffset });
  };

  return (
    <LayoutPage>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <div>
            <Title order={2}>Pokedex</Title>
            <Text c="dimmed" size="sm" mt="xs">
              Browse all Pokemon. Click any card to see full details.
            </Text>
          </div>

          {/* Resume banner — shows if user previously viewed a Pokemon */}
          <ResumeViewedBanner />

          {/* Search bar */}
          <TextInput
            leftSection={<IconSearch size={18} stroke={1.5} />}
            placeholder="Filter Pokemon on this page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            aria-label="Filter Pokemon"
            size="md"
          />

          {/* Live region for screen reader announcements */}
          <output aria-live="polite" aria-atomic="true" className={classes.srOnly}>
            {isPending && 'Loading Pokemon...'}
            {!isPending && filteredPokemon.length > 0
              && `Showing ${filteredPokemon.length} Pokemon`}
            {!isPending && filteredPokemon.length === 0 && searchQuery.trim()
              && `No Pokemon found matching "${searchQuery}"`}
          </output>

          {isError && (
            <Center mih={200}>
              <Text c="red">Failed to load Pokemon. Please try again.</Text>
            </Center>
          )}

          {isPending && (
            <div className={classes.grid}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton placeholders
                <Skeleton key={`skel-${i}`} height={280} width={220} radius="md" />
              ))}
            </div>
          )}

          {data && filteredPokemon.length === 0 && searchQuery.trim() && (
            <Center mih={200}>
              <Text c="dimmed">
                No Pokemon found matching &quot;{searchQuery}&quot; on this page.
              </Text>
            </Center>
          )}

          {data && filteredPokemon.length > 0 && (
            <div className={classes.grid}>
              {filteredPokemon.map((p) => (
                <PokemonCardComposed key={p.id} id={p.id} name={p.name} image={p.image} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && (
            <Group justify="center" gap="md">
              <Button variant="default" disabled={offset === 0} onClick={handlePrevious}>
                Previous
              </Button>
              <Text size="sm" c="dimmed">
                Page {currentPage} of {Math.ceil(data.count / PAGE_SIZE)}
              </Text>
              <Button variant="default" disabled={!data.hasMore} onClick={handleNext}>
                Next
              </Button>
            </Group>
          )}
        </Stack>
      </Container>
    </LayoutPage>
  );
}
