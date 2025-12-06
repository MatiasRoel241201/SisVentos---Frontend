import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';

export const useOrders = (eventId: string, status?: string) => {
    return useQuery({
        queryKey: ['orders', eventId, status],
        queryFn: () => ordersApi.getOrders(eventId, status),
        enabled: !!eventId,
        refetchInterval: 60000,
    });
};
