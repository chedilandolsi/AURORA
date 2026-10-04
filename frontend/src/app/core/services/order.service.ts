import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { OrderResponse, TrackingResponse } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

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

  getOrderTracking(orderId: string): Observable<ApiResponse<TrackingResponse>> {
    return this.http.get<ApiResponse<TrackingResponse>>(
      `${environment.apiUrl}/orders/${orderId}/tracking`
    );
  }

  getTrackingByOrderNumber(orderNumber: string): Observable<ApiResponse<TrackingResponse>> {
    return this.http.get<ApiResponse<TrackingResponse>>(
      `${environment.apiUrl}/orders/track/${orderNumber}`
    );
  }
}

