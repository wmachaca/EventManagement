'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Event } from '@/types/event';
import EventList from '@/components/events/EventList';
import { useTranslations } from 'next-intl';

export default function AllEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllEvents();
    }
  }, [status]);

  const fetchAllEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events/all`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setEvents(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('fetchError') || 'Failed to fetch events');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('allEvents')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <EventList
            events={events}
            currentUserId={Number(session?.user?.id) || 0}
            deleteEvent={() => {}}
            updateEvent={() => {}}
            isDeletedView={false}
            restoreEvent={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
