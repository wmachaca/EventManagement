// src/app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
//import { getServerSession } from 'next-auth';
//import { authOptions } from '@/lib/auth';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    notFound();
  }

  //const session = await getServerSession(authOptions);
  //console.log('Server session:', session);// token saved in 

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <MainNav />
            <UserNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}