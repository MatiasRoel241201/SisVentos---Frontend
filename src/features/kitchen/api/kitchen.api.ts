import { httpClient } from '@/lib/http/httpClient';
import { Order } from '../types';
import { KitchenOrderWithRecipe } from '../types';

export const kitchenApi = {
    /**
     * Get all orders for an event (optionally filtered by status)
     * @param eventId - Event ID
     * @param status - Optional status filter (PENDING, IN_PROGRESS, COMPLETED)
     */
    getOrders: async (eventId: string, status?: string) => {
        const url = `/kitchen/events/${eventId}/orders${status ? `?status=${status}` : ''}`;
        return httpClient.get<Order[]>(url);
    },

    /**
     * Get pending orders for an event
     * @param eventId - Event ID
     */
    getPendingOrders: async (eventId: string) => {
        return httpClient.get<Order[]>(`/kitchen/events/${eventId}/orders/pending`);
    },

    /**
     * Get order details with recipes
     * @param eventId - Event ID
     * @param orderId - Order ID
     */
    getOrderWithRecipes: async (eventId: string, orderId: string) => {
        return httpClient.get<KitchenOrderWithRecipe>(`/kitchen/events/${eventId}/orders/${orderId}`);
    },

    /**
     * Start preparation (PENDING → IN_PROGRESS)
     * @param eventId - Event ID
     * @param orderId - Order ID
     */
    startPreparation: async (eventId: string, orderId: string) => {
        return httpClient.patch<Order>(`/kitchen/events/${eventId}/orders/${orderId}/start`, {});
    },

    /**
     * Complete preparation (IN_PROGRESS → COMPLETED)
     * @param eventId - Event ID
     * @param orderId - Order ID
     */
    completePreparation: async (eventId: string, orderId: string) => {
        return httpClient.patch<Order>(`/kitchen/events/${eventId}/orders/${orderId}/complete`, {});
    },
};
