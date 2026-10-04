import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { PageResponse, ProductDetail } from '../models/product.models';
import { AnalyticsSummary, CreateProductPayload } from '../models/admin.models';
import { OrderResponse, OrderStatus, ReviewOrderRequest } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);

  getAnalytics(range: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' = 'MONTHLY'): Observable<ApiResponse<AnalyticsSummary>> {
    const params = new HttpParams().set('range', range);
    return this.http.get<ApiResponse<AnalyticsSummary>>(`${environment.apiUrl}/admin/analytics`, { params });
  }

  getProducts(page = 0, size = 20, search = ''): Observable<ApiResponse<PageResponse<ProductDetail>>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<ApiResponse<PageResponse<ProductDetail>>>(`${environment.apiUrl}/admin/products`, { params });
  }

  createProduct(payload: CreateProductPayload): Observable<ApiResponse<ProductDetail>> {
    return this.http.post<ApiResponse<ProductDetail>>(`${environment.apiUrl}/admin/products`, payload);
  }

  updateProduct(id: string, payload: Partial<CreateProductPayload>): Observable<ApiResponse<ProductDetail>> {
    return this.http.put<ApiResponse<ProductDetail>>(`${environment.apiUrl}/admin/products/${id}`, payload);
  }

  updateStock(id: string, stock: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${environment.apiUrl}/admin/products/${id}/stock`, { stock });
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/admin/products/${id}`);
  }

  uploadImage(file: File): Observable<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ imageUrl: string }>>(`${environment.apiUrl}/admin/products/upload-image`, formData);
  }

  uploadImages(files: File[]): Observable<ApiResponse<{ imageUrls: string[] }>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.http.post<ApiResponse<{ imageUrls: string[] }>>(`${environment.apiUrl}/admin/products/upload-images`, formData);
  }

  // --- Orders Management & Manual Confirmation Workflow ---
  getOrders(status?: OrderStatus): Observable<ApiResponse<OrderResponse[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<OrderResponse[]>>(`${environment.apiUrl}/admin/orders`, { params });
  }

  getOrderById(id: string): Observable<ApiResponse<OrderResponse>> {
    return this.http.get<ApiResponse<OrderResponse>>(`${environment.apiUrl}/admin/orders/${id}`);
  }

  confirmOrder(id: string, reviewNote?: string): Observable<ApiResponse<OrderResponse>> {
    const payload: ReviewOrderRequest = { reviewNote };
    return this.http.post<ApiResponse<OrderResponse>>(`${environment.apiUrl}/admin/orders/${id}/confirm`, payload);
  }

  rejectOrder(id: string, reviewNote?: string): Observable<ApiResponse<OrderResponse>> {
    const payload: ReviewOrderRequest = { reviewNote };
    return this.http.post<ApiResponse<OrderResponse>>(`${environment.apiUrl}/admin/orders/${id}/reject`, payload);
  }
}
