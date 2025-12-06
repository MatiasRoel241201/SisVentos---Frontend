import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { CreateOrderDto } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useCreateOrder = (eventId: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: CreateOrderDto) => ordersApi.createOrder(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', eventId] });
            toast({
                title: 'Orden creada',
                description: 'El pedido se ha registrado exitosamente.',
            });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'No se pudo crear la orden.',
                variant: 'destructive',
            });
        },
    });
};
