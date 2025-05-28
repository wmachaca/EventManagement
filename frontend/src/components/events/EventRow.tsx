import { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { Event } from '@/types/event';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface EventRowProps {
  event: Event;
  deleteEvent: (id: number) => void;
  isDeletedView?: boolean;
  restoreEvent?: (id: number) => void;
  currentUserId: number;  
}

export default function EventRow({
  event,
  deleteEvent,
  isDeletedView = false,
  restoreEvent,
  currentUserId,  
}: EventRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  
  const canEdit = currentUserId === event.creatorId;
  const canDelete = canEdit; 

  const handleDelete = () => {
    setIsDeleting(true);
    deleteEvent(event.id);
  };

  const handleRestore = () => {
    if (restoreEvent) {
      restoreEvent(event.id);
    }
  };

  const viewRegistrations = () => {
    router.push(`/events/${event.id}/registrations`);//see if it handle the registrations
  };

  const viewDetails = () => {
    router.push(`/${locale}/events/${event.id}`);
  };


  const editEvent = () => {
  router.push(`/${locale}/events/${event.id}/edit`);
};

  // Count approved attendees
  const approvedAttendeesCount = event.applications?.filter(
    app => app.status === 'APPROVED'
  ).length || 0;


  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{event.name}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {event.capacity}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {approvedAttendeesCount}
        </div>
      </td>

      {isDeletedView && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {event.deletedAt ? formatDate(event.deletedAt) : '-'}
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        {isDeletedView ? (
          <>
            <button
              onClick={handleRestore}
              className="text-green-600 hover:text-green-900 inline-flex items-center"
              title="Restore event"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              Restore
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-900 inline-flex items-center"
              title="Permanently delete"
            >
              <TrashIcon className="h-5 w-5 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={viewDetails}
              className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              title="View details"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            {canEdit && (
              <button
                onClick={editEvent}
                className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                title="Edit event"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={viewRegistrations}
              className="text-purple-600 hover:text-purple-900 inline-flex items-center"
              title="View registrations"
            >
              <UserGroupIcon className="h-5 w-5" />
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                title="Delete event"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}