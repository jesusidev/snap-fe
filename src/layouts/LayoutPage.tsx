'use client';

import { AppShell, Container, Group, Text, Title } from '@mantine/core';
import { IconPokeball } from '@tabler/icons-react';
import type React from 'react';
import { NavLink } from '~/shared/components/NavigationLoader';
import styles from './LayoutPage.module.css';

type LayoutPageProps = {
  children: React.ReactNode;
};

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
