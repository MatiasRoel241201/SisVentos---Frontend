export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  createdAt: string;
}

export interface EventStatistics {
  totalRevenue: number;
  totalInvestment: number;
  topSellingItems: { [key: string]: number };
  totalOrders: number;
}
