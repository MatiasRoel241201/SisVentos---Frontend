export interface Event {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isClosed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EventStatistics {
    event: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        isClosed: boolean;
    };
    summary: {
        totalOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        totalRefunds: number;
        netRevenue: number;
        salesByMethod: {
            [key: string]: {
                completed: { count: number; amount: number };
                cancelled: { count: number; amount: number };
                net: number;
            };
        };
        totalInvestment: number;
        totalSupplies: number;
        totalProducts: number;
    };
    products: {
        topSelling: Array<{ product: string; qtySold: number; revenue: number }>;
        leastSelling: Array<{ product: string; qtySold: number; revenue: number }>;
        topProfitable: Array<{ product: string; revenue: number; cost: number; profit: number; profitMargin: number }>;
        leastProfitable: Array<{ product: string; revenue: number; cost: number; profit: number; profitMargin: number }>;
        topRemaining: Array<{ product: string; initialQty: number; currentQty: number; sold: number; remaining: number; wastedPercentage: number }>;
        leastRemaining: Array<{ product: string; initialQty: number; currentQty: number; sold: number; remaining: number; wastedPercentage: number }>;
        mostWasted: Array<{ product: string; initialQty: number; currentQty: number; sold: number; remaining: number; wastedPercentage: number }>;
    };
}

export interface EventUser {
    id: string;
    name: string;
    role: string;
}

export interface EventPromotion {
    id: string;
    eventId: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

export interface CreateEventDto {
    name: string;
    startDate: string;
    endDate: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
    isActive?: boolean;
    isClosed?: boolean;
}
