// src/app/layout.tsx
'use client';
import './globals.css';

import { useEffect } from 'react';

import { redirect } from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

import { SessionProvider } from 'next-auth/react'; // useSession error

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.replace(`/${defaultLocale}`);
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
