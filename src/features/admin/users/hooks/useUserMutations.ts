import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../types';

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const createUser = useMutation({
        mutationFn: (data: CreateUserDto) => usersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const updateUser = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
            usersService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const toggleActiveUser = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            isActive ? usersService.activate(id) : usersService.deactivate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const resetPassword = useMutation({
        mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
            usersService.resetPassword(id, newPassword),
        onSuccess: () => {
            // No need to invalidate users list for password reset, but good practice
        },
    });

    return {
        createUser,
        updateUser,
        toggleActiveUser,
        resetPassword,
    };
};
