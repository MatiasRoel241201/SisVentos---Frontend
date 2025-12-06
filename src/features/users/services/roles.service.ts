import { httpClient } from '@/lib/http/httpClient';
import { Role } from '../types';

export const rolesService = {
    getAvailable: async () => {
        return httpClient.get<Role[]>('/roles/available');
    },
};
