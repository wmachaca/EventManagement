// components/main-nav.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from './language-switcher';
import { useTranslations } from 'next-intl';

export function MainNav({ className }: { className?: string }) {
  const t = useTranslations('Home');

  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <Link href="/" className="flex items-center">
        <Image src="/ratherLogo.jpg" alt={t('title')} width={40} height={40} className="mr-2" />
        <span className="font-bold text-lg hidden sm:inline-block">{t('title')}</span>
      </Link>
      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
