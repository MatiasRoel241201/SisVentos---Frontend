import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { UserFilters } from '../types';

export const useUsers = (filters?: UserFilters) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => usersService.getAll(filters),
    });
};
