/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this if using static export
  // output: 'export' 
};

const withNextIntl = require('next-intl/plugin')('./src/app/[locale]/i18n.ts');

module.exports = withNextIntl(nextConfig);