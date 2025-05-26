'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CalendarIcon, ListIcon, PlusIcon, UserIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const locale = useLocale();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/events/create`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <div>Please log in to view events</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Event Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href={`/${locale}/events/create`}>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center text-center">
              <PlusIcon className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('createTitle')}</h2>
              <p className="text-gray-600">Create a new event</p>
            </div>
          </Link>

          <Link href={`/${locale}/events/myevents`}>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center text-center">
              <UserIcon className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('myEvents')}</h2>
              <p className="text-gray-600">View and manage your events</p>
            </div>
          </Link>

          <Link href={`/${locale}/events/allevents`}>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center text-center">
              <ListIcon className="h-12 w-12 text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('allEvents')}</h2>
              <p className="text-gray-600">Browse all available events</p>
            </div>
          </Link>

          <Link href="/events/calendar">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center text-center">
              <CalendarIcon className="h-12 w-12 text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Calendar</h2>
              <p className="text-gray-600">View events in calendar format</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
