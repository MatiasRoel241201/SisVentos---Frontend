export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export interface CreateOrderItemDto {
    productId: string;
    qty: number;
}

export interface CreateOrderDto {
    items: CreateOrderItemDto[];
    paymentMethod: PaymentMethod;
    observations?: string;
}

export interface OrderItem {
    id: string;
    product: {
        id: string;
        name: string;
        price?: number; // Backend might not send price here, but unitPrice is on item
    };
    qty: number;
    unitPrice: number;
    status: string;
}

export interface OrderStatus {
    name: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface Order {
    id: string;
    orderNumber: number;
    event: { id: string };
    createdBy: { id: string; userName: string };
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
    customerIdentifier?: string;
    observations?: string;
    paymentMethod?: PaymentMethod;
}
