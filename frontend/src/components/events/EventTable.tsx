import EventRow from './EventRow';
import type { Event } from '@/types/event';

interface EventTableProps {
  events: Event[];
  deleteEvent: (id: number) => void;
  updateEvent?: (event: Event) => void;
  isDeletedView?: boolean;
  restoreEvent?: (id: number) => void;
}

export default function EventTable({
  events,
  deleteEvent,
  updateEvent,
  isDeletedView = false,
  restoreEvent,
}: EventTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Start Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            End Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          {isDeletedView && (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deleted At
            </th>
          )}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {events.map(event => (
          <EventRow
            key={event.id}
            event={event}
            deleteEvent={deleteEvent}
            updateEvent={updateEvent}
            isDeletedView={isDeletedView}
            restoreEvent={restoreEvent}
          />
        ))}
      </tbody>
    </table>
  );
}
