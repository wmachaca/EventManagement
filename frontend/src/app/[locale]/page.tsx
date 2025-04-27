// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('Home');
  

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">
        {t('title')}
      </h1>
      <p className="text-lg text-gray-600">
        {t('description')}
      </p>
    </main>
  );
}