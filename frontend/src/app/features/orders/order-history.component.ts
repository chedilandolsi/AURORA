import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyService } from '../../core/services/currency.service';
import { OrderResponse, OrderStatus, TrackingResponse } from '../../core/models/order.models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
    <div class="bg-aurora-dark min-h-screen py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <!-- Header -->
        <div class="border-b border-aurora-border/60 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div class="text-xs text-aurora-sand/60 mb-2">
              <a routerLink="/" class="hover:text-aurora-gold">Atelier</a> / 
              <span class="text-aurora-gold">Collector Acquisitions</span>
            </div>
            <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Order History &amp; Live Tracking
            </h1>
            <p class="text-xs sm:text-sm text-aurora-sand/70 mt-1 max-w-2xl">
              Track the journey of your handcrafted Tunisian wooden masks from our Kairouan atelier to your doorstep with live DHL Express checkpoints.
            </p>
          </div>

          <button 
            (click)="loadOrders()" 
            class="px-4 py-2.5 rounded-xl bg-aurora-card border border-aurora-border text-aurora-sand hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto hover:bg-aurora-cardHover transition-colors shadow">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class.animate-spin]="loading">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Status</span>
          </button>
        </div>

        <!-- Anonymous or Signed Out Alert -->
        <div *ngIf="!authService.currentUser()" class="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔐</span>
            <div>
              <p class="font-serif font-bold text-white text-sm">Sign in to view your complete acquisition dossier</p>
              <p class="text-aurora-sand/80 mt-0.5">Orders placed while signed in are automatically synchronized with your personal collector profile.</p>
            </div>
          </div>
          <a routerLink="/auth" class="px-5 py-2.5 rounded-xl bg-aurora-gold text-aurora-darker font-bold uppercase tracking-wider text-xs whitespace-nowrap">
            Sign In Now
          </a>
        </div>

        <!-- Filter Tabs -->
        <div class="flex flex-wrap gap-2 pb-2 border-b border-aurora-border/40">
          <button 
            (click)="activeFilter = null"
            class="px-4 py-2 rounded-xl text-xs font-medium transition-all"
            [class.bg-aurora-gold]="activeFilter === null"
            [class.text-aurora-darker]="activeFilter === null"
            [class.text-aurora-sand]="activeFilter !== null"
            [class.hover:text-white]="activeFilter !== null">
            All Orders ({{ orders.length }})
          </button>
          
          <button 
            (click)="activeFilter = 'PENDING_CONFIRMATION'"
            class="px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
            [class.bg-amber-500]="activeFilter === 'PENDING_CONFIRMATION'"
            [class.text-aurora-darker]="activeFilter === 'PENDING_CONFIRMATION'"
            [class.text-aurora-sand]="activeFilter !== 'PENDING_CONFIRMATION'"
            [class.hover:text-white]="activeFilter !== 'PENDING_CONFIRMATION'">
            <span>Ordered / Pending</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-950/80 text-amber-300">
              {{ countByStatus('PENDING_CONFIRMATION') + countByStatus('PENDING') }}
            </span>
          </button>

          <button 
            (click)="activeFilter = 'CONFIRMED'"
            class="px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
            [class.bg-blue-500]="activeFilter === 'CONFIRMED'"
            [class.text-aurora-darker]="activeFilter === 'CONFIRMED'"
            [class.text-aurora-sand]="activeFilter !== 'CONFIRMED'"
            [class.hover:text-white]="activeFilter !== 'CONFIRMED'">
            <span>Confirmed</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-950/80 text-blue-300">
              {{ countByStatus('CONFIRMED') }}
            </span>
          </button>

          <button 
            (click)="activeFilter = 'ON_THE_WAY'"
            class="px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
            [class.bg-purple-500]="activeFilter === 'ON_THE_WAY'"
            [class.text-aurora-darker]="activeFilter === 'ON_THE_WAY'"
            [class.text-aurora-sand]="activeFilter !== 'ON_THE_WAY'"
            [class.hover:text-white]="activeFilter !== 'ON_THE_WAY'">
            <span>On The Way</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-950/80 text-purple-300">
              {{ countByStatus('ON_THE_WAY') }}
            </span>
          </button>

          <button 
            (click)="activeFilter = 'DELIVERED'"
            class="px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
            [class.bg-emerald-500]="activeFilter === 'DELIVERED'"
            [class.text-aurora-darker]="activeFilter === 'DELIVERED'"
            [class.text-aurora-sand]="activeFilter !== 'DELIVERED'"
            [class.hover:text-white]="activeFilter !== 'DELIVERED'">
            <span>Delivered</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300">
              {{ countByStatus('DELIVERED') }}
            </span>
          </button>

          <button 
            (click)="activeFilter = 'REJECTED'"
            class="px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
            [class.bg-rose-500]="activeFilter === 'REJECTED'"
            [class.text-aurora-darker]="activeFilter === 'REJECTED'"
            [class.text-aurora-sand]="activeFilter !== 'REJECTED'"
            [class.hover:text-white]="activeFilter !== 'REJECTED'">
            <span>Rejected</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-950/80 text-rose-300">
              {{ countByStatus('REJECTED') }}
            </span>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="py-24 text-center space-y-4">
          <div class="w-10 h-10 border-3 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="font-serif text-white text-base">Retrieving Your Collection History...</p>
          <p class="text-xs text-aurora-sand/50">Querying verified orders and live DHL milestone caches</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredOrders.length === 0" class="py-20 text-center bg-aurora-card border border-aurora-border rounded-2xl p-8 space-y-4 shadow-xl">
          <div class="w-16 h-16 rounded-full bg-aurora-darker border border-aurora-border flex items-center justify-center mx-auto text-2xl text-aurora-gold">
            🏺
          </div>
          <h3 class="font-serif text-xl font-bold text-white">No Acquisitions Found</h3>
          <p class="text-xs text-aurora-sand/60 max-w-md mx-auto">
            You currently have no orders matching this filter. Explore our curated gallery of olive wood and Barbary fig wood masks to begin your collection.
          </p>
          <a routerLink="/catalog" class="inline-block px-6 py-3 rounded-xl bg-aurora-gold text-aurora-darker font-bold text-xs uppercase tracking-wider hover:bg-aurora-goldLight transition-colors">
            Explore Masterpiece Masks
          </a>
        </div>

        <!-- Orders List -->
        <div *ngIf="!loading && filteredOrders.length > 0" class="space-y-8">
          <div *ngFor="let order of filteredOrders" class="bg-aurora-card border border-aurora-border rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-aurora-gold/40">
            
            <!-- Card Header -->
            <div class="p-6 bg-aurora-darker/60 border-b border-aurora-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                  <span class="font-mono font-bold text-white text-sm">#{{ order.orderNumber }}</span>
                  
                  <!-- Status Pill -->
                  <span *ngIf="order.status === 'PENDING_CONFIRMATION' || order.status === 'PENDING'" 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-400">
                    ⏳ Ordered (Atelier Review)
                  </span>
                  <span *ngIf="order.status === 'CONFIRMED'" 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/80 border border-blue-500/40 text-blue-400">
                    ✓ Confirmed &amp; In Preparation
                  </span>
                  <span *ngIf="order.status === 'ON_THE_WAY'" 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300 animate-pulse">
                    ✈️ On The Way (DHL Express)
                  </span>
                  <span *ngIf="order.status === 'DELIVERED'" 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    🎉 Delivered
                  </span>
                  <span *ngIf="order.status === 'REJECTED'" 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 border border-rose-500/40 text-rose-400">
                    ✕ Cancelled / Rejected
                  </span>
                </div>
                <p class="text-aurora-sand/50 text-[11px]">
                  Placed on {{ order.createdAt | date:'mediumDate' }} at {{ order.createdAt | date:'shortTime' }} • Destination: {{ order.shippingCity }}, {{ order.shippingCountry }}
                </p>
              </div>

              <!-- Total & Tracking Action -->
              <div class="flex items-center gap-4 self-end md:self-auto">
                <div class="text-right">
                  <span class="text-[10px] font-mono text-aurora-sand/50 uppercase block">Total</span>
                  <span class="font-serif font-bold text-white text-base">
                    {{ order.currency === 'USD' ? '$' : '€' }}{{ order.totalAmount.toFixed(2) }}
                  </span>
                </div>

                <button 
                  *ngIf="order.trackingNumber"
                  (click)="toggleTracking(order)"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  [ngClass]="activeTrackingOrderId === order.id ? 'bg-amber-500 text-aurora-darker' : 'bg-aurora-darker hover:bg-aurora-border border border-amber-500/40 text-amber-400'">
                  <span>📦</span>
                  <span>{{ activeTrackingOrderId === order.id ? 'Hide Tracking' : 'Live DHL Tracking' }}</span>
                </button>
              </div>
            </div>

            <!-- Card Body: Items -->
            <div class="p-6 divide-y divide-aurora-border/40">
              <div *ngFor="let item of order.items" class="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-16 rounded-xl bg-aurora-darker border border-aurora-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <span class="text-xl">🎭</span>
                  </div>
                  <div>
                    <h4 class="font-serif font-semibold text-white text-sm">{{ item.productName }}</h4>
                    <p class="text-aurora-sand/60 text-[11px]">{{ item.productWoodType || 'Authentic Tunisian Artisan Wood' }}</p>
                    <span class="text-aurora-sand/40 text-[10px]">Quantity: {{ item.quantity }}</span>
                  </div>
                </div>

                <div class="text-right font-mono">
                  <span class="font-semibold text-aurora-gold">
                    {{ order.currency === 'USD' ? '$' : '€' }}{{ item.totalPrice.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Status Explanation Footnotes -->
            <div class="px-6 py-3.5 bg-aurora-darker/40 border-t border-aurora-border/60 text-[11px] text-aurora-sand/70 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span *ngIf="order.status === 'PENDING_CONFIRMATION' || order.status === 'PENDING'">
                  ⏳ Payment settled. Artisans are verifying wood grain authenticity and carving signatures.
                </span>
                <span *ngIf="order.status === 'CONFIRMED'">
                  ✨ Order approved! Sealed inside an authentic olive-wood presentation case awaiting courier handover.
                </span>
                <span *ngIf="order.status === 'ON_THE_WAY'">
                  ✈️ Air transit active via DHL Express. Inspected and cleared by Tunisian customs.
                </span>
                <span *ngIf="order.status === 'DELIVERED'">
                  🌿 Safely delivered to collector. Includes lifetime certificate of authenticity.
                </span>
                <span *ngIf="order.status === 'REJECTED'">
                  ✕ Order could not be fulfilled. Funds refunded and inventory restored.
                </span>
              </div>

              <div *ngIf="order.trackingNumber" class="font-mono text-amber-400">
                Tracking: {{ order.trackingNumber }}
              </div>
            </div>

            <!-- ================= EMBEDDED LUXURY DHL TRACKING TIMELINE ================= -->
            <!-- Rendered seamlessly when activeTrackingOrderId matches, or automatically if ON_THE_WAY -->
            <div *ngIf="activeTrackingOrderId === order.id || (order.status === 'ON_THE_WAY' && autoExpandedOrders[order.id] !== false)" 
              class="border-t border-aurora-gold/30 bg-gradient-to-b from-[#14120e] to-aurora-darker p-6 sm:p-8 animate-fadeIn">
              
              <!-- Courier Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-aurora-border/60 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm">
                    DHL
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-mono uppercase tracking-widest text-aurora-gold">Live Courier Dispatch</span>
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <h3 class="font-serif text-base font-bold text-white">
                      DHL Express Insured Consignment • {{ order.trackingNumber }}
                    </h3>
                  </div>
                </div>

                <div class="text-right text-xs">
                  <span class="text-aurora-sand/50 block text-[10px] uppercase font-mono">Carrier</span>
                  <span class="text-white font-medium">{{ order.carrier || 'DHL Express International' }}</span>
                </div>
              </div>

              <!-- Loading tracking data -->
              <div *ngIf="trackingLoading[order.id]" class="py-12 text-center space-y-2">
                <div class="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-xs text-aurora-sand/60">Contacting DHL Express API Gateway...</p>
              </div>

              <!-- Live Timeline Component -->
              <div *ngIf="!trackingLoading[order.id] && trackingData[order.id]" class="mt-6 space-y-6">
                
                <!-- Origin & Destination Banner -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-aurora-card/60 border border-aurora-border/60 text-xs">
                  <div>
                    <span class="text-[10px] font-mono text-aurora-sand/50 uppercase block">Atelier Origin</span>
                    <span class="text-white font-semibold">{{ trackingData[order.id].origin }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-aurora-sand/50 uppercase block">Delivery Target</span>
                    <span class="text-white font-semibold">{{ trackingData[order.id].destination }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-aurora-sand/50 uppercase block">Estimated Delivery</span>
                    <span class="text-amber-400 font-mono font-semibold">{{ trackingData[order.id].estimatedDelivery || 'Within 3-5 Business Days' }}</span>
                  </div>
                </div>

                <!-- Custom Luxury Vertical Milestones -->
                <div class="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-amber-500/50 before:to-aurora-border">
                  <div *ngFor="let step of trackingData[order.id].checkpoints; let i = index" class="relative group">
                    
                    <!-- Milestone Node Indicator -->
                    <div class="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                      [ngClass]="step.completed ? 'bg-amber-400 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]' : 'bg-aurora-darker border-aurora-border'">
                      <div *ngIf="step.completed" class="w-1.5 h-1.5 rounded-full bg-aurora-darker"></div>
                    </div>

                    <div class="p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      [ngClass]="step.completed ? 'bg-aurora-card/90 border border-amber-500/40 shadow-lg' : 'bg-aurora-card/30 border border-aurora-border/40 opacity-60'">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-white font-serif">{{ step.title || step.status || step.statusCode }}</span>
                          <span *ngIf="step.completed" class="text-[10px] px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-mono">
                            <span>✓</span>
                            <span>Processed</span>
                          </span>
                        </div>
                        <span class="text-[10px] font-mono text-aurora-sand/60">
                          {{ step.timestamp | date:'medium' }}
                        </span>
                      </div>

                      <div class="text-[11px] font-mono text-aurora-gold mt-1.5 flex items-center gap-1.5">
                        <span class="text-amber-400">📍</span>
                        <span>{{ step.location }}</span>
                      </div>

                      <p class="text-xs text-aurora-sand/80 mt-1.5 leading-relaxed">
                        {{ step.description }}
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);
  readonly currencyService = inject(CurrencyService);

  orders: OrderResponse[] = [];
  activeFilter: OrderStatus | null = null;
  loading = false;

  activeTrackingOrderId: string | null = null;
  autoExpandedOrders: { [orderId: string]: boolean } = {};
  trackingData: { [orderId: string]: TrackingResponse } = {};
  trackingLoading: { [orderId: string]: boolean } = {};

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.data || [];
        this.loading = false;

        // Auto-fetch tracking for all orders that are ON_THE_WAY
        for (const o of this.orders) {
          if (o.status === 'ON_THE_WAY' && o.trackingNumber) {
            this.fetchTracking(o.id);
          }
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredOrders(): OrderResponse[] {
    if (!this.activeFilter) return this.orders;
    if (this.activeFilter === 'PENDING_CONFIRMATION') {
      return this.orders.filter(o => o.status === 'PENDING_CONFIRMATION' || o.status === 'PENDING');
    }
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  countByStatus(status: OrderStatus): number {
    return this.orders.filter(o => o.status === status).length;
  }

  toggleTracking(order: OrderResponse): void {
    if (this.activeTrackingOrderId === order.id) {
      this.activeTrackingOrderId = null;
      this.autoExpandedOrders[order.id] = false;
    } else {
      this.activeTrackingOrderId = order.id;
      this.autoExpandedOrders[order.id] = true;
      if (!this.trackingData[order.id]) {
        this.fetchTracking(order.id);
      }
    }
  }

  fetchTracking(orderId: string): void {
    if (this.trackingData[orderId] || this.trackingLoading[orderId]) return;

    this.trackingLoading[orderId] = true;
    this.orderService.getOrderTracking(orderId).subscribe({
      next: (res) => {
        this.trackingData[orderId] = res.data;
        this.trackingLoading[orderId] = false;
      },
      error: () => {
        this.trackingLoading[orderId] = false;
      }
    });
  }
}
