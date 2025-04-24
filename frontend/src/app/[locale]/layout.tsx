import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTimeZone } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  const [messages, timeZone] = await Promise.all([
    getMessages(),
    getTimeZone()
  ]);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider 
          locale={locale}
          messages={messages}
          timeZone={timeZone}
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}