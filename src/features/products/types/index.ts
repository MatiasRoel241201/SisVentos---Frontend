export interface Product {
  id: string;
  name: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasRecipe: boolean;
  supplies?: ProductSupply[];
}

export interface ProductSupply {
  supplyId: string;
  supply: {
    id: string;
    name: string;
    unit: string;
  };
  qtyPerUnit: number;
}

export interface CreateProductDto {
  name: string;
}

export interface UpdateProductDto {
  name?: string;
}

export interface AssignSuppliesDto {
  supplies: {
    supplyId: string;
    qtyPerUnit: number;
  }[];
}

