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

interface RegistrationStatus {
  isRegistered: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<RegistrationStatus>({
    isRegistered: false,
    status: null,
  });

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
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/registration`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setRegistration(response.data.data); // Match the backend response structure
    } catch (err) {
      console.error('Error checking registration:', err);
      setRegistration({
        isRegistered: false,
        status: null,
      });
    }
  };

  const handleRegistration = async () => {
    setIsRegistering(true);
    try {
      if (registration.isRegistered) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/apply`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setRegistration({
          isRegistered: false,
          status: null,
        });
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/apply`,
          {},
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          },
        );

        // For immediate approval events, status will be APPROVED
        // For events requiring approval, status will be PENDING
        setRegistration({
          isRegistered: true,
          status: response.data.data.status,
        });

        // Refresh event data to update attendee count
        await fetchEvent();
      }
    } catch (err) {
      console.error(err);
      setError(t('registrationError') || 'Failed to process registration');
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
        <div className="w-full max-w-7xl mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
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

  const getRegistrationButtonText = () => {
    if (isRegistering) return t('processing') || 'Processing...';

    if (registration.isRegistered) {
      switch (registration.status) {
        case 'PENDING':
          return t('pendingApproval') || 'Pending Approval';
        case 'APPROVED':
          return t('registered') || 'Registered (Cancel)';
        case 'REJECTED':
          return t('rejected') || 'Application Rejected';
        default:
          return t('registered') || 'Registered (Cancel)';
      }
    }
    return t('registerNow') || 'Register Now';
  };

  const isRegistrationDisabled = () => {
    return (
      isRegistering ||
      (registration.isRegistered && registration.status === 'REJECTED') ||
      event.status !== 'PUBLISHED' ||
      (event.capacity && event.attendees?.length >= event.capacity)
    );
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
                        {event.capacity ? (
                          <>
                            {event.attendees?.length || 0} of {event.capacity} spots filled
                            {event.attendees && event.capacity && (
                              <span className="block w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <span
                                  className="block bg-blue-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(
                                        ((event.attendees.length || 0) / event.capacity) * 100,
                                      ),
                                    )}%`,
                                  }}
                                ></span>
                              </span>
                            )}
                          </>
                        ) : (
                          'Unlimited capacity'
                        )}
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
                  <div className="space-y-2">
                    <button
                      onClick={handleRegistration}
                      disabled={isRegistrationDisabled()}
                      className={`w-full py-2 rounded-lg text-white font-medium ${
                        registration.isRegistered
                          ? registration.status === 'APPROVED'
                            ? 'bg-green-600 hover:bg-green-700'
                            : registration.status === 'PENDING'
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-gray-600 hover:bg-gray-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } ${isRegistrationDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {getRegistrationButtonText()}
                    </button>

                    {registration.status === 'PENDING' && (
                      <p className="text-sm text-yellow-600">
                        {t('pendingApprovalNote') ||
                          'Your registration is pending approval by the organizer.'}
                      </p>
                    )}

                    {registration.status === 'REJECTED' && (
                      <p className="text-sm text-red-600">
                        {t('rejectedNote') || 'Your registration was not approved for this event.'}
                      </p>
                    )}

                    {event.capacity &&
                      event.attendees?.length >= event.capacity &&
                      !registration.isRegistered && (
                        <p className="text-sm text-red-600">
                          {t('eventFull') || 'This event has reached maximum capacity.'}
                        </p>
                      )}

                    {event.status !== 'PUBLISHED' && (
                      <p className="text-sm text-red-600">
                        {t('eventNotPublished') ||
                          'This event is not currently accepting registrations.'}
                      </p>
                    )}
                  </div>
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
