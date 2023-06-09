// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  i18n: {
    locales: ['en', 'fr', 'nl'],
    defaultLocale: 'en',
  },  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    appDir: true,
    // typedRoutes: true,
  },
}

module.exports = nextConfig