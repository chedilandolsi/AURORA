import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
    <!-- Backdrop Overlay -->
    <div 
      *ngIf="cartService.isDrawerOpen()" 
      (click)="cartService.closeDrawer()" 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity">
    </div>

    <!-- Drawer Panel -->
    <div 
      class="fixed inset-y-0 right-0 max-w-full flex z-50 transition-transform duration-300 ease-in-out"
      [class.translate-x-0]="cartService.isDrawerOpen()"
      [class.translate-x-full]="!cartService.isDrawerOpen()">
      
      <div class="w-screen max-w-md bg-aurora-card border-l border-aurora-border shadow-2xl flex flex-col">
        
        <!-- Header -->
        <div class="p-6 border-b border-aurora-border/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-aurora-darker flex items-center justify-center text-aurora-gold">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-white">Your Atelier Cart</h3>
              <p class="text-xs text-aurora-sand/60">{{ cartService.itemCount() }} handcrafted {{ cartService.itemCount() === 1 ? 'mask' : 'masks' }}</p>
            </div>
          </div>

          <button 
            (click)="cartService.closeDrawer()" 
            class="text-aurora-sand/60 hover:text-white p-2 rounded-lg hover:bg-aurora-darker transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Free Shipping Progress Tracker -->
        <div class="bg-aurora-darker/60 px-6 py-3 border-b border-aurora-border/40">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="text-aurora-sand/70">
              <span *ngIf="freeShippingRemaining() <= 0" class="text-emerald-400 font-semibold">✓ Free DHL Express Shipping unlocked!</span>
              <span *ngIf="freeShippingRemaining() > 0">
                Add <strong class="text-aurora-gold">{{ formatRemaining() }}</strong> for Complimentary Worldwide DHL Express
              </span>
            </span>
          </div>
          <div class="w-full bg-aurora-border/40 rounded-full h-1.5 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-aurora-terracotta to-aurora-gold transition-all duration-500 rounded-full"
              [style.width.%]="shippingProgressPercentage()">
            </div>
          </div>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <ng-container *ngIf="cartService.items().length > 0; else emptyCart">
            <div 
              *ngFor="let item of cartService.items()" 
              class="flex gap-4 p-3 rounded-xl bg-aurora-dark/60 border border-aurora-border/60 hover:border-aurora-gold/30 transition-colors">
              
              <!-- Product Image -->
              <img 
                [src]="item.product.primaryImageUrl | imageUrl" 
                [alt]="item.product.name" 
                class="w-20 h-24 object-cover rounded-lg border border-aurora-border flex-shrink-0" />

              <!-- Info -->
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-serif text-sm font-semibold text-white truncate">{{ item.product.name }}</h4>
                    <button 
                      (click)="cartService.removeFromCart(item.product.id)" 
                      class="text-aurora-sand/40 hover:text-rose-400 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-[11px] text-aurora-sand/60 truncate mt-0.5">{{ item.product.woodType }}</p>
                </div>

                <!-- Price and Quantity Controls -->
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center border border-aurora-border rounded-lg bg-aurora-darker/80 overflow-hidden">
                    <button 
                      (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)" 
                      class="px-2.5 py-1 text-aurora-sand/70 hover:text-white hover:bg-aurora-card transition-colors">
                      -
                    </button>
                    <span class="px-2.5 py-1 text-xs font-semibold text-white">{{ item.quantity }}</span>
                    <button 
                      (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)" 
                      class="px-2.5 py-1 text-aurora-sand/70 hover:text-white hover:bg-aurora-card transition-colors"
                      [disabled]="item.quantity >= item.product.stockQuantity">
                      +
                    </button>
                  </div>

                  <span class="font-semibold text-sm text-aurora-gold">
                    {{ currencyService.formatPrice(item.product.discountedPriceEur * item.quantity, item.product.discountedPriceUsd * item.quantity) }}
                  </span>
                </div>

              </div>

            </div>
          </ng-container>

          <ng-template #emptyCart>
            <div class="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div class="w-16 h-16 rounded-full bg-aurora-darker border border-aurora-border flex items-center justify-center text-aurora-sand/40">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h4 class="font-serif text-lg text-white font-semibold">Your cart is empty</h4>
              <p class="text-xs text-aurora-sand/60 max-w-xs">
                Explore our curated collection of century-old olive wood masks carved by Tunisian masters.
              </p>
              <a 
                routerLink="/catalog" 
                (click)="cartService.closeDrawer()" 
                class="px-5 py-2.5 rounded-lg bg-aurora-gold text-aurora-darker font-semibold text-xs tracking-wider uppercase hover:bg-aurora-goldLight transition-colors">
                Discover Catalog
              </a>
            </div>
          </ng-template>
        </div>

        <!-- Footer / Subtotal & Checkout -->
        <div *ngIf="cartService.items().length > 0" class="p-6 border-t border-aurora-border/60 bg-aurora-darker/90 space-y-4">
          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-aurora-sand/70">
              <span>Subtotal</span>
              <span class="font-medium text-white">{{ cartService.formattedSubtotal() }}</span>
            </div>
            <div class="flex justify-between text-aurora-sand/70">
              <span>Worldwide DHL Express Shipping</span>
              <span class="font-medium" [class.text-emerald-400]="cartService.formattedShipping() === 'FREE'" [class.text-white]="cartService.formattedShipping() !== 'FREE'">
                {{ cartService.formattedShipping() }}
              </span>
            </div>
            <div class="flex justify-between text-sm font-semibold pt-2 border-t border-aurora-border/40 text-white">
              <span>Total Estimated</span>
              <span class="text-aurora-gold font-bold text-base">{{ cartService.formattedTotal() }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <button 
              (click)="goToCheckout()" 
              class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-aurora-gold to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-widest hover:brightness-105 transition-all shadow-lg shadow-aurora-gold/20 flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <p class="text-[10px] text-center text-aurora-sand/50">
              🔒 Powered by Stripe • Guaranteed Payout via Wise • Insured DHL Delivery
            </p>
          </div>
        </div>

      </div>

    </div>
  `
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);
  private readonly router = inject(Router);

  freeShippingRemaining(): number {
    const cur = this.currencyService.currentCurrency();
    const subtotal = cur === 'EUR' ? this.cartService.subtotalEur() : this.cartService.subtotalUsd();
    return Math.max(0, 200 - subtotal);
  }

  formatRemaining(): string {
    const cur = this.currencyService.currentCurrency();
    const sym = cur === 'EUR' ? '€' : '$';
    return `${sym}${this.freeShippingRemaining().toFixed(2)}`;
  }

  shippingProgressPercentage(): number {
    const cur = this.currencyService.currentCurrency();
    const subtotal = cur === 'EUR' ? this.cartService.subtotalEur() : this.cartService.subtotalUsd();
    return Math.min(100, Math.round((subtotal / 200) * 100));
  }

  goToCheckout(): void {
    this.cartService.closeDrawer();
    this.router.navigate(['/checkout']);
  }
}
