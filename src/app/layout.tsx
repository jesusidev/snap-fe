import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { Metadata } from 'next';
import '~/styles/global.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Snap - Pokemon Explorer',
    template: '%s | Snap',
  },
  description: 'A minimal Next.js boilerplate with tRPC, Mantine, and all the frontend patterns.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mantine-color-scheme="dark" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
