import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StripeService } from '../../core/services/stripe.service';
import { OrderResponse } from '../../core/models/order.models';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-aurora-dark min-h-screen py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <!-- Loading State -->
        <div *ngIf="loading" class="py-20">
          <div class="w-12 h-12 border-3 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 class="font-serif text-xl text-white">Verifying Stripe Payment Confirmation...</h2>
          <p class="text-xs text-aurora-sand/60 mt-1">Contacting atelier in Tunisia to confirm order record</p>
        </div>

        <!-- Success Order Content -->
        <div *ngIf="!loading && order" class="bg-aurora-card border border-aurora-border rounded-2xl p-8 sm:p-12 text-left space-y-8 shadow-2xl">
          
          <!-- Top Badge -->
          <div class="text-center space-y-3 pb-6 border-b border-aurora-border/60">
            <div class="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h1 class="font-serif text-3xl font-bold text-white tracking-tight">Order Confirmed &amp; In Preparation</h1>
            <p class="text-xs text-aurora-sand/70 max-w-md mx-auto leading-relaxed">
              Thank you for supporting authentic Tunisian craftsmanship. Master artisans in Kairouan are preparing your handcrafted wooden mask for international DHL Express dispatch.
            </p>
            <div class="inline-block px-4 py-2 rounded-xl bg-aurora-darker border border-aurora-gold/30 text-xs font-mono text-aurora-gold mt-2">
              Order Reference: <strong class="text-white">{{ order.orderNumber }}</strong>
            </div>
          </div>

          <!-- Order Summary Details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div class="p-4 rounded-xl bg-aurora-darker border border-aurora-border/60 space-y-2">
              <span class="text-aurora-sand/50 block font-serif uppercase tracking-wider text-[10px]">Shipping Destination</span>
              <p class="text-white font-medium">{{ order.customerName }}</p>
              <p class="text-aurora-sand/70">{{ order.shippingAddressLine1 }}</p>
              <p *ngIf="order.shippingAddressLine2" class="text-aurora-sand/70">{{ order.shippingAddressLine2 }}</p>
              <p class="text-aurora-sand/70">{{ order.shippingCity }}, {{ order.shippingPostalCode }}</p>
              <p class="text-aurora-sand/70">{{ order.shippingCountry }}</p>
            </div>

            <div class="p-4 rounded-xl bg-aurora-darker border border-aurora-border/60 space-y-2">
              <span class="text-aurora-sand/50 block font-serif uppercase tracking-wider text-[10px]">Settlement &amp; Courier</span>
              <p class="text-white font-medium">Stripe Payment: <span class="text-emerald-400 font-bold">PAID</span></p>
              <p class="text-aurora-sand/70">Currency: {{ order.currency }}</p>
              <p class="text-white font-serif font-bold text-base mt-2">
                Total Settled: {{ order.currency === 'USD' ? '$' : '€' }}{{ order.totalAmount.toFixed(2) }}
              </p>
              <p class="text-[11px] text-aurora-gold">DHL Express Tracking will be emailed to: {{ order.customerEmail }}</p>
            </div>
          </div>

          <!-- Items Ordered -->
          <div class="space-y-3">
            <h3 class="font-serif text-sm font-semibold text-white uppercase tracking-wider">Masks In This Consignment</h3>
            <div class="divide-y divide-aurora-border/40 border border-aurora-border/60 rounded-xl overflow-hidden">
              <div *ngFor="let item of order.items" class="p-3.5 bg-aurora-darker flex justify-between items-center text-xs">
                <div>
                  <h4 class="font-serif font-semibold text-white">{{ item.productName }}</h4>
                  <p class="text-[11px] text-aurora-sand/50">{{ item.productWoodType }} • Qty: {{ item.quantity }}</p>
                </div>
                <span class="font-mono font-bold text-aurora-gold">
                  {{ order.currency === 'USD' ? '$' : '€' }}{{ item.totalPrice.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-aurora-border/60">
            <a 
              routerLink="/track" 
              [queryParams]="{order: order.orderNumber}"
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-aurora-card hover:bg-aurora-cardHover border border-aurora-border text-xs text-aurora-sand hover:text-white font-semibold transition-colors text-center">
              Track Shipment Status
            </a>
            <a 
              routerLink="/catalog" 
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-aurora-gold text-aurora-darker text-xs font-bold uppercase tracking-wider hover:bg-aurora-goldLight transition-colors text-center">
              Continue Browsing
            </a>
          </div>

        </div>

      </div>
    </div>
  `
})
export class CheckoutSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly stripeService = inject(StripeService);

  order: OrderResponse | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.fetchOrder(sessionId);
      } else {
        this.loading = false;
      }
    });
  }

  fetchOrder(sessionId: string): void {
    this.stripeService.getOrderConfirmationBySessionId(sessionId).subscribe({
      next: (res) => {
        this.order = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
