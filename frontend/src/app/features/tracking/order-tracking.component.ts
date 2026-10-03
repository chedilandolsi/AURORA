import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../core/services/stripe.service';
import { OrderResponse } from '../../core/models/order.models';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-aurora-dark min-h-screen py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-aurora-gold/30 bg-aurora-card text-xs uppercase tracking-widest text-aurora-gold">
            DHL Express Dispatch
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">Track Your Shipment</h1>
          <p class="text-xs sm:text-sm text-aurora-sand/70 max-w-md mx-auto">
            Monitor the status of your handcrafted mask as it travels from our Tunisian workshop to your destination.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="bg-aurora-card border border-aurora-border rounded-2xl p-4 sm:p-6 shadow-xl">
          <form (ngSubmit)="searchOrder()" class="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              [(ngModel)]="orderNumberQuery" 
              name="orderNumber"
              placeholder="Enter Order Reference (e.g. AUR-202610-8472)" 
              class="flex-1 bg-aurora-darker border border-aurora-border rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-aurora-gold font-mono" />
            <button 
              type="submit" 
              [disabled]="loading || !orderNumberQuery.trim()"
              class="px-6 py-3 rounded-xl bg-aurora-gold hover:bg-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50">
              <span *ngIf="!loading">Track Order</span>
              <span *ngIf="loading">Locating...</span>
            </button>
          </form>

          <div *ngIf="errorMessage" class="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {{ errorMessage }}
          </div>
        </div>

        <!-- Order Result Card -->
        <div *ngIf="order" class="bg-aurora-card border border-aurora-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-aurora-border/60 gap-4">
            <div>
              <span class="text-xs text-aurora-sand/50">Order Number</span>
              <h2 class="font-mono text-xl font-bold text-aurora-gold">{{ order.orderNumber }}</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-semibold"
                [class.bg-emerald-950]="order.paymentStatus === 'PAID'"
                [class.text-emerald-400]="order.paymentStatus === 'PAID'"
                [class.bg-amber-950]="order.paymentStatus !== 'PAID'"
                [class.text-amber-400]="order.paymentStatus !== 'PAID'">
                {{ order.paymentStatus === 'PAID' ? 'Payment Verified' : 'Awaiting Payment' }}
              </span>
            </div>
          </div>

          <!-- Fulfillment Progress Bar -->
          <div class="space-y-3">
            <h3 class="font-serif text-xs font-semibold text-white uppercase tracking-wider">Fulfillment Status</h3>
            <div class="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
              <div class="p-2 rounded-lg" [class.bg-aurora-gold]="isStepActive(1)" [class.text-aurora-darker]="isStepActive(1)" [class.bg-aurora-darker]="!isStepActive(1)" [class.text-aurora-sand]="!isStepActive(1)" [class.opacity-50]="!isStepActive(1)">
                1. Order Placed
              </div>
              <div class="p-2 rounded-lg" [class.bg-aurora-gold]="isStepActive(2)" [class.text-aurora-darker]="isStepActive(2)" [class.bg-aurora-darker]="!isStepActive(2)" [class.text-aurora-sand]="!isStepActive(2)" [class.opacity-50]="!isStepActive(2)">
                2. Artisan Inspection
              </div>
              <div class="p-2 rounded-lg" [class.bg-aurora-gold]="isStepActive(3)" [class.text-aurora-darker]="isStepActive(3)" [class.bg-aurora-darker]="!isStepActive(3)" [class.text-aurora-sand]="!isStepActive(3)" [class.opacity-50]="!isStepActive(3)">
                3. DHL Dispatched
              </div>
              <div class="p-2 rounded-lg" [class.bg-aurora-gold]="isStepActive(4)" [class.text-aurora-darker]="isStepActive(4)" [class.bg-aurora-darker]="!isStepActive(4)" [class.text-aurora-sand]="!isStepActive(4)" [class.opacity-50]="!isStepActive(4)">
                4. Delivered
              </div>
            </div>
          </div>

          <!-- Destination and Items -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-aurora-border/60">
            <div>
              <span class="text-aurora-sand/50 block font-serif uppercase tracking-wider text-[10px] mb-1">Destination</span>
              <p class="text-white font-medium">{{ order.customerName }}</p>
              <p class="text-aurora-sand/70">{{ order.shippingCity }}, {{ order.shippingCountry }}</p>
            </div>
            <div>
              <span class="text-aurora-sand/50 block font-serif uppercase tracking-wider text-[10px] mb-1">Carrier Details</span>
              <p class="text-white font-medium">DHL Express Air Cargo</p>
              <p class="text-aurora-sand/70">Transit Time: 3-5 business days</p>
            </div>
          </div>

          <!-- Items in order -->
          <div class="space-y-2 pt-4 border-t border-aurora-border/60">
            <span class="text-aurora-sand/50 block font-serif uppercase tracking-wider text-[10px]">Artisanal Pieces</span>
            <div *ngFor="let item of order.items" class="p-3 bg-aurora-darker rounded-xl flex justify-between items-center text-xs">
              <div>
                <span class="font-serif font-semibold text-white">{{ item.productName }}</span>
                <span class="text-aurora-sand/50 ml-2">Qty: {{ item.quantity }}</span>
              </div>
              <span class="font-mono text-aurora-gold">
                {{ order.currency === 'USD' ? '$' : '€' }}{{ item.totalPrice.toFixed(2) }}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class OrderTrackingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly stripeService = inject(StripeService);

  orderNumberQuery = '';
  order: OrderResponse | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderParam = params['order'];
      if (orderParam) {
        this.orderNumberQuery = orderParam;
        this.searchOrder();
      }
    });
  }

  searchOrder(): void {
    if (!this.orderNumberQuery.trim()) return;

    this.loading = true;
    this.errorMessage = '';
    this.order = null;

    this.stripeService.trackOrderByNumber(this.orderNumberQuery.trim()).subscribe({
      next: (res) => {
        this.order = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No order found with reference: ' + this.orderNumberQuery;
      }
    });
  }

  isStepActive(step: number): boolean {
    if (!this.order) return false;
    const status = this.order.status;
    if (step === 1) return true;
    if (step === 2) return status === 'PAID' || status === 'PROCESSING' || status === 'SHIPPED' || status === 'DELIVERED';
    if (step === 3) return status === 'SHIPPED' || status === 'DELIVERED';
    if (step === 4) return status === 'DELIVERED';
    return false;
  }
}
