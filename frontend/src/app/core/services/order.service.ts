import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { CreateCheckoutSessionRequest, OrderResponse } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

  placeUnpaidOrder(request: CreateCheckoutSessionRequest): Observable<ApiResponse<OrderResponse>> {
    return this.http.post<ApiResponse<OrderResponse>>(
      `${environment.apiUrl}/orders/place-unpaid`,
      request
    );
  }

  getOrderByOrderNumber(orderNumber: string): Observable<ApiResponse<OrderResponse>> {
    return this.http.get<ApiResponse<OrderResponse>>(
      `${environment.apiUrl}/orders/${orderNumber}`
    );
  }

  getMyOrders(): Observable<ApiResponse<OrderResponse[]>> {
    return this.http.get<ApiResponse<OrderResponse[]>>(
      `${environment.apiUrl}/orders/my-orders`
    );
  }
}
