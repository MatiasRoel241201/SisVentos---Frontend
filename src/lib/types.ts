// Backend response types
export interface BackendLoginResponse {
  id: string;
  userName: string;
  token: string;
  role: string; // 'admin' | 'cajero' | 'cocina'
  isActive?: boolean;
}

export interface BackendCheckStatusResponse {
  userName: string;
  token: string;
  isActive: boolean;
}

// Updated User type for auth
export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'CAJA' | 'COCINA';
  token?: string; // Added for auth
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerIdentifier: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  specialRequests?: string;
}


export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  eventId: string;
  event: {
    name: string;
  };
  realPrice: number;
}

export interface EventStatistics {
  totalOrders: number;
  totalRevenue: number;
  totalInvestment: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  topSellingItem: string;
  topSellingItems: Record<string, number>;
  averageOrderValue: number;
}
