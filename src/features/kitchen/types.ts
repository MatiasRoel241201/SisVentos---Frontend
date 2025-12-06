// Kitchen-specific types (if needed beyond what's in orders/types.ts)
// For now, we'll re-export the Order types from orders feature

export type { Order, OrderItem, OrderStatus } from '../orders/types';

// Kitchen-specific interfaces can be added here if needed
import { Order } from '../orders/types';

export interface KitchenOrderWithRecipe extends Order {
    items: Array<import('../orders/types').OrderItem & {
        recipe?: Array<{
            supply: {
                id: string;
                name: string;
                unit: string;
            };
            qtyPerUnit: number;
        }>;
    }>;
}
