import { httpClient } from '@/lib/http/httpClient';
import { CreateOrderDto, Order } from '../types';

export const ordersApi = {
    getOrders: async (eventId: string, status?: string) => {
        const params = status && status !== 'all' ? `?status=${status.toUpperCase()}` : '';
        return httpClient.get<Order[]>(`/events/${eventId}/orders${params}`);
    },

    createOrder: async (eventId: string, data: CreateOrderDto) => {
        return httpClient.post<Order>(`/events/${eventId}/orders`, data);
    },

    getOrder: async (eventId: string, orderId: string) => {
        return httpClient.get<Order>(`/events/${eventId}/orders/${orderId}`);
    },
};
