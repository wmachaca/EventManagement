// src/app/[locale]/i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

let loggedLocales = new Set<Locale>();

// Make this function async to properly handle params
export function isLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale);
  }
  export default getRequestConfig(async ({ requestLocale }) => {
    // Properly await the Promise
    const locale = await requestLocale;
    
    if (!isLocale(locale)) {
        console.error('Invalid or missing locale:', locale);
        notFound();
      }  
      
  // Only log once per locale
  if (!loggedLocales.has(locale)) {
    console.log('[i18n] Trying to import messages for locale:', locale);
    console.log(`Importing messages from: ../locales/${locale}.json`);        
    loggedLocales.add(locale);
  }      
      try {
      const messages = (await import(`../locales/${locale}.json`)).default;
      return {
        locale,
        messages,
        now: new Date(),
        timeZone: 'UTC' // Required field
      };
    } catch (error) {
      console.error(`Failed to load messages for ${locale}:`, error);
      notFound();
    }
  });