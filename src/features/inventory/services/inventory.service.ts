import { httpClient } from '@/lib/http/httpClient';
import { EventProductInventory, EventSupplyInventory, LoadProductsDto, LoadSuppliesDto, UpdateProductInventoryDto, UpdateSupplyInventoryDto } from '../types';

export const inventoryService = {
    // Products
    getEventProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products`);
    },

    getAvailableProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products/available`);
    },

    getLowStockProducts: async (eventId: string) => {
        return httpClient.get<EventProductInventory[]>(`/events/${eventId}/inventory/products/low-stock`);
    },

    loadProducts: async (eventId: string, data: LoadProductsDto) => {
        return httpClient.post(`/events/${eventId}/inventory/products`, data);
    },

    updateEventProduct: async (eventId: string, productId: string, data: UpdateProductInventoryDto) => {
        return httpClient.patch<EventProductInventory>(`/events/${eventId}/inventory/products/${productId}`, data);
    },

    deleteEventProduct: async (eventId: string, productId: string) => {
        return httpClient.delete<EventProductInventory>(`/events/${eventId}/inventory/products/${productId}`);
    },

    // Supplies
    getEventSupplies: async (eventId: string) => {
        return httpClient.get<EventSupplyInventory[]>(`/events/${eventId}/inventory/supplies`);
    },

    getAvailableSupplies: async (eventId: string) => {
        return httpClient.get<EventSupplyInventory[]>(`/events/${eventId}/inventory/supplies/available`);
    },

    getLowStockSupplies: async (eventId: string) => {
        return httpClient.get<EventSupplyInventory[]>(`/events/${eventId}/inventory/supplies/low-stock`);
    },

    loadSupplies: async (eventId: string, data: LoadSuppliesDto) => {
        return httpClient.post(`/events/${eventId}/inventory/supplies`, data);
    },

    updateEventSupply: async (eventId: string, supplyId: string, data: UpdateSupplyInventoryDto) => {
        return httpClient.patch<EventSupplyInventory>(`/events/${eventId}/inventory/supplies/${supplyId}`, data);
    },

    deleteEventSupply: async (eventId: string, supplyId: string) => {
        return httpClient.delete<EventSupplyInventory>(`/events/${eventId}/inventory/supplies/${supplyId}`);
    },

    // Calculate cost
    calculateProductCost: async (eventId: string, productId: string) => {
        return httpClient.get<{
            hasRecipe: boolean;
            calculatedCost: number;
            missingSupplies: string[];
            canLoad: boolean;
            message: string;
        }>(`/events/${eventId}/inventory/products/calculate-cost/${productId}`);
    },
};
