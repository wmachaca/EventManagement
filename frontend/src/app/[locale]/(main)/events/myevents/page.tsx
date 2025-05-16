'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Event } from '@/types/event';
import EventList from '@/components/events/EventList';
import { useTranslations } from 'next-intl';
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function MyEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [events, setEvents] = useState<Event[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMyEvents();
      fetchDeletedEvents();
    }
  }, [status]);

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setEvents(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('fetchError') || 'Failed to fetch your events');
      setIsLoading(false);
    }
  };

  const fetchDeletedEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events/trash`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setDeletedEvents(response.data);
    } catch (err) {
      console.error('Error fetching deleted events:', err);
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      console.error(err);
      setError(t('deleteError') || 'Failed to delete event');
    }
  };

  const updateEvent = async (updatedEvent: Event) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${updatedEvent.id}`,
        updatedEvent,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setEvents(events.map(event => (event.id === updatedEvent.id ? response.data : event)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('updateError') || 'Failed to update event');
    }
  };

  const restoreEvent = async (id: number) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setDeletedEvents(deletedEvents.filter(event => event.id !== id));
      setEvents([...events, response.data]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('restoreError') || 'Failed to restore event');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('myEvents')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {showDeleted ? t('deletedEvents') : t('myEvents')}
            </h1>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              {showDeleted ? (
                <>
                  <ArrowPathIcon className="h-5 w-5" />
                  <span>{t('backToActiveEvents')}</span>
                </>
              ) : (
                <>
                  <TrashIcon className="h-5 w-5" />
                  <span>{t('viewDeletedEvents')}</span>
                </>
              )}
            </button>
          </div>
          {showDeleted ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              {deletedEvents.length === 0 ? (
                <p className="text-gray-500">{t('noDeletedEvents')}</p>
              ) : (
                <EventList
                  events={deletedEvents}
                  currentUserId={Number(session?.user?.id) || 0}
                  deleteEvent={deleteEvent}
                  updateEvent={undefined}
                  restoreEvent={restoreEvent}
                  isDeletedView={true}
                />
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <EventList
                events={events}
                currentUserId={Number(session?.user?.id) || 0}
                deleteEvent={deleteEvent}
                updateEvent={updateEvent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
