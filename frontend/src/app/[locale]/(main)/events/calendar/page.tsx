'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import type { Event } from '@/types/event';
import { useLocale } from 'next-intl';
import CalendarToolbar from '@/components/events/CalendarToolbar';

const locales = {
  en: enUS,
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('EventCalendar');
  const locale = useLocale();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events/all`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('fetchError') || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const transformEventsForCalendar = () => {
    return events.map(event => ({
      id: event.id,
      title: event.name,
      start: new Date(event.startDate),
      end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      allDay: !event.endDate || isSameDay(new Date(event.startDate), new Date(event.endDate)),
      resource: {
        status: event.status,
        location: event.location,
        isVirtual: event.isVirtual,
        description: event.description,
      },
    }));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleSelectEvent = (event: any) => {
    router.push(`/${locale}/events/${event.id}`);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad'; // Default blue for published events
    if (event.resource.status === 'DRAFT') {
      backgroundColor = '#6c757d'; // Gray for drafts
    } else if (event.resource.status === 'CANCELED') {
      backgroundColor = '#dc3545'; // Red for canceled
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <div>{t('pleaseLogin')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('eventCalendar')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md h-[calc(100vh-200px)]">
          <Calendar
            localizer={localizer}
            events={transformEventsForCalendar()}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK]}
            defaultView={Views.MONTH}
            messages={{
              today: t('today'),
              previous: t('previous'),
              next: t('next'),
              month: t('month'),
              week: t('week'),
              day: t('day'),
              agenda: t('agenda'),
              date: t('date'),
              time: t('time'),
              event: t('event'),
              noEventsInRange: t('noEvents'),
            }}
            culture={locale}
            components={{
              toolbar: CalendarToolbar,
            }}
          />
        </div>
      </div>
    </div>
  );
}
