import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImageUrlPipe],
  template: `
    <div class="bg-aurora-dark min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-10 text-center sm:text-left">
          <div class="text-xs text-aurora-sand/60 mb-2">
            <a routerLink="/" class="hover:text-aurora-gold">Atelier</a> / <span class="text-aurora-gold">Cart</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">Your Atelier Selection</h1>
          <p class="text-xs sm:text-sm text-aurora-sand/70 mt-1">
            Review your selected handcrafted masks before proceeding to secure international checkout.
          </p>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="cartService.items().length === 0" class="text-center py-24 bg-aurora-card rounded-2xl border border-aurora-border p-8 space-y-4">
          <div class="w-16 h-16 rounded-full bg-aurora-darker border border-aurora-border flex items-center justify-center text-aurora-sand/40 mx-auto">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 class="font-serif text-xl font-bold text-white">Your cart is empty</h3>
          <p class="text-xs text-aurora-sand/60 max-w-sm mx-auto">
            Explore our curated catalog of rare Mediterranean olive wood and Saharan cedar masks.
          </p>
          <a routerLink="/catalog" class="inline-block mt-4 px-6 py-3 rounded-xl bg-aurora-gold text-aurora-darker font-bold text-xs uppercase tracking-wider hover:bg-aurora-goldLight transition-colors">
            Discover Catalog
          </a>
        </div>

        <!-- Cart Content -->
        <div *ngIf="cartService.items().length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Items List (8 cols) -->
          <div class="lg:col-span-8 space-y-4">
            <div 
              *ngFor="let item of cartService.items()" 
              class="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-aurora-card border border-aurora-border hover:border-aurora-gold/40 transition-colors">
              
              <!-- Thumbnail -->
              <img 
                [src]="item.product.primaryImageUrl | imageUrl" 
                [alt]="item.product.name" 
                class="w-full sm:w-28 h-36 object-cover rounded-xl border border-aurora-border flex-shrink-0" />

              <!-- Details -->
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <span class="text-[10px] font-bold uppercase tracking-wider text-aurora-gold">{{ item.product.categoryName }}</span>
                      <h3 class="font-serif text-lg font-bold text-white mt-0.5">{{ item.product.name }}</h3>
                      <p class="text-xs text-aurora-sand/60 mt-1">{{ item.product.woodType }}</p>
                      <p class="text-[11px] text-aurora-sand/40 font-mono mt-0.5">Dimensions: {{ item.product.dimensions }}</p>
                    </div>

                    <button 
                      (click)="cartService.removeFromCart(item.product.id)" 
                      class="text-aurora-sand/40 hover:text-rose-400 p-1.5 transition-colors"
                      title="Remove mask from cart">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Price and Quantity Controls -->
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-aurora-border/40">
                  <div class="flex items-center border border-aurora-border rounded-xl bg-aurora-darker overflow-hidden">
                    <button 
                      (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)" 
                      class="px-3.5 py-1.5 text-aurora-sand hover:text-white hover:bg-aurora-card transition-colors">
                      -
                    </button>
                    <span class="px-3.5 py-1.5 text-xs font-semibold text-white">{{ item.quantity }}</span>
                    <button 
                      (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)" 
                      class="px-3.5 py-1.5 text-aurora-sand hover:text-white hover:bg-aurora-card transition-colors"
                      [disabled]="item.quantity >= item.product.stockQuantity">
                      +
                    </button>
                  </div>

                  <div class="text-right">
                    <div class="text-xs text-aurora-sand/50">Item Total</div>
                    <div class="font-serif font-bold text-lg text-aurora-gold">
                      {{ currencyService.formatPrice(item.product.discountedPriceEur * item.quantity, item.product.discountedPriceUsd * item.quantity) }}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Summary & Checkout Action (4 cols) -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-6 sticky top-28">
              
              <h3 class="font-serif text-lg font-bold text-white pb-3 border-b border-aurora-border/60">Order Calculations</h3>

              <!-- Promo Code Input -->
              <div class="space-y-2">
                <label class="block text-xs text-aurora-sand/70">Collector Privilege Code</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="promoCode" 
                    placeholder="e.g. AURORA2026" 
                    class="flex-1 bg-aurora-darker border border-aurora-border rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-aurora-gold font-mono" />
                  <button 
                    (click)="applyPromo()" 
                    class="px-3.5 py-2 rounded-xl bg-aurora-darker hover:bg-aurora-cardHover border border-aurora-border text-xs text-aurora-gold font-semibold transition-colors">
                    Apply
                  </button>
                </div>
                <p *ngIf="promoSuccess" class="text-[11px] text-emerald-400">✓ Code active: Complimentary DHL priority courier!</p>
              </div>

              <!-- Breakdown -->
              <div class="space-y-2.5 text-xs pt-4 border-t border-aurora-border/40">
                <div class="flex justify-between text-aurora-sand/70">
                  <span>Subtotal</span>
                  <span class="text-white font-medium">{{ cartService.formattedSubtotal() }}</span>
                </div>
                <div class="flex justify-between text-aurora-sand/70">
                  <span>DHL Express Worldwide</span>
                  <span class="font-medium" [class.text-emerald-400]="cartService.formattedShipping() === 'FREE'" [class.text-white]="cartService.formattedShipping() !== 'FREE'">
                    {{ cartService.formattedShipping() }}
                  </span>
                </div>
                <div class="flex justify-between text-base font-serif font-bold text-white pt-3 border-t border-aurora-border/60">
                  <span>Estimated Total</span>
                  <span class="text-aurora-gold">{{ cartService.formattedTotal() }}</span>
                </div>
              </div>

              <!-- Checkout CTA -->
              <button 
                routerLink="/checkout"
                class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aurora-gold via-amber-400 to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-aurora-gold/20 transition-all flex items-center justify-center gap-2">
                <span>Proceed to Checkout</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div class="text-[11px] text-center text-aurora-sand/50 space-y-1">
                <p>🔒 256-bit Encrypted Stripe Checkout</p>
                <p>Wise Payout Integration • Worldwide Insurance</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class CartComponent {
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);

  promoCode = '';
  promoSuccess = false;

  applyPromo(): void {
    if (this.promoCode.trim().toUpperCase() === 'AURORA2026') {
      this.promoSuccess = true;
    }
  }
}
