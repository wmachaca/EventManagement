'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ApplicationsTable from '@/components/applications/ApplicationsTable';

interface Application {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedAt: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function EventRegistrationsPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('EventRegistrations');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEventDetails();
      fetchApplications();
    }
  }, [status, params.id]);

  const fetchEventDetails = async () => {
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
    } catch (err) {
      console.error(err);
      setError(t('fetchEventError') || 'Failed to fetch event details');
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}/applications`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setApplications(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('fetchError') || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: number,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/applications/${applicationId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      // Refresh applications after update
      await fetchApplications();
    } catch (err) {
      console.error(err);
      setError(t('updateError') || 'Failed to update application status');
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          {t('backToEvents')}
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('registrationsFor')}: {event?.name || 'Event'}
        </h1>
        <p className="text-gray-600 mb-6">
          {applications.length} {t('totalApplications')}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <ApplicationsTable
            applications={applications}
            onStatusChange={updateApplicationStatus}
            currentUserId={Number(session?.user?.id) || 0}
          />
        </div>
      </div>
    </div>
  );
}
