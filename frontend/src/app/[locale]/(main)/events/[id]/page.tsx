'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios, { AxiosError } from 'axios';
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserPlusIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline';
import { Event, EventStatus, EventApplication, ApplicationStatus } from '@/types/event';
import { toast } from 'sonner';

interface StatusConfig {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  nextAction: string;
  nextStatus: EventStatus;
}

const statusConfig: Record<EventStatus, StatusConfig> = {
  DRAFT: {
    color: 'bg-gray-100 text-gray-800',
    icon: ClockIcon,
    label: 'Draft',
    nextAction: 'Publish',
    nextStatus: 'PUBLISHED',
  },
  PUBLISHED: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    label: 'Published',
    nextAction: 'Cancel',
    nextStatus: 'CANCELED',
  },
  CANCELED: {
    color: 'bg-red-100 text-red-800',
    icon: XCircleIcon,
    label: 'Canceled',
    nextAction: 'Publish',
    nextStatus: 'PUBLISHED',
  },
};

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status: authStatus } = useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

  // Initialize axios instance with auth header
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    timeout: 10000,
  });

  // Fetch event data
  const fetchEvent = async () => {
    try {
      const { data } = await axiosInstance.get<Event>(`/api/events/${id}`);
      setEvent(data);
      setEditedEvent(data);
      setError(null);

      // Check if current user is attending
      if (session?.user?.id) {
        const isAttending = data.attendees?.some(
          attendee => attendee.id === Number(session.user.id),
        );
        setIsAttending(isAttending);
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to load event details');
      toast.error('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const { data } = await axiosInstance.get<EventApplication[]>(
        `/api/events/${id}/applications`,
      );
      setApplications(data);

      // Check if current user has applied
      if (session?.user?.id) {
        const userApplication = data.find(app => app.userId === Number(session.user.id));
        setHasApplied(!!userApplication);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Failed to load applications');
    }
  };

  // Handle event update
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.put<Event>(`/api/events/${id}`, editedEvent);
      setEvent(data);
      setEditedEvent(data);
      setIsEditing(false);
      setError(null);
      toast.success('Event updated successfully');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to update event');
      toast.error('Failed to update event');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setIsLoading(true);
      await axiosInstance.delete(`/api/events/${id}`);
      toast.success('Event deleted successfully');
      router.push('/events');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to delete event');
      toast.error('Failed to delete event');
      setIsLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: EventStatus) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.patch<Event>(`/api/events/${id}/status`, {
        status: newStatus,
      });
      setEvent(data);
      setEditedEvent(data);
      setError(null);
      toast.success(`Event status changed to ${newStatus.toLowerCase()}`);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to update event status');
      toast.error('Failed to update event status');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle application status change
  const handleApplicationStatusChange = async (
    applicationId: number,
    status: ApplicationStatus,
  ) => {
    try {
      await axiosInstance.put(`/api/events/${id}/applications/${applicationId}/status`, { status });
      fetchApplications(); // Refresh applications list
      toast.success(`Application ${status.toLowerCase()}`);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to update application status');
      toast.error('Failed to update application status');
    }
  };

  // Handle apply to event
  const handleApply = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post(`/api/events/${id}/apply`);
      toast.success('Application submitted successfully');
      fetchApplications(); // Refresh applications
      fetchEvent(); // Refresh event data
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to apply to event');
      toast.error('Failed to apply to event');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel application
  const handleCancelApplication = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/api/events/${id}/applications`);
      toast.success('Application cancelled successfully');
      fetchApplications(); // Refresh applications
      fetchEvent(); // Refresh event data
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to cancel application');
      toast.error('Failed to cancel application');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (id && session?.accessToken) {
      fetchEvent();
      fetchApplications();
    }
  }, [id, session?.accessToken]);

  // Redirect if unauthenticated
  if (authStatus === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Loading states
  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error or not found states
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error ? 'Error Loading Event' : 'Event Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "The event you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <button
            onClick={() => router.push('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[event.status];
  const isCreator = session?.user?.id === event.creatorId;
  const isPublished = event.status === 'PUBLISHED';
  const isFull = applications.filter(app => app.status === 'APPROVED').length >= event.capacity;

  // Application status for current user
  const userApplication = applications.find(app => app.userId === Number(session?.user?.id));
  const applicationStatus = userApplication?.status;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation and error display */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Back to events"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Events
        </button>

        {error && (
          <div className="ml-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Main event card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Event header with title and actions */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.name || ''}
                onChange={e => setEditedEvent({ ...editedEvent, name: e.target.value })}
                className="text-2xl font-bold w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Event name"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 truncate">{event.name}</h1>
            )}

            <div className="mt-2 flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}
              >
                <currentStatus.icon className="h-4 w-4 mr-1" />
                {currentStatus.label}
              </span>
              {isFull && isPublished && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Full
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2 ml-4">
            {isCreator ? (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                      aria-label="Save changes"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-50"
                      title="Edit event"
                      aria-label="Edit event"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-50"
                      title="Delete event"
                      aria-label="Delete event"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              // Non-creator actions (apply/cancel)
              isPublished &&
              !isFull && (
                <>
                  {hasApplied ? (
                    <button
                      onClick={handleCancelApplication}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <UserMinusIcon className="h-5 w-5 mr-1" />
                      {isLoading ? 'Processing...' : 'Cancel Application'}
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <UserPlusIcon className="h-5 w-5 mr-1" />
                      {isLoading ? 'Processing...' : 'Apply to Event'}
                    </button>
                  )}
                </>
              )
            )}
          </div>
        </div>

        {/* Event details grid */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
            {isEditing ? (
              <textarea
                value={editedEvent.description || ''}
                onChange={e => setEditedEvent({ ...editedEvent, description: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder="Enter event description..."
                aria-label="Event description"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line">
                {event.description || (
                  <span className="italic text-gray-400">No description provided</span>
                )}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
              Date & Time
            </h2>
            {isEditing ? (
              <input
                type="datetime-local"
                value={editedEvent.schedule?.slice(0, 16) || ''}
                onChange={e =>
                  setEditedEvent({
                    ...editedEvent,
                    schedule: e.target.value,
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Event date and time"
              />
            ) : (
              <p className="text-gray-700">
                {new Date(event.schedule).toLocaleString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Location (conditionally rendered) */}
          {!event.isVirtual && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                Location
              </h2>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.location || ''}
                  onChange={e => setEditedEvent({ ...editedEvent, location: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location..."
                  aria-label="Event location"
                />
              ) : (
                <p className="text-gray-700">
                  {event.location || (
                    <span className="italic text-gray-400">No location specified</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Capacity */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <UsersIcon className="h-5 w-5 mr-2 text-gray-500" />
              Capacity
            </h2>
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={editedEvent.capacity || 0}
                onChange={e =>
                  setEditedEvent({
                    ...editedEvent,
                    capacity: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Event capacity"
              />
            ) : (
              <p className="text-gray-700">
                {applications.filter(app => app.status === 'APPROVED').length} / {event.capacity}{' '}
                attendees
              </p>
            )}
          </div>

          {/* Current user's application status */}
          {!isCreator && hasApplied && (
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Your Application</h2>
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    applicationStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : applicationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {applicationStatus || 'PENDING'}
                </span>
              </div>
            </div>
          )}

          {/* Status action button */}
          {isCreator && !isEditing && (
            <div className="md:col-span-2">
              <button
                onClick={() => handleStatusChange(currentStatus.nextStatus)}
                className={`px-4 py-2 rounded-md text-white ${
                  currentStatus.nextStatus === 'PUBLISHED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } transition-colors disabled:opacity-50`}
                disabled={isLoading}
                aria-label={currentStatus.nextAction}
              >
                {isLoading ? 'Processing...' : `${currentStatus.nextAction} Event`}
              </button>
            </div>
          )}
        </div>

        {/* Applications section (only visible to creator) */}
        {isCreator && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-gray-500" />
                Applications ({applications.length})
              </h2>
            </div>

            {applications.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">No applications yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map(application => (
                      <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.user.name}
                              </div>
                              <div className="text-sm text-gray-500">{application.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              application.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : application.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="space-x-2">
                            <button
                              onClick={() =>
                                handleApplicationStatusChange(application.id, 'APPROVED')
                              }
                              disabled={application.status === 'APPROVED' || isLoading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              aria-label={`Approve ${application.user.name}'s application`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleApplicationStatusChange(application.id, 'REJECTED')
                              }
                              disabled={application.status === 'REJECTED' || isLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              aria-label={`Reject ${application.user.name}'s application`}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
