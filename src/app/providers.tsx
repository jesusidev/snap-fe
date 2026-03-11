'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';
import { NavigationLoaderProvider } from '~/shared/components/NavigationLoader';
import { NotificationProvider, Providers, ViewTransitionProvider } from '~/state';
import { theme } from '~/styles/theme';
import { TRPCReactProvider } from '~/utils/trpc';

const appProviders = [
  [ViewTransitionProvider, {}],
  [NotificationProvider, {}],
] as const;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <TRPCReactProvider>
        <NavigationLoaderProvider>
          <Providers providers={appProviders}>
            {children}
          </Providers>
        </NavigationLoaderProvider>
      </TRPCReactProvider>
    </MantineProvider>
  );
}
