'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { useNavigationLoader } from './NavigationLoader';

type NavLinkProps = ComponentProps<typeof Link> & {
  /** If true, skip showing the loading overlay (useful for same-page anchors) */
  skipLoader?: boolean;
};

/**
 * A wrapper around Next.js Link that shows a loading overlay during navigation.
 * Use this for any internal navigation links to provide visual feedback.
 */
export function NavLink({ onClick, skipLoader, href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const { startNavigation } = useNavigationLoader();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const hrefString = typeof href === 'string' ? href : href.pathname || '';

    if (!skipLoader && hrefString !== pathname && !hrefString.startsWith('#')) {
      startNavigation();
    }

    onClick?.(e);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
