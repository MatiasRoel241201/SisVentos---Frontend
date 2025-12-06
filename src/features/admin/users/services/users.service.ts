import { httpClient } from '@/lib/http/httpClient';
import { User, CreateUserDto, UpdateUserDto, UserFilters } from '../types';

export const usersService = {
    getAll: async (params?: UserFilters) => {
        return httpClient.get<User[]>('/users', { params });
    },

    getOne: async (id: string) => {
        return httpClient.get<User>(`/users/${id}`);
    },

    create: async (data: CreateUserDto) => {
        return httpClient.post<User>('/users', data);
    },

    update: async (id: string, data: UpdateUserDto) => {
        return httpClient.patch<User>(`/users/${id}`, data);
    },

    activate: async (id: string) => {
        return httpClient.patch<User>(`/users/${id}/activate`);
    },

    deactivate: async (id: string) => {
        return httpClient.patch<User>(`/users/${id}/deactivate`);
    },

    resetPassword: async (id: string, newPassword: string) => {
        return httpClient.patch<{ message: string }>(`/users/${id}/reset-password`, { newPassword });
    }
};
