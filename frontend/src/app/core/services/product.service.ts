import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { Category, PageResponse, ProductDetail, ProductFilter, ProductSummary } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`);
  }

  getCategoryBySlug(slug: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.apiUrl}/categories/${slug}`);
  }

  getProducts(filter: ProductFilter = {}): Observable<ApiResponse<PageResponse<ProductSummary>>> {
    let params = new HttpParams();

    if (filter.categorySlug) params = params.set('category', filter.categorySlug);
    if (filter.minPrice !== undefined && filter.minPrice !== null) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice !== undefined && filter.maxPrice !== null) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.search) params = params.set('search', filter.search);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);

    return this.http.get<ApiResponse<PageResponse<ProductSummary>>>(`${environment.apiUrl}/products`, { params });
  }

  getFeaturedProducts(): Observable<ApiResponse<ProductSummary[]>> {
    return this.http.get<ApiResponse<ProductSummary[]>>(`${environment.apiUrl}/products/featured`);
  }

  getOnSaleProducts(): Observable<ApiResponse<ProductSummary[]>> {
    return this.http.get<ApiResponse<ProductSummary[]>>(`${environment.apiUrl}/products/on-sale`);
  }

  getProductBySlug(slug: string): Observable<ApiResponse<ProductDetail>> {
    return this.http.get<ApiResponse<ProductDetail>>(`${environment.apiUrl}/products/${slug}`);
  }

  getProductById(id: string): Observable<ApiResponse<ProductDetail>> {
    return this.http.get<ApiResponse<ProductDetail>>(`${environment.apiUrl}/products/id/${id}`);
  }
}
