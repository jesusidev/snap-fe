'use client';

import { use } from 'react';
import { PokemonDetailClient } from '~/domains/pokemon/components';

interface PokemonDetailPageProps {
  params: Promise<{ name: string }>;
}

export default function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { name } = use(params);
  return <PokemonDetailClient name={name} />;
}
