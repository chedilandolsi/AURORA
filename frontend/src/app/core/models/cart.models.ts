import { ProductSummary } from './product.models';

export interface CartItem {
  product: ProductSummary;
  quantity: number;
}

export type Currency = 'EUR' | 'USD';
