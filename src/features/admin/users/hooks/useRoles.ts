import { useQuery } from '@tanstack/react-query';
import { rolesService } from '../services/roles.service';

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: () => rolesService.getAvailable(),
    });
};
