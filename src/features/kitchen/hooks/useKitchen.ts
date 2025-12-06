import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '../api/kitchen.api';

/**
 * Hook to fetch kitchen orders with automatic 5-second polling
 * @param eventId - Event ID to fetch orders for
 * @param status - Optional status filter
 */
export const useKitchenOrders = (eventId: string, status?: string) => {
    return useQuery({
        queryKey: ['kitchen', 'orders', eventId, status],
        queryFn: () => kitchenApi.getOrders(eventId, status),
        enabled: !!eventId,
        refetchInterval: 5000, // Poll every 5 seconds
    });
};

/**
 * Hook to fetch order details with recipes
 * @param eventId - Event ID
 * @param orderId - Order ID
 */
export const useKitchenOrderDetails = (eventId: string, orderId: string | null) => {
    return useQuery({
        queryKey: ['kitchen', 'order', eventId, orderId],
        queryFn: () => kitchenApi.getOrderWithRecipes(eventId, orderId!),
        enabled: !!eventId && !!orderId,
    });
};

/**
 * Hook for order status mutations (start and complete)
 * @param eventId - Event ID
 */
export const useKitchenOrderMutations = (eventId: string) => {
    const queryClient = useQueryClient();

    const startPreparation = useMutation({
        mutationFn: (orderId: string) => kitchenApi.startPreparation(eventId, orderId),
        onSuccess: () => {
            // Invalidate all kitchen orders queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['kitchen', 'orders', eventId] });
        },
    });

    const completePreparation = useMutation({
        mutationFn: (orderId: string) => kitchenApi.completePreparation(eventId, orderId),
        onSuccess: () => {
            // Invalidate all kitchen orders queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['kitchen', 'orders', eventId] });
        },
    });

    return {
        startPreparation,
        completePreparation,
    };
};
