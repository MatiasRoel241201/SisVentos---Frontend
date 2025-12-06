export interface Supply {
  id: string;
  name: string;
  unit: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyDto {
  name: string;
  unit: string;

}

export interface UpdateSupplyDto {
  name?: string;
  unit?: string;

}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
