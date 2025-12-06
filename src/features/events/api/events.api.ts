import { httpClient } from '@/lib/http/httpClient';
import { Event } from '../types';

export const eventsApi = {
    getActiveEvents: async () => {
        return httpClient.get<Event[]>('/events/active');
    },

    getAllEvents: async () => {
        return httpClient.get<Event[]>('/events');
    },

    getEvent: async (id: string) => {
        return httpClient.get<Event>(`/events/${id}`);
    },
};
