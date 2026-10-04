import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { SimulationQuotaResponse, SimulationResponse } from '../models/ai.models';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly http = inject(HttpClient);

  simulateWall(productId: string, file: File): Observable<ApiResponse<SimulationResponse>> {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('wallImage', file);

    return this.http.post<ApiResponse<SimulationResponse>>(
      `${environment.apiUrl}/ai/simulate`,
      formData
    );
  }

  getQuota(): Observable<ApiResponse<SimulationQuotaResponse>> {
    return this.http.get<ApiResponse<SimulationQuotaResponse>>(
      `${environment.apiUrl}/ai/quota`
    );
  }
}
