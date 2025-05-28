import { useState } from 'react';
import EventTable from './EventTable';
import type { Event, EventStatus } from '@/types/event';

interface EventListProps {
  events: Event[];
  deleteEvent: (id: number) => void;
  currentUserId: number;
  updateEvent?: (event: Event) => void;
  isDeletedView?: boolean;
  restoreEvent?: (id: number) => void;
}

export default function EventList({
  events,
  deleteEvent,
  currentUserId,
  updateEvent,
  isDeletedView = false,
  restoreEvent,
}: EventListProps) {
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VIRTUAL' | 'IN_PERSON'>('ALL');

  // Ensure events is always an array before filtering
  const safeEvents = Array.isArray(events) ? events : [];
  console.log('Safe events:', safeEvents);

  const filteredEvents = safeEvents.filter(event => {
    //const isOwned = event.creatorId === currentUserId;
    const statusMatch = statusFilter === 'ALL' || event.status === statusFilter;
    const typeMatch =
      typeFilter === 'ALL' ||
      (typeFilter === 'VIRTUAL' && event.isVirtual) ||
      (typeFilter === 'IN_PERSON' && !event.isVirtual);

    //return isOwned && statusMatch && typeMatch;
    return statusMatch && typeMatch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="text-sm text-gray-600 whitespace-nowrap">
              Status:
            </label>
            <select
              id="status-filter"
              onChange={e => setStatusFilter(e.target.value as EventStatus | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              value={statusFilter}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="type-filter" className="text-sm text-gray-600 whitespace-nowrap">
              Type:
            </label>
            <select
              id="type-filter"
              onChange={e => setTypeFilter(e.target.value as 'ALL' | 'VIRTUAL' | 'IN_PERSON')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              value={typeFilter}
            >
              <option value="ALL">All Types</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="IN_PERSON">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {isDeletedView ? 'No deleted events found' : 'No events match the selected filters'}
          </p>
        </div>
      ) : (
        <EventTable
          events={filteredEvents}
          deleteEvent={deleteEvent}
          updateEvent={updateEvent}
          isDeletedView={isDeletedView}
          restoreEvent={restoreEvent}
          currentUserId={currentUserId}          
        />
      )}
    </div>
  );
}
