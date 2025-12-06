import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import type { LoadProductsDto, LoadSuppliesDto, UpdateProductInventoryDto, UpdateSupplyInventoryDto } from '../types';

export const useEventProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'products', eventId],
        queryFn: () => inventoryService.getEventProducts(eventId),
        enabled: !!eventId,
    });
};

export const useAvailableProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'products', 'available', eventId],
        queryFn: () => inventoryService.getAvailableProducts(eventId),
        enabled: !!eventId,
    });
};

export const useLowStockProducts = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'products', 'low-stock', eventId],
        queryFn: () => inventoryService.getLowStockProducts(eventId),
        enabled: !!eventId,
    });
};

export const useEventSupplies = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'supplies', eventId],
        queryFn: () => inventoryService.getEventSupplies(eventId),
        enabled: !!eventId,
    });
};

export const useAvailableSupplies = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'supplies', 'available', eventId],
        queryFn: () => inventoryService.getAvailableSupplies(eventId),
        enabled: !!eventId,
    });
};

export const useLowStockSupplies = (eventId: string) => {
    return useQuery({
        queryKey: ['inventory', 'supplies', 'low-stock', eventId],
        queryFn: () => inventoryService.getLowStockSupplies(eventId),
        enabled: !!eventId,
    });
};

export const useInventoryMutations = (eventId: string) => {
    const queryClient = useQueryClient();

    const loadProducts = useMutation({
        mutationFn: (data: LoadProductsDto) => inventoryService.loadProducts(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'products', eventId] });
        },
    });

    const loadSupplies = useMutation({
        mutationFn: (data: LoadSuppliesDto) => inventoryService.loadSupplies(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'supplies', eventId] });
        },
    });

    const updateProduct = useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: UpdateProductInventoryDto }) =>
            inventoryService.updateEventProduct(eventId, productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'products', eventId] });
        },
    });

    const deleteProduct = useMutation({
        mutationFn: (productId: string) => inventoryService.deleteEventProduct(eventId, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'products', eventId] });
        },
    });

    const updateSupply = useMutation({
        mutationFn: ({ supplyId, data }: { supplyId: string; data: UpdateSupplyInventoryDto }) =>
            inventoryService.updateEventSupply(eventId, supplyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'supplies', eventId] });
        },
    });

    const deleteSupply = useMutation({
        mutationFn: (supplyId: string) => inventoryService.deleteEventSupply(eventId, supplyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'supplies', eventId] });
        },
    });

    return {
        loadProducts,
        loadSupplies,
        updateProduct,
        deleteProduct,
        updateSupply,
        deleteSupply,
    };
};
