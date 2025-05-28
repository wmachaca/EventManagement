'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/config/i18n';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';

  const getNewPath = (locale: string) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  return (
    <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full shadow-sm">
      <Globe className="h-4 w-4 text-muted-foreground" />
      {locales.map(locale => (
        <Button
          key={locale}
          asChild
          variant={currentLocale === locale ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'rounded-full px-3 py-1 text-sm transition-all duration-200',
            currentLocale === locale
              ? 'bg-blue-600 text-white shadow shadow-blue-500/50'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <Link href={getNewPath(locale)}>{locale.toUpperCase()}</Link>
        </Button>
      ))}
    </div>
  );
}
