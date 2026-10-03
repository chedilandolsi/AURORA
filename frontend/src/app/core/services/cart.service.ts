import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem } from '../models/cart.models';
import { ProductSummary } from '../models/product.models';
import { CurrencyService } from './currency.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly currencyService = inject(CurrencyService);
  private readonly STORAGE_KEY = 'aurora_cart';

  readonly items = signal<CartItem[]>(this.loadCartFromStorage());
  readonly isDrawerOpen = signal<boolean>(false);

  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly subtotalEur = computed(() =>
    this.items().reduce((total, item) => total + (item.product.discountedPriceEur * item.quantity), 0)
  );

  readonly subtotalUsd = computed(() =>
    this.items().reduce((total, item) => total + (item.product.discountedPriceUsd * item.quantity), 0)
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

  addToCart(product: ProductSummary, quantity: number = 1): void {
    const current = [...this.items()];
    const index = current.findIndex(i => i.product.id === product.id);

    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity: Math.min(current[index].quantity + quantity, product.stockQuantity)
      };
    } else {
      current.push({
        product,
        quantity: Math.min(quantity, product.stockQuantity)
      });
    }

    this.updateCart(current);
    this.openDrawer();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const current = this.items().map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.product.stockQuantity)
        };
      }
      return item;
    });

    this.updateCart(current);
  }

  removeFromCart(productId: string): void {
    const current = this.items().filter(item => item.product.id !== productId);
    this.updateCart(current);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update(v => !v);
  }

  private updateCart(items: CartItem[]): void {
    this.items.set(items);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private loadCartFromStorage(): CartItem[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }
}
