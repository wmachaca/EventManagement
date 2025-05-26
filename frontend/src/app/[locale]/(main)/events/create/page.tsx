'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import AddEvent from '@/components/events/AddEvent';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Events');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleCreateEvent = async (formData: FormData) => {
    console.log('Submitting event...'); // add this line
    if (!session?.accessToken) {
      setSubmissionError(t('authError'));
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      const toastId = toast.loading(t('creatingEvent'));

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, formData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 5000, // 30s timeout
      });

      toast.success(t('createSuccess'), { id: toastId });
      router.push('/en/events/myevents');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
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
      return error.response?.data?.message || t('createError');
    }
    return t('createError');
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('createTitle')}</h1>

        <AddEvent
          onSubmit={handleCreateEvent}
          isSubmitting={isSubmitting}
          setSubmissionError={setSubmissionError}
        />
      </div>
    </div>
  );
}
