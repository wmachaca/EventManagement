import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  // Add this to exclude static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
});