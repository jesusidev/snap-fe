'use client';

import { Button, CloseButton, Group, Paper, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { NavLink } from '~/shared/components/NavigationLoader';
import { clearLastViewed, getLastViewed, type PendingAction } from '~/shared/utils';
import classes from './ResumeViewedBanner.module.css';

/**
 * "Continue where you left off" banner.
 *
 * Reads from the `last_viewed_pokemon` sessionStorage slot
 * (written by PokemonDetailClient on mount). Shows a prompt
 * with the Pokemon name and two options:
 *
 * - **Yes / Go back** → navigates to the detail page, clears the store
 * - **Dismiss (X)** → clears the store, hides the banner
 *
 * This showcases the full pending-action storage lifecycle:
 * store → retrieve → act-or-dismiss → clear.
 */
export function ResumeViewedBanner() {
  const [lastViewed, setLastViewed] = useState<PendingAction | null>(null);

  useEffect(() => {
    setLastViewed(getLastViewed());
  }, []);

  const handleDismiss = () => {
    clearLastViewed();
    setLastViewed(null);
  };

  if (!lastViewed) return null;

  return (
    <Paper withBorder p="sm" radius="md" className={classes.banner}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Text size="sm">
            Continue where you left off?{' '}
            <Text span fw={600} tt="capitalize">
              {lastViewed.pokemonName}
            </Text>
          </Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Button
            component={NavLink}
            href={`/pokemon/${lastViewed.pokemonName}`}
            size="compact-sm"
            variant="light"
            rightSection={<IconArrowRight size={14} />}
            onClick={handleDismiss}
          >
            Go back
          </Button>
          <CloseButton size="sm" aria-label="Dismiss" onClick={handleDismiss} />
        </Group>
      </Group>
    </Paper>
  );
}
