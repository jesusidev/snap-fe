// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  // React Compiler for automatic memoization (stable in Next.js 16)
  reactCompiler: true,

  // Turbopack file system caching + View Transitions API
  experimental: {
    turbopackFileSystemCacheForDev: true,
    viewTransition: true,
  },

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Allow PokeAPI sprite images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/**',
      },
    ],
  },
};

export default config;
