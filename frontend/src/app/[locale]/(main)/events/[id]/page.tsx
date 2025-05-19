// app/events/[id]/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Event } from '@/types/event';
import { useTranslations } from 'next-intl';
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvent();
      checkRegistration();
    }
  }, [status]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setEvent(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('fetchError') || 'Failed to fetch event');
      setIsLoading(false);
    }
  };

  const checkRegistration = async () => {
    console.error('I am inside checkregistration:');
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/registration`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setIsRegistered(response.data.isRegistered);
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const handleRegistration = async () => {
    setIsRegistering(true);
    try {
      if (isRegistered) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/apply`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/apply`,
          {},
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          },
        );
      }
      setIsRegistered(!isRegistered);
    } catch (err) {
      console.error(err);
      setError(t('registrationError') || 'Failed to process registration');
      await checkRegistration();
    } finally {
      setIsRegistering(false);
    }
  };

  const deleteEvent = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      router.push('/myevents');
    } catch (err) {
      console.error(err);
      setError(t('deleteError') || 'Failed to delete event');
    }
  };

  const editEvent = () => {
    router.push(`/events/${params.id}/edit`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-500">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-800'
                      : event.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {event.status}
                </span>
                {event.isVirtual && (
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    Virtual
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800">{event.name}</h1>
              <p className="text-gray-500 mt-2">
                Organized by{' '}
                {event.creatorId === parseInt(session?.user?.id || '0')
                  ? 'you'
                  : event.creator?.name}
              </p>
            </div>

            <div className="flex gap-2">
              {event.creatorId === parseInt(session?.user?.id || '0') ? (
                <>
                  <button
                    onClick={editEvent}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <PencilIcon className="h-5 w-5" />
                    Edit
                  </button>
                  <button
                    onClick={deleteEvent}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRegistration}
                  disabled={isRegistering}
                  className={`flex items-center gap-1 px-6 py-3 rounded-lg text-white font-medium ${
                    isRegistered ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isRegistering ? (
                    <span>Processing...</span>
                  ) : isRegistered ? (
                    <span>Cancel Registration</span>
                  ) : (
                    <span>Register Now</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Event Image */}
          {event.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${event.imageUrl}`}
                alt={event.name}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">About This Event</h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {event.description || 'No description provided'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Date & Time</p>
                      <p className="text-gray-600">
                        {formatDate(event.startDate)}
                        {event.endDate && ` - ${formatDate(event.endDate)}`}
                      </p>
                    </div>
                  </div>

                  {event.isVirtual ? (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Virtual Event</p>
                        <a
                          href={event.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {event.virtualLink || 'Link will be provided'}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Location</p>
                        <p className="text-gray-600">
                          {event.location || 'Location to be announced'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Capacity</p>
                      <p className="text-gray-600">
                        {event.capacity} attendees
                        {event.attendees && ` (${event.attendees.length} registered)`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Registration</h3>
                <p className="text-gray-600 mb-4">
                  {isRegistered
                    ? "You're registered for this event!"
                    : "Don't miss out on this exciting event!"}
                </p>

                {event.creatorId !== parseInt(session?.user?.id || '0') && (
                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    className={`w-full py-2 rounded-lg text-white font-medium ${
                      isRegistered
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isRegistering ? (
                      <span>Processing...</span>
                    ) : isRegistered ? (
                      <span>Cancel Registration</span>
                    ) : (
                      <span>Register Now</span>
                    )}
                  </button>
                )}
              </div>

              {event.contactEmail && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Contact Organizer</h3>
                  <p className="text-gray-600">
                    Questions? Email:{' '}
                    <a
                      href={`mailto:${event.contactEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {event.contactEmail}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
