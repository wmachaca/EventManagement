// app/events/[id]/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Event, RegistrationStatus } from '@/types/event';
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
import {
  getRegistrationButtonText,
  isRegistrationDisabled,
  handleRegistration as handleRegistrationUtil,
} from '@/utils/registrationUtils';
import { formatDate, fetchEventDetails, checkRegistrationStatus } from '@/utils/eventUtils';
import { useLocale } from 'next-intl';

function getApprovedCount(applications: any[] = []) {
  return applications.filter(app => app.status === 'APPROVED').length;
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registration, setRegistration] = useState<RegistrationStatus>({
    isRegistered: false,
    status: null,
  });
  const locale = useLocale();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchEvent = async () => {
    try {
      const eventData = await fetchEventDetails(params.id, session);
      console.log(
        'Event applications inside fetchEvent:',
        getApprovedCount(eventData.applications),
      );
      setEvent(eventData);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(t('fetchError') || 'Failed to fetch event');
      setIsLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const registrationData = await checkRegistrationStatus(params.id, session);
      setRegistration(registrationData);
    } catch (err) {
      console.error('Error checking registration:', err);
      setRegistration({
        isRegistered: false,
        status: null,
      });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvent();
      checkRegistration();
    }
  }, [status]);

  const handleRegistration = async () => {
    try {
      await handleRegistrationUtil(
        params.id,
        registration,
        session,
        setRegistration,
        setIsRegistering,
        fetchEvent,
      );
    } catch (err) {
      setError(t('registrationError') || 'Failed to process registration');
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
    router.push(`/${locale}/events/${params.id}/edit`);
  };

  if (status === 'loading' || isLoading) {
    return <LoadingSkeleton />;
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

        <EventHeader
          event={event}
          session={session}
          onEdit={editEvent}
          onDelete={deleteEvent}
          onRegister={handleRegistration}
          isRegistering={isRegistering}
          registration={registration}
          t={t}
        />

        {event.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${event.imageUrl}`}
              alt={event.name}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <EventDetailsSection event={event} />

          <EventSidebar
            event={event}
            session={session}
            registration={registration}
            isRegistering={isRegistering}
            onRegister={handleRegistration}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
// Extract smaller components for better readability
const LoadingSkeleton = () => (
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

const EventHeader = ({
  event,
  session,
  onEdit,
  onDelete,
  onRegister,
  isRegistering,
  registration,
  t,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
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
          {event.creatorId === parseInt(session?.user?.id || '0') ? 'you' : event.creator?.name}
        </p>
      </div>

      <div className="flex gap-2">
        {event.creatorId === parseInt(session?.user?.id || '0') ? (
          <>
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <PencilIcon className="h-5 w-5" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <TrashIcon className="h-5 w-5" />
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={onRegister}
            disabled={isRegistrationDisabled(isRegistering, registration, event)}
            className={`flex items-center gap-1 px-6 py-3 rounded-lg text-white font-medium ${
              registration.isRegistered
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${isRegistrationDisabled(isRegistering, registration, event) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {getRegistrationButtonText(isRegistering, registration, t)}
          </button>
        )}
      </div>
    </div>
  </div>
);

const EventDetailsSection = ({ event }) => (
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
              <p className="text-gray-600">{event.location || 'Location to be announced'}</p>
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
                  {getApprovedCount(event.applications)} of {event.capacity} spots filled
                  {event.applications && (
                    <span className="block w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <span
                        className="block bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (getApprovedCount(event.applications) / event.capacity) * 100,
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
);

const EventSidebar = ({ event, session, registration, isRegistering, onRegister, t }) => (
  <div className="space-y-6">
    {event.creatorId !== parseInt(session?.user?.id || '0') && (
      <RegistrationCard
        event={event}
        registration={registration}
        isRegistering={isRegistering}
        onRegister={onRegister}
        t={t}
      />
    )}

    {event.contactEmail && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Contact Organizer</h3>
        <p className="text-gray-600">
          Questions? Email:{' '}
          <a href={`mailto:${event.contactEmail}`} className="text-blue-600 hover:underline">
            {event.contactEmail}
          </a>
        </p>
      </div>
    )}
  </div>
);

const RegistrationCard = ({ event, registration, isRegistering, onRegister, t }) => (
  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
    <h3 className="font-semibold text-blue-800 mb-2">Registration</h3>
    <p className="text-gray-600 mb-4">
      {registration.isRegistered
        ? "You're registered for this event!"
        : "Don't miss out on this exciting event!"}
    </p>

    <div className="space-y-2">
      <button
        onClick={onRegister}
        disabled={isRegistrationDisabled(isRegistering, registration, event)}
        className={`w-full py-2 rounded-lg text-white font-medium ${
          registration.isRegistered
            ? registration.status === 'APPROVED'
              ? 'bg-green-600 hover:bg-green-700'
              : registration.status === 'PENDING'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-600 hover:bg-gray-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } ${isRegistrationDisabled(isRegistering, registration, event) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {getRegistrationButtonText(isRegistering, registration, t)}
      </button>

      {registration.status === 'PENDING' && (
        <p className="text-sm text-yellow-600">
          {t('pendingApprovalNote') || 'Your registration is pending approval by the organizer.'}
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
          {t('eventNotPublished') || 'This event is not currently accepting registrations.'}
        </p>
      )}
    </div>
  </div>
);
