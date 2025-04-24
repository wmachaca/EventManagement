import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('Index');
  
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold mb-6">{t('title')}</h1>
      <p className="text-xl">{t('welcome')}</p>
    </main>
  );
}