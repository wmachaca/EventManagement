import { useState } from 'react';
import { PencilIcon, TrashIcon, ArrowPathIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Event, EventStatus } from '@/types/event';

interface EventRowProps {
  event: Event;
  deleteEvent: (id: number) => void;
  updateEvent?: (event: Event) => void;
  isDeletedView?: boolean;
  restoreEvent?: (id: number) => void;
}

export default function EventRow({
  event,
  deleteEvent,
  updateEvent,
  isDeletedView = false,
  restoreEvent,
}: EventRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event>({ ...event });
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColors: Record<EventStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-red-100 text-red-800',
  };

  const handleUpdate = () => {
    if (updateEvent) {
      updateEvent(editedEvent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteEvent(event.id);
  };

  const handleRestore = () => {
    if (restoreEvent) {
      restoreEvent(event.id);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            value={editedEvent.name}
            onChange={e => setEditedEvent({ ...editedEvent, name: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="text-sm font-medium text-gray-900">
            {event.name}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <textarea
            value={editedEvent.description || ''}
            onChange={e => setEditedEvent({ ...editedEvent, description: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        ) : (
          <div className="text-sm text-gray-500">{event.description || '-'}</div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="checkbox"
              checked={editedEvent.isVirtual}
              onChange={e => setEditedEvent({ ...editedEvent, isVirtual: e.target.checked })}
              className="mr-2"
            />
            <label>Virtual Event</label>
            {!editedEvent.isVirtual && (
              <input
                type="text"
                value={editedEvent.location || ''}
                onChange={e => setEditedEvent({ ...editedEvent, location: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Location"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center">
            {event.isVirtual ? (
              <span className="text-sm text-gray-500">Virtual Event</span>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-gray-500">{event.location || '-'}</span>
              </>
            )}
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="datetime-local"
            value={editedEvent.schedule}
            onChange={e => setEditedEvent({ ...editedEvent, schedule: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-500">
              {new Date(event.schedule).toLocaleString()}
            </span>
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <select
            value={editedEvent.status}
            onChange={e => setEditedEvent({ ...editedEvent, status: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELED">Canceled</option>
          </select>
        ) : (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[event.status]}`}
          >
            {event.status}
          </span>
        )}
      </td>

      {isDeletedView && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {event.deletedAt ? new Date(event.deletedAt).toLocaleString() : '-'}
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        {isEditing ? (
          <>
            <button onClick={handleUpdate} className="text-blue-600 hover:text-blue-900">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </>
        ) : isDeletedView ? (
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
              {isDeleting ? 'Deleting...' : 'Permanent Delete'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
              title="Edit event"
            >
              <PencilIcon className="h-5 w-5 mr-1" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-900 inline-flex items-center"
              title="Delete event"
            >
              <TrashIcon className="h-5 w-5 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      </td>
    </tr>
  );
}