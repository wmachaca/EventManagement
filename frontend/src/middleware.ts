import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Define your locales
  locales: ['en', 'es'],
  defaultLocale: 'en',
});

export const config = {
  // Match only routes starting with /
  matcher: ['/', '/(en|es)/:path*'],
};
