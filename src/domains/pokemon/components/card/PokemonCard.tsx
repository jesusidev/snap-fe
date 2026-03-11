'use client';

import { ActionIcon, Badge, Group, Card as MantineCard, Text, Tooltip } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import Image from 'next/image';
import { useState, ViewTransition } from 'react';
import { usePokemonService } from '~/domains/pokemon/hooks';
import { useNotificationDispatcher } from '~/events';
import { NavLink } from '~/shared/components/NavigationLoader';
import { useStorePendingAction } from '~/shared/hooks';
import { useViewTransition } from '~/state';
import { useTrainer } from '~/state/trainer';
import { mergeclasses } from '~/utils';
import classes from './PokemonCard.module.css';
import { PokemonCardProvider } from './state/card-provider';
import { usePokemonCard } from './state/use-pokemon-card';

// --- Type color map ---
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

// --- Sub-components ---

function CardImage() {
  const { id, name, image } = usePokemonCard();
  const { getViewTransitionName, prepareViewTransition } = useViewTransition();

  return (
    <NavLink href={`/pokemon/${name}`} onClick={() => prepareViewTransition(String(id))}>
      <MantineCard.Section className={classes.imageSection}>
        <ViewTransition name={getViewTransitionName(String(id))}>
          <Image src={image} alt={name} width={200} height={200} className={classes.image} />
        </ViewTransition>
      </MantineCard.Section>
    </NavLink>
  );
}

function CardName() {
  const { name } = usePokemonCard();
  return (
    <Text fw={600} size="lg" tt="capitalize" ta="center">
      {name}
    </Text>
  );
}

function CardId() {
  const { id } = usePokemonCard();
  return (
    <Text size="xs" c="dimmed" ta="center">
      #{String(id).padStart(3, '0')}
    </Text>
  );
}

function CardTypes() {
  const { types } = usePokemonCard();

  if (types.length === 0) {
    return null;
  }

  return (
    <Group gap={6} justify="center">
      {types.map((type) => (
        <Badge
          key={type}
          size="sm"
          variant="light"
          color={typeColors[type] ?? 'gray'}
          tt="capitalize"
        >
          {type}
        </Badge>
      ))}
    </Group>
  );
}

function CardFavorite() {
  const { id, name } = usePokemonCard();
  const { trainerName } = useTrainer();
  const { store } = useStorePendingAction();
  const notificationDispatcher = useNotificationDispatcher();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = () => {
    if (isFavorite) {
      setIsFavorite(false);
      notificationDispatcher.show({
        message: `${name} removed from favorites`,
        type: 'info',
      });
      return;
    }

    // If no trainer name, defer the action
    const deferred = store('favorite', id, name);
    if (deferred) return;

    // Precondition met -- execute immediately
    setIsFavorite(true);
    notificationDispatcher.show({
      message: `${name} added to favorites!`,
      type: 'success',
    });
  };

  return (
    <Tooltip
      label={
        trainerName ? (isFavorite ? 'Unfavorite' : 'Favorite') : 'Set trainer name to favorite'
      }
    >
      <ActionIcon
        variant="subtle"
        color={isFavorite ? 'red' : 'gray'}
        onClick={handleFavorite}
        aria-label={isFavorite ? `Unfavorite ${name}` : `Favorite ${name}`}
      >
        {isFavorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}

function CardActions() {
  const { name } = usePokemonCard();

  return (
    <Group justify="space-between" align="center">
      <NavLink href={`/pokemon/${name}`} className={classes.detailLink}>
        <Text size="sm" c="brand" fw={500}>
          View Details
        </Text>
      </NavLink>
      <CardFavorite />
    </Group>
  );
}

// --- Root ---

interface PokemonCardRootProps {
  id: number;
  name: string;
  image: string;
  types?: string[];
  children: React.ReactNode;
}

function PokemonCardRoot({ id, name, image, types, children }: PokemonCardRootProps) {
  const pokemonService = usePokemonService();
  const prefetch = pokemonService.usePrefetchByName();

  return (
    <PokemonCardProvider id={id} name={name} image={image} types={types}>
      <MantineCard
        withBorder
        className={mergeclasses(classes.card)}
        padding="md"
        onMouseEnter={() => prefetch(name)}
      >
        {children}
      </MantineCard>
    </PokemonCardProvider>
  );
}

// --- Compound export ---

export const PokemonCard = Object.assign(PokemonCardRoot, {
  Image: CardImage,
  Name: CardName,
  Id: CardId,
  Types: CardTypes,
  Favorite: CardFavorite,
  Actions: CardActions,
});
