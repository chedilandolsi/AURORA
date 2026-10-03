import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { FooterComponent } from './shared/components/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer.component';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';

import { TrafficTrackerService } from './core/services/traffic-tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-aurora-dark text-aurora-sand">
      <!-- Storefront Header: Only displayed when not on admin management routes -->
      <app-header *ngIf="!isAdminRoute"></app-header>
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Storefront Footer: Only displayed when not on admin management routes -->
      <app-footer *ngIf="!isAdminRoute"></app-footer>

      <!-- Cart Drawer: Strictly omitted for admins and admin routes -->
      <app-cart-drawer *ngIf="!isAdminRoute && authService.currentUser()?.role !== 'ROLE_ADMIN'"></app-cart-drawer>
    </div>
  `
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly trafficTracker = inject(TrafficTrackerService);
  readonly authService = inject(AuthService);
  isAdminRoute = false;

  constructor() {
    const initialUrl = window.location.pathname;
    this.isAdminRoute = initialUrl.startsWith('/admin');
    this.trafficTracker.trackPage(initialUrl);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      this.isAdminRoute = url.startsWith('/admin');
      this.trafficTracker.trackPage(url);
    });
  }
}
