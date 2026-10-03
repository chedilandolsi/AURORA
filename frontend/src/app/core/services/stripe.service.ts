import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { CheckoutSessionResponse, CreateCheckoutSessionRequest, OrderResponse } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private readonly http = inject(HttpClient);

  createCheckoutSession(request: CreateCheckoutSessionRequest): Observable<ApiResponse<CheckoutSessionResponse>> {
    return this.http.post<ApiResponse<CheckoutSessionResponse>>(
      `${environment.apiUrl}/payments/create-checkout-session`,
      request
    );
  }

  getOrderConfirmationBySessionId(sessionId: string): Observable<ApiResponse<OrderResponse>> {
    return this.http.get<ApiResponse<OrderResponse>>(
      `${environment.apiUrl}/payments/session/${sessionId}`
    );
  }

  trackOrderByNumber(orderNumber: string): Observable<ApiResponse<OrderResponse>> {
    return this.http.get<ApiResponse<OrderResponse>>(
      `${environment.apiUrl}/orders/track/${orderNumber}`
    );
  }

  redirectToCheckout(checkoutUrl: string): void {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }
}
