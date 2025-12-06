import { httpClient } from '@/lib/http/httpClient';
import { Event } from '../types';
import { EventStatistics, CreateEventDto, UpdateEventDto } from '../types';

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

    create: async (data: CreateEventDto) => {
        return httpClient.post<Event>('/events', data);
    },

    update: async (id: string, data: UpdateEventDto) => {
        return httpClient.patch<Event>(`/events/${id}`, data);
    },

    delete: async (id: string) => {
        return httpClient.delete<void>(`/events/${id}`);
    },
};
