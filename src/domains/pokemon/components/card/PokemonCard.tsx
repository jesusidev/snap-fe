'use client';

import { Badge, Card as MantineCard, Group, Text } from '@mantine/core';
import Image from 'next/image';
import { ViewTransition } from 'react';
import { NavLink } from '~/shared/components/NavigationLoader';
import { useViewTransition } from '~/state';
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
          <Image
            src={image}
            alt={name}
            width={200}
            height={200}
            className={classes.image}
          />
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

function CardActions() {
  const { name } = usePokemonCard();

  return (
    <NavLink href={`/pokemon/${name}`} className={classes.detailLink}>
      <Text size="sm" c="brand" fw={500} ta="center">
        View Details
      </Text>
    </NavLink>
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
  return (
    <PokemonCardProvider id={id} name={name} image={image} types={types}>
      <MantineCard
        withBorder
        className={mergeclasses(classes.card)}
        padding="md"
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
  Actions: CardActions,
});
