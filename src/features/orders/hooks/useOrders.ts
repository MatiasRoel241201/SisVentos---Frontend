import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';

export const useOrders = (eventId: string, status?: string) => {
    return useQuery({
        queryKey: ['orders', eventId, status],
        queryFn: () => ordersApi.getOrders(eventId, status),
        enabled: !!eventId,
        refetchInterval: 60000,
    });
};

export const useCancelOrder = (eventId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => ordersApi.cancelOrder(eventId, orderId),
        onSuccess: () => {
            // Invalidar cache de órdenes e inventario para refrescar alertas de stock
            queryClient.invalidateQueries({ queryKey: ['orders', eventId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'products', eventId] });
        },
    });
};
