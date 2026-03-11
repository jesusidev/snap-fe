'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';
import { NavigationLoaderProvider } from '~/shared/components/NavigationLoader';
import { NetworkStatusMonitor } from '~/shared/components/NetworkStatusMonitor';
import {
  LenisProvider,
  NotificationProvider,
  Providers,
  TrainerProvider,
  TrainerSetupModal,
  ViewTransitionProvider,
} from '~/state';
import { theme } from '~/styles/theme';
import { TRPCReactProvider } from '~/utils/trpc';

const appProviders = [
  [LenisProvider, { smoothWheel: true }],
  [ViewTransitionProvider, {}],
  [NotificationProvider, {}],
  [TrainerProvider, {}],
] as const;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <TRPCReactProvider>
        <NavigationLoaderProvider>
          <Providers providers={appProviders}>
            {children}
            <TrainerSetupModal />
            <NetworkStatusMonitor />
          </Providers>
        </NavigationLoaderProvider>
      </TRPCReactProvider>
    </MantineProvider>
  );
}
