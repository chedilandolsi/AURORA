import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrafficTrackerService {
  private readonly http = inject(HttpClient);
  private lastTrackedUrl = '';

  trackPage(url: string): void {
    // Track customer storefront visits, ignore admin operations
    if (url.startsWith('/admin') || url === this.lastTrackedUrl) {
      return;
    }
    this.lastTrackedUrl = url;

    const payload = {
      pageUrl: url,
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    };

    this.http.post(`${environment.apiUrl}/analytics/visit`, payload).subscribe({
      error: () => {
        // Fail silently so customer experience is unaffected
      }
    });
  }
}
