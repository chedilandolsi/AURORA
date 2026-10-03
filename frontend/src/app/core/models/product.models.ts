export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  productCount: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  woodType: string;
  dimensions: string;
  priceEur: number;
  priceUsd: number;
  discountedPriceEur: number;
  discountedPriceUsd: number;
  discountPercentage: number;
  stockQuantity: number;
  isFeatured: boolean;
  isActive?: boolean;
  primaryImageUrl: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
}

export interface ProductDetail extends ProductSummary {
  detailedDescription: string;
  weightGrams?: number;
  artisanNotes?: string;
  images: ProductImage[];
}

export interface ProductFilter {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
