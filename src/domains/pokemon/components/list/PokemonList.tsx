'use client';

import { Button, Center, Container, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { usePokemonService } from '~/domains/pokemon/hooks';
import LayoutPage from '~/layouts/LayoutPage';
import { PokemonCardComposed } from '../card';
import classes from './PokemonList.module.css';

const PAGE_SIZE = 20;

export function PokemonList() {
  const [offset, setOffset] = useState(0);
  const pokemonService = usePokemonService();

  const { data, isPending, isError } = pokemonService.useList({
    limit: PAGE_SIZE,
    offset,
  });

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

          {data && (
            <>
              <div className={classes.grid}>
                {data.pokemon.map((p) => (
                  <PokemonCardComposed key={p.id} id={p.id} name={p.name} image={p.image} />
                ))}
              </div>

              {/* Pagination */}
              <Group justify="center" gap="md">
                <Button
                  variant="default"
                  disabled={offset === 0}
                  onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
                >
                  Previous
                </Button>
                <Text size="sm" c="dimmed">
                  Showing {offset + 1}–{offset + (data.pokemon.length)} of {data.count}
                </Text>
                <Button
                  variant="default"
                  disabled={!data.hasMore}
                  onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
                >
                  Next
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Container>
    </LayoutPage>
  );
}
