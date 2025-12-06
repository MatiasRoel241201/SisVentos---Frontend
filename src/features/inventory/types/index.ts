export interface EventProductInventory {
    id: string;
    eventId: string;
    productId: string;
    product: {
        id: string;
        name: string;
        cost: number;
        isActive: boolean;
    };
    initialQty: number;
    currentQty: number;
    minQty: number;
    cost: number;
    salePrice: number;
    profitMargin: number;
    hasRecipe: boolean;
    isActive: boolean;
}

export interface EventSupplyInventory {
    id: string;
    eventId: string;
    supplyId: string;
    supply: {
        id: string;
        name: string;
        unit: string;
        cost: number;
    };
    initialQty: number;
    currentQty: number;
    minQty: number;
    cost: number;
    isActive: boolean;
}

export interface LoadProductsDto {
    products: {
        productId: string;
        initialQty: number;
        minQty: number;
        salePrice: number;
        cost?: number; // Optional if product has recipe
    }[];
}

export interface LoadSuppliesDto {
    supplies: {
        supplyId: string;
        initialQty: number;
        minQty: number;
        cost: number;
    }[];
}

export interface UpdateProductInventoryDto {
    currentQty?: number;
    minQty?: number;
    cost?: number;
    salePrice?: number;
}

export interface UpdateSupplyInventoryDto {
    currentQty?: number;
    minQty?: number;
    cost?: number;
}
