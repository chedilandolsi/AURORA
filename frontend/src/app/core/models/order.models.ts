export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateCheckoutSessionRequest {
  currency: 'EUR' | 'USD';
  items: OrderItemRequest[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
}

export interface OrderItemResponse {
  id: number;
  productId: string;
  productName: string;
  productWoodType?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItemResponse[];
}
