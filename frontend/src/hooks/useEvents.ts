// hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types';
import { api } from '@/lib/api';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const response = await api.post('/events', eventData);
      setEvents(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, createEvent, fetchEvents };
};
