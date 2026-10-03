import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CartItem, CartResponse } from '../models/cart.models';
import { ProductDetail, ProductSummary } from '../models/product.models';
import { CurrencyService } from './currency.service';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly currencyService = inject(CurrencyService);
  private readonly authService = inject(AuthService);

  readonly items = signal<CartItem[]>([]);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly subtotalEur = computed(() =>
    this.items().reduce((total, item) => {
      const price = item.product.discountedPriceEur ?? item.product.priceEur ?? 0;
      return total + (price * item.quantity);
    }, 0)
  );

  readonly subtotalUsd = computed(() =>
    this.items().reduce((total, item) => {
      const price = item.product.discountedPriceUsd ?? item.product.priceUsd ?? 0;
      return total + (price * item.quantity);
    }, 0)
  );

  readonly shippingEur = computed(() => {
    if (this.items().length === 0) return 0;
    return this.subtotalEur() >= 200 ? 0 : 25;
  });

  readonly shippingUsd = computed(() => {
    if (this.items().length === 0) return 0;
    return this.subtotalUsd() >= 200 ? 0 : 25;
  });

  readonly totalEur = computed(() => this.subtotalEur() + this.shippingEur());
  readonly totalUsd = computed(() => this.subtotalUsd() + this.shippingUsd());

  readonly formattedSubtotal = computed(() =>
    this.currencyService.formatPrice(this.subtotalEur(), this.subtotalUsd())
  );

  readonly formattedShipping = computed(() => {
    const cur = this.currencyService.currentCurrency();
    const ship = cur === 'EUR' ? this.shippingEur() : this.shippingUsd();
    if (ship === 0) return 'FREE';
    return this.currencyService.formatPrice(this.shippingEur(), this.shippingUsd());
  });

  readonly formattedTotal = computed(() =>
    this.currencyService.formatPrice(this.totalEur(), this.totalUsd())
  );

  constructor() {
    // Clear legacy transient storage to ensure strictly database-backed cart
    localStorage.removeItem('aurora_cart');

    // Reactively synchronize cart with authentication state
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.role !== 'ROLE_ADMIN') {
        this.fetchUserCart();
      } else {
        this.items.set([]);
        this.closeDrawer();
      }
    });
  }

  fetchUserCart(): void {
    if (!this.authService.isAuthenticated() || this.authService.currentUser()?.role === 'ROLE_ADMIN') {
      this.items.set([]);
      return;
    }

    this.isLoading.set(true);
    this.http.get<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data && res.data.items) {
          this.items.set(this.normalizeCartItems(res.data.items));
        } else {
          this.items.set([]);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.items.set([]);
      }
    });
  }

  addToCart(product: ProductSummary | ProductDetail, quantity: number = 1): void {
    // Admins do not participate in shopping flows
    if (this.authService.currentUser()?.role === 'ROLE_ADMIN') {
      return;
    }

    const normalizedProduct: ProductSummary = {
      ...product,
      primaryImageUrl: (product as any).primaryImageUrl || 
        ((product as any).images?.length ? (product as any).images[0].imageUrl : '') ||
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    };

    if (this.authService.isAuthenticated()) {
      this.isLoading.set(true);
      this.http.post<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/items`, {
        productId: product.id,
        quantity
      }).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.data && res.data.items) {
            this.items.set(this.normalizeCartItems(res.data.items));
          }
          this.openDrawer();
        },
        error: () => {
          this.isLoading.set(false);
          // Fallback optimistic update
          this.optimisticAdd(normalizedProduct, quantity);
          this.openDrawer();
        }
      });
    } else {
      // Guest local interaction until login
      this.optimisticAdd(normalizedProduct, quantity);
      this.openDrawer();
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    if (this.authService.currentUser()?.role === 'ROLE_ADMIN') return;

    const item = this.items().find(i => i.product.id === productId);

    if (this.authService.isAuthenticated() && item && item.id) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }

      this.http.put<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/items/${item.id}`, {
        quantity
      }).subscribe({
        next: (res) => {
          if (res.data && res.data.items) {
            this.items.set(this.normalizeCartItems(res.data.items));
          }
        },
        error: () => {
          this.optimisticUpdate(productId, quantity);
        }
      });
    } else {
      this.optimisticUpdate(productId, quantity);
    }
  }

  removeFromCart(productId: string): void {
    if (this.authService.currentUser()?.role === 'ROLE_ADMIN') return;

    const item = this.items().find(i => i.product.id === productId);

    if (this.authService.isAuthenticated() && item && item.id) {
      this.http.delete<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/items/${item.id}`).subscribe({
        next: (res) => {
          if (res.data && res.data.items) {
            this.items.set(this.normalizeCartItems(res.data.items));
          } else {
            this.items.set([]);
          }
        },
        error: () => {
          this.items.update(list => list.filter(i => i.product.id !== productId));
        }
      });
    } else {
      this.items.update(list => list.filter(i => i.product.id !== productId));
    }
  }

  clearCart(): void {
    if (this.authService.isAuthenticated() && this.authService.currentUser()?.role !== 'ROLE_ADMIN') {
      this.http.delete<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/clear`).subscribe({
        next: () => this.items.set([]),
        error: () => this.items.set([])
      });
    } else {
      this.items.set([]);
    }
  }

  openDrawer(): void {
    // Only open drawer for customers or guests, never admins
    if (this.authService.currentUser()?.role !== 'ROLE_ADMIN') {
      this.isDrawerOpen.set(true);
    }
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    if (this.authService.currentUser()?.role !== 'ROLE_ADMIN') {
      this.isDrawerOpen.update(v => !v);
    }
  }

  private optimisticAdd(product: ProductSummary, quantity: number): void {
    const current = [...this.items()];
    const index = current.findIndex(i => i.product.id === product.id);

    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity: Math.min(current[index].quantity + quantity, product.stockQuantity || 99)
      };
    } else {
      current.push({
        product,
        quantity: Math.min(quantity, product.stockQuantity || 99)
      });
    }

    this.items.set(current);
  }

  private optimisticUpdate(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.items.update(list => list.filter(i => i.product.id !== productId));
      return;
    }

    this.items.update(list => list.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.product.stockQuantity || 99)
        };
      }
      return item;
    }));
  }

  private normalizeCartItems(items: CartItem[]): CartItem[] {
    return items.map(item => ({
      ...item,
      product: {
        ...item.product,
        primaryImageUrl: item.product.primaryImageUrl || 
          ((item.product as any).images?.length ? (item.product as any).images[0].imageUrl : '') ||
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
      }
    }));
  }
}
