// src/app/[locale]/(main)/events/page.tsx
'use client'; // <-- Add this directive

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Event, EventFormData } from '@/types/event';
import EventList from '@/components/events/EventList';
import AddEvent from '@/components/events/AddEvent';
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents();
      fetchDeletedEvents();
    }
  }, [status]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setEvents(response.data);
      setIsLoading(false);
    } catch (err) {
        console.error(err);
      setError('Failed to fetch events');
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

  const addEvent = async (eventData: EventFormData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      setEvents([...events, response.data]);
      setError(null);
    } catch (err) {
        console.error(err);
      setError('Failed to create event');
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
      setError(null);
    } catch (err) {
        console.error(err);
      setError('Failed to delete event');
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
        }
      );
      setEvents(events.map(event => 
        event.id === updatedEvent.id ? response.data : event
      ));
      setError(null);
    } catch (err) {
        console.error(err);
      setError('Failed to update event');
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
        }
      );
      setDeletedEvents(deletedEvents.filter(event => event.id !== id));
      setEvents([...events, response.data]);
      setError(null);
    } catch (err) {
        console.error(err);
      setError('Failed to restore event');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <div>Please log in to view events</div>;
  }
  const noop = () => {};  // No-op function


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
<div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {showDeleted ? 'Deleted Events' : 'Event Manager'}
          </h1>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            {showDeleted ? (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                <span>Back to Active Events</span>
              </>
            ) : (
              <>
                <TrashIcon className="h-5 w-5" />
                <span>View Deleted Events</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {showDeleted ? (
          <div className="flex justify-center w-full px-4">
            <div className="bg-white p-6 rounded-xl shadow-md overflow-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Deleted Events</h2>
              {deletedEvents.length === 0 ? (
                <p className="text-gray-500">No deleted events found</p>
              ) : (
                <EventList
                  events={deletedEvents}
                  currentUserId={Number(session?.user?.id) || 0}
                  updateEvent={undefined}
                  deleteEvent={deleteEvent || noop}// lear more                  
                  restoreEvent={restoreEvent}
                  isDeletedView={true}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="lg:w-1/3 w-full px-4">
              <div className="bg-white p-6 rounded-xl shadow-md lg:sticky lg:top-4 mx-auto max-w-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Event</h2>
                <AddEvent addEvent={addEvent} />
              </div>
            </div>

            <div className="lg:w-2/3 w-full">
              <div className="bg-white p-6 rounded-xl shadow-md overflow-auto">
                <EventList
                  events={events}
                  deleteEvent={deleteEvent}
                  currentUserId={Number(session?.user?.id) || 0}
                  updateEvent={updateEvent}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}