import { httpClient } from '@/lib/http/httpClient';
import { Product, CreateProductDto, UpdateProductDto, AssignSuppliesDto, ProductSupply } from '../types';
import { PaginationParams } from '@/features/supplies/types';

export const productsService = {
  getAll: async (params?: PaginationParams) => {
    return httpClient.get<Product[]>('/products', { params });
  },

  getActive: async (params?: PaginationParams) => {
    return httpClient.get<Product[]>('/products/active', { params });
  },

  search: async (term: string, params?: PaginationParams) => {
    return httpClient.get<Product[]>('/products/search', { params: { term, ...params } });
  },

  getOne: async (id: string) => {
    return httpClient.get<Product>(`/products/${id}`);
  },

  getSupplies: async (id: string) => {
    return httpClient.get<ProductSupply[]>(`/products/${id}/supplies`);
  },

  create: async (data: CreateProductDto) => {
    return httpClient.post<Product>('/products', data);
  },

  update: async (id: string, data: UpdateProductDto) => {
    return httpClient.patch<Product>(`/products/${id}`, data);
  },

  delete: async (id: string) => {
    return httpClient.delete<Product>(`/products/${id}`);
  },

  assignSupplies: async (id: string, data: AssignSuppliesDto) => {
    return httpClient.post(`/products/${id}/supplies/batch`, data);
  },
};
