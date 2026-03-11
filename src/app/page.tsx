'use client';

import { Button, Container, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconPokeball } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { usePokemonService } from '~/domains/pokemon/hooks';
import LayoutPage from '~/layouts/LayoutPage';
import { NavLink } from '~/shared/components/NavigationLoader';
import { clearLastViewed, getLastViewed } from '~/shared/utils';
import classes from './page.module.css';

function ResumeModal() {
  const [pokemonName, setPokemonName] = useState<string | null>(null);

  useEffect(() => {
    const lastViewed = getLastViewed();
    if (lastViewed) {
      setPokemonName(lastViewed.pokemonName);
    }
  }, []);

  const handleClose = () => {
    clearLastViewed();
    setPokemonName(null);
  };

  return (
    <Modal
      opened={!!pokemonName}
      onClose={handleClose}
      title="Welcome back!"
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          Last time you were checking out{' '}
          <Text span fw={600} tt="capitalize">{pokemonName}</Text>.
          Want to pick up where you left off?
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={handleClose}>
            No thanks
          </Button>
          <Button
            component={NavLink}
            href={`/pokemon/${pokemonName}`}
            rightSection={<IconArrowRight size={16} />}
            onClick={handleClose}
          >
            Go back
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function HomePage() {
  const pokemonService = usePokemonService();
  const prefetchList = pokemonService.usePrefetchList();

  return (
    <LayoutPage>
      <Container size="sm" py="xl">
        <Stack align="center" gap="xl" className={classes.hero}>
          <IconPokeball size={80} stroke={1.2} className={classes.icon} />
          <div style={{ textAlign: 'center' }}>
            <Title order={1} size="3rem">Snap</Title>
            <Text size="lg" c="dimmed" mt="sm">
              A minimal Next.js boilerplate with tRPC, Mantine, ViewTransitions,
              and domain-driven architecture.
            </Text>
          </div>
          <Button
            component={NavLink}
            href="/pokemon"
            size="lg"
            radius="md"
            onMouseEnter={() => prefetchList()}
          >
            Explore the Pokedex
          </Button>
        </Stack>
      </Container>
      <ResumeModal />
    </LayoutPage>
  );
}
