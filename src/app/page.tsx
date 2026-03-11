'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { IconPokeball } from '@tabler/icons-react';
import LayoutPage from '~/layouts/LayoutPage';
import { NavLink } from '~/shared/components/NavigationLoader';
import classes from './page.module.css';

export default function HomePage() {
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
          >
            Explore the Pokedex
          </Button>
        </Stack>
      </Container>
    </LayoutPage>
  );
}
