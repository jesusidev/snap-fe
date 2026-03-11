'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowLeft, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import Image from 'next/image';
import { useEffect, useState, ViewTransition } from 'react';
import { useEvent, useNotificationDispatcher } from '~/events';
import { usePokemonService } from '~/domains/pokemon/hooks';
import { usePendingAction, useStorePendingAction } from '~/shared/hooks';
import { storeLastViewed } from '~/shared/utils';
import LayoutPage from '~/layouts/LayoutPage';
import { NavLink } from '~/shared/components/NavigationLoader';
import { useTrainer } from '~/state/trainer';
import { useViewTransition } from '~/state';
import classes from './PokemonDetail.module.css';

const typeColors: Record<string, string> = {
  fire: 'red',
  water: 'blue',
  grass: 'green',
  electric: 'yellow',
  psychic: 'pink',
  ice: 'cyan',
  dragon: 'violet',
  dark: 'dark',
  fairy: 'pink',
  fighting: 'orange',
  flying: 'indigo',
  poison: 'grape',
  ground: 'yellow',
  rock: 'gray',
  bug: 'lime',
  ghost: 'violet',
  steel: 'gray',
  normal: 'gray',
};

const statColors: Record<string, string> = {
  hp: 'red',
  attack: 'orange',
  defense: 'yellow',
  'special-attack': 'blue',
  'special-defense': 'green',
  speed: 'grape',
};

interface PokemonDetailClientProps {
  name: string;
}

export function PokemonDetailClient({ name }: PokemonDetailClientProps) {
  const pokemonService = usePokemonService();
  const { data: pokemon, isPending, isError } = pokemonService.useByName(name);
  const { setDestinationItem, setDestinationItemSync } = useViewTransition();
  const { dispatch: dispatchViewed } = useEvent('pokemon:viewed');
  const { trainerName } = useTrainer();
  const { store } = useStorePendingAction();
  const notificationDispatcher = useNotificationDispatcher();
  const [isFavorite, setIsFavorite] = useState(false);

  // Execute pending actions (e.g., deferred favorite from card click)
  usePendingAction(pokemon?.id ?? 0, pokemon?.name, {
    onFavoriteExecuted: () => setIsFavorite(true),
  });

  useEffect(() => {
    if (pokemon) {
      setDestinationItem(String(pokemon.id));
      dispatchViewed({ pokemonId: pokemon.id, pokemonName: pokemon.name });
      storeLastViewed(pokemon.id, pokemon.name);
    }
  }, [pokemon, setDestinationItem, dispatchViewed]);

  const handleFavorite = () => {
    if (!pokemon) return;

    if (isFavorite) {
      setIsFavorite(false);
      notificationDispatcher.show({
        message: `${pokemon.name} removed from favorites`,
        type: 'info',
      });
      return;
    }

    const deferred = store('favorite', pokemon.id, pokemon.name);
    if (deferred) return;

    setIsFavorite(true);
    notificationDispatcher.show({
      message: `${pokemon.name} added to favorites!`,
      type: 'success',
    });
  };

  if (isPending) {
    return (
      <LayoutPage>
        <Container size="md" py="xl">
          <Skeleton height={400} radius="md" />
        </Container>
      </LayoutPage>
    );
  }

  if (isError || !pokemon) {
    return (
      <LayoutPage>
        <Container size="md" py="xl">
          <Stack align="center" gap="md">
            <Title order={2}>Pokemon not found</Title>
            <Button component={NavLink} href="/pokemon" leftSection={<IconArrowLeft size={16} />}>
              Back to Pokedex
            </Button>
          </Stack>
        </Container>
      </LayoutPage>
    );
  }

  return (
    <LayoutPage>
      <Container size="md" py="xl">
        <Button
          component={NavLink}
          href="/pokemon"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          mb="lg"
          onClick={() => setDestinationItemSync(String(pokemon.id))}
        >
          Back to Pokedex
        </Button>

        <Grid gutter="xl">
          {/* Image */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper className={classes.imageCard} p="xl" radius="md" withBorder>
              <ViewTransition name={`item-image-${pokemon.id}`}>
                <Image
                  src={pokemon.image}
                  alt={pokemon.name}
                  width={300}
                  height={300}
                  className={classes.image}
                  priority
                />
              </ViewTransition>
            </Paper>
          </Grid.Col>

          {/* Info */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <div>
                <Text size="sm" c="dimmed">#{String(pokemon.id).padStart(3, '0')}</Text>
                <Group gap="sm" align="center">
                  <Title order={1} tt="capitalize">{pokemon.name}</Title>
                  <Tooltip label={trainerName ? (isFavorite ? 'Unfavorite' : 'Favorite') : 'Set trainer name to favorite'}>
                    <ActionIcon
                      variant="subtle"
                      color={isFavorite ? 'red' : 'gray'}
                      size="lg"
                      onClick={handleFavorite}
                      aria-label={isFavorite ? `Unfavorite ${pokemon.name}` : `Favorite ${pokemon.name}`}
                    >
                      {isFavorite ? <IconHeartFilled size={22} /> : <IconHeart size={22} />}
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </div>

              {/* Types */}
              <Group gap="xs">
                {pokemon.types.map((type) => (
                  <Badge
                    key={type}
                    size="lg"
                    variant="light"
                    color={typeColors[type] ?? 'gray'}
                    tt="capitalize"
                  >
                    {type}
                  </Badge>
                ))}
              </Group>

              {/* Physical */}
              <Group gap="xl">
                <div>
                  <Text size="xs" c="dimmed">Height</Text>
                  <Text fw={600}>{(pokemon.height / 10).toFixed(1)} m</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Weight</Text>
                  <Text fw={600}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Base XP</Text>
                  <Text fw={600}>{pokemon.baseExperience}</Text>
                </div>
              </Group>

              {/* Stats */}
              <Paper p="md" radius="md" withBorder>
                <Text fw={600} mb="sm">Base Stats</Text>
                <Stack gap="xs">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.name}>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" tt="capitalize" c="dimmed">
                          {stat.name.replace('-', ' ')}
                        </Text>
                        <Text size="xs" fw={600}>{stat.value}</Text>
                      </Group>
                      <Progress
                        value={(stat.value / 255) * 100}
                        color={statColors[stat.name] ?? 'blue'}
                        size="sm"
                        radius="xl"
                      />
                    </div>
                  ))}
                </Stack>
              </Paper>

              {/* Abilities */}
              <Paper p="md" radius="md" withBorder>
                <Text fw={600} mb="sm">Abilities</Text>
                <Group gap="xs">
                  {pokemon.abilities.map((ability) => (
                    <Badge
                      key={ability.name}
                      variant={ability.isHidden ? 'outline' : 'light'}
                      tt="capitalize"
                    >
                      {ability.name.replace('-', ' ')}
                      {ability.isHidden && ' (Hidden)'}
                    </Badge>
                  ))}
                </Group>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </LayoutPage>
  );
}
