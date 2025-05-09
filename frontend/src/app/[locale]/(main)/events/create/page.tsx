'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import AddEvent from '@/components/events/AddEvent';
import { EventFormData } from '@/types/event'; // Assuming types are in a separate file

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const addEvent = async (eventData: EventFormData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events`,
        {
          ...eventData,
          location: eventData.isVirtual ? null : eventData.location,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      console.log('Event created with ID:', response.data.id);

      // ✅ Redirect after success
      router.push('/en/events/myevents');
    } catch (err) {
      console.error(err);
      setError(t('createError') || 'Failed to create event.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('createTitle')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <AddEvent addEvent={addEvent} />
      </div>
    </div>
  );
}
