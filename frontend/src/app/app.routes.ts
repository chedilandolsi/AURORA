import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'Aurora | Artisanal Tunisian Wooden Masks & Heritage Decor'
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
    title: 'Artisanal Mask Gallery | Aurora Atelier'
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/product-details/product-details.component').then(m => m.ProductDetailsComponent),
    title: 'Masterpiece Details | Aurora'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Atelier Cart | Aurora'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Secure Express Checkout | Aurora'
  },
  {
    path: 'checkout/success',
    loadComponent: () => import('./features/checkout/checkout-success.component').then(m => m.CheckoutSuccessComponent),
    title: 'Order Confirmed | Aurora Atelier'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'Collector Sign In | Aurora'
  },
  {
    path: 'auth/oauth2-redirect',
    loadComponent: () => import('./features/auth/oauth2-redirect.component').then(m => m.OAuth2RedirectComponent)
  },
  {
    path: 'track',
    loadComponent: () => import('./features/tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
    title: 'Track Consignment | Aurora'
  },
  // Admin Routes with RBAC Guard
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        title: 'Sales & Revenue Analytics | Aurora Atelier'
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/product-management.component').then(m => m.ProductManagementComponent),
        title: 'Mask Inventory Management | Aurora Atelier'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
