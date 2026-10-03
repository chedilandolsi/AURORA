import { ProductSummary } from './product.models';

export interface CartItem {
  id?: string;
  product: ProductSummary;
  quantity: number;
  lineTotalEur?: number;
  lineTotalUsd?: number;
}

export interface CartResponse {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotalEur: number;
  subtotalUsd: number;
  shippingEur: number;
  shippingUsd: number;
  totalEur: number;
  totalUsd: number;
}

export type Currency = 'EUR' | 'USD';
