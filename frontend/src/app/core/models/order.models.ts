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

export type OrderStatus =
  | 'PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentMethod = 'STRIPE' | 'LOCAL_PSP';

export interface ReviewOrderRequest {
  reviewNote?: string;
}

export interface ShipOrderRequest {
  trackingNumber: string;
  carrier?: string;
}

export interface TrackingCheckpoint {
  timestamp: string;
  title?: string;
  status?: string;
  statusCode: string;
  location: string;
  description: string;
  completed: boolean;
}

export interface TrackingResponse {
  trackingNumber: string;
  orderNumber: string;
  carrier: string;
  status: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  origin: string;
  destination: string;
  checkpoints: TrackingCheckpoint[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod?: PaymentMethod;
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
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItemResponse[];
}
