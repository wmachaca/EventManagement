// src/app/layout.tsx
import { redirect } from 'next/navigation';
import { locales, defaultLocale } from './[locale]/i18n';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to default locale
  redirect(`/${defaultLocale}`);
}