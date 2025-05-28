'use client';
import './globals.css';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { defaultLocale, locales } from '@/config/i18n';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.replace(`/${defaultLocale}`);
      return;
    }

    const pathnameHasLocale = locales.some(
      locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (!pathnameHasLocale) {
      router.replace(`/${defaultLocale}${pathname}`);
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
