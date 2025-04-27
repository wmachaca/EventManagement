// src/app/layout.tsx
'use client';

import { useEffect } from 'react';

import { redirect } from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { defaultLocale } from './[locale]/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.replace(`/${defaultLocale}`);
    }
  }, [pathname, router]);

  return children;
}