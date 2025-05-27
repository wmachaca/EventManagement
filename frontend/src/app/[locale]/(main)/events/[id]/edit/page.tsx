'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import AddEvent from '@/components/events/AddEvent';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLocale } from 'next-intl';

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED';

interface Event {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  capacity: number;
  virtualLink?: string;
  isVirtual: boolean;
  requiresApproval: boolean;
  contactEmail?: string;
  status: EventStatus;
  version: number;
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvent();
    }
  }, [status, params.id]);

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
      console.log('Event fetched successfully:', response.data);
      setCurrentEvent(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setSubmissionError(t('fetchError') || 'Failed to fetch event data');
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (formData: FormData) => {
    if (!session?.accessToken || !currentEvent) {
      console.error('No access token available or no current event');
      setSubmissionError(t('authError'));
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      const toastId = toast.loading(t('updatingEvent'));

      // Debug the request before sending
      console.log(
        'Sending PUT request to:',
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}`,
      );
      console.log('Request headers:', {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      });

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}`, formData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(t('updateSuccess'), { id: toastId });
      await fetchEvent();
      router.push(`/${locale}/events/${params.id}`);
    } catch (error) {
      console.error('Error updating event:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
        if (error.response?.status === 409) {
          // Conflict error - data was modified concurrently
          toast.error(t('concurrencyError'));
          await fetchEvent(); // Refresh data
        }
      }
      setSubmissionError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return t('authError');
      }
      return error.response?.data?.message || t('updateError');
    }
    return t('updateError');
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
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          {t('backToEvents')}
        </button>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('editTitle')}</h1>

          {submissionError && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {submissionError}
            </div>
          )}

          {currentEvent && (
            <AddEvent
              onSubmit={handleUpdateEvent}
              isSubmitting={isSubmitting}
              setSubmissionError={setSubmissionError}
              isEditMode={true}
              currentEvent={currentEvent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
