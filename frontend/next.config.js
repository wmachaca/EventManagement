/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config
  reactStrictMode: true,
};

const withNextIntl = require('next-intl/plugin')(
  './src/config/i18n.ts', // Point directly to your config
);

module.exports = withNextIntl(nextConfig);
