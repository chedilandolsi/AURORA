export interface RevenueTrendPoint {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface CategorySales {
  categoryName: string;
  totalSales: number;
  percentage: number;
  unitsSold: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  woodType: string;
  unitsSold: number;
  totalRevenue: number;
  stockRemaining: number;
}

export interface AnalyticsSummary {
  period: string;
  totalRevenue: number;
  grossSales: number;
  averageOrderValue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  revenueTrend: RevenueTrendPoint[];
  categoryBreakdown: CategorySales[];
  topSellingProducts: TopProduct[];
}

export interface CreateProductPayload {
  categoryId: number;
  name: string;
  shortDescription?: string;
  detailedDescription: string;
  woodType: string;
  dimensions: string;
  weightGrams?: number;
  priceEur: number;
  priceUsd: number;
  discountPercentage?: number;
  stockQuantity: number;
  isFeatured?: boolean;
  isActive?: boolean;
  artisanNotes?: string;
  imageUrls?: string[];
}
