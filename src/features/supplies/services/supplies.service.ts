import { httpClient } from '@/lib/http/httpClient';
import { Supply, CreateSupplyDto, UpdateSupplyDto, PaginationParams } from '../types';

export const suppliesService = {
  getAll: async (params?: PaginationParams) => {
    return httpClient.get<Supply[]>('/supplies', { params });
  },

  getActive: async (params?: PaginationParams) => {
    return httpClient.get<Supply[]>('/supplies/active', { params });
  },

  search: async (term: string, params?: PaginationParams) => {
    return httpClient.get<Supply[]>('/supplies/search', { params: { term, ...params } });
  },

  getOne: async (id: string) => {
    return httpClient.get<Supply>(`/supplies/${id}`);
  },

  create: async (data: CreateSupplyDto) => {
    return httpClient.post<Supply>('/supplies', data);
  },

  update: async (id: string, data: UpdateSupplyDto) => {
    return httpClient.patch<Supply>(`/supplies/${id}`, data);
  },

  delete: async (id: string) => {
    return httpClient.delete<Supply>(`/supplies/${id}`);
  },
};
