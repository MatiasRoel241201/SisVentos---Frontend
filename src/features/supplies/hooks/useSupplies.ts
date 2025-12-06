import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliesService } from '../services/supplies.service';
import type { CreateSupplyDto, UpdateSupplyDto, PaginationParams } from '../types';

export const useSupplies = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['supplies', params],
    queryFn: () => suppliesService.getAll(params),
  });
};

export const useActiveSupplies = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['supplies', 'active', params],
    queryFn: () => suppliesService.getActive(params),
  });
};

export const useSupplyMutations = () => {
  const queryClient = useQueryClient();

  const createSupply = useMutation({
    mutationFn: (data: CreateSupplyDto) => suppliesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
    },
  });

  const updateSupply = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplyDto }) =>
      suppliesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
    },
  });

  const deleteSupply = useMutation({
    mutationFn: (id: string) => suppliesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
    },
  });

  return {
    createSupply,
    updateSupply,
    deleteSupply,
  };
};
