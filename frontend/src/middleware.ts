// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/[locale]/i18n';
export default createMiddleware({
  // Define your locales
  locales: ['en', 'es'],
  defaultLocale: 'en'
});

export const config = {
  // Match only routes starting with /
  matcher: ['/', '/(en|es)/:path*']
};