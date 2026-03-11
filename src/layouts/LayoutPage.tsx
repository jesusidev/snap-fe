'use client';

import {
  ActionIcon,
  AppShell,
  Button,
  Container,
  Group,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconPokeball, IconSun, IconUser } from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { NavLink } from '~/shared/components/NavigationLoader';
import { useTrainer } from '~/state/trainer';
import styles from './LayoutPage.module.css';

type LayoutPageProps = {
  children: React.ReactNode;
};

function TrainerBadge() {
  const { trainerName, openSetup } = useTrainer();

  if (trainerName) {
    return (
      <Tooltip label="Trainer profile">
        <Button variant="subtle" size="compact-sm" leftSection={<IconUser size={14} />}>
          {trainerName}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button variant="subtle" size="compact-sm" onClick={openSetup}>
      Set Trainer Name
    </Button>
  );
}

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
      onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
    >
      {mounted ? (
        computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />
      ) : (
        <IconSun size={18} />
      )}
    </ActionIcon>
  );
}

export default function LayoutPage({ children }: LayoutPageProps) {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header className={styles.header}>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between">
            <NavLink href="/" style={{ textDecoration: 'none' }}>
              <Group gap="xs">
                <IconPokeball size={28} />
                <Title order={3} fw={700}>
                  Snap
                </Title>
              </Group>
            </NavLink>
            <Group gap="md">
              <NavLink href="/" className={styles.navLink}>
                <Text size="sm" fw={500}>Home</Text>
              </NavLink>
              <NavLink href="/pokemon" className={styles.navLink}>
                <Text size="sm" fw={500}>Pokedex</Text>
              </NavLink>
              <TrainerBadge />
              <ColorSchemeToggle />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <main className={styles.main}>{children}</main>
      </AppShell.Main>
    </AppShell>
  );
}
