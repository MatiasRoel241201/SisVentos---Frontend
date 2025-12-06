import { httpClient } from '@/lib/http/httpClient';
import { Event, EventStatistics } from '../types';

export const eventsService = {
  getAll: async () => {
    return httpClient.get<Event[]>('/events');
  },

  getActive: async () => {
    return httpClient.get<Event[]>('/events/active');
  },

  getOne: async (id: string) => {
    return httpClient.get<Event>(`/events/${id}`);
  },

  getStats: async (id: string) => {
    return httpClient.get<EventStatistics>(`/events/${id}/stats`);
  },
};
