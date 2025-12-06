import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, AssignSuppliesDto } from '../types/index';
import { PaginationParams } from '@/features/supplies/types';

export const useProducts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getAll(params),
  });
};

export const useAvailableProducts = (eventId: string) => {
  return useQuery({
    queryKey: ['products', 'active', eventId],
    queryFn: () => productsService.getActive(),
    enabled: !!eventId,
  });
};

export const useProductRecipe = (productId: string) => {
  return useQuery({
    queryKey: ['products', productId, 'recipe'],
    queryFn: () => productsService.getSupplies(productId),
    enabled: !!productId,
  });
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: (data: CreateProductDto) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const assignSupplies = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSuppliesDto }) =>
      productsService.assignSupplies(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    assignSupplies,
  };
};
