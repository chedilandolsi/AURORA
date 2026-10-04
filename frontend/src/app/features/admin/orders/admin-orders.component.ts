import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse, OrderStatus, TrackingResponse } from '../../../core/models/order.models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      
      <!-- Top Title & Subtitle -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-aurora-border/60">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-widest text-aurora-gold">Artisanal Operations &amp; Logistics</span>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Order Fulfillment &amp; DHL Dispatch FSM
          </h1>
          <p class="text-xs text-aurora-sand/60 mt-1">
            Strict lifecycle management: Review settled payments, confirm craftsmanship, assign DHL tracking numbers, and finalize deliveries.
          </p>
        </div>

        <button 
          (click)="loadOrders()" 
          class="px-4 py-2.5 rounded-xl bg-aurora-card border border-aurora-border text-aurora-sand hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto hover:bg-aurora-cardHover transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class.animate-spin]="loading">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Feedback / Notification Banner -->
      <div *ngIf="feedbackMessage" class="p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-lg animate-fadeIn"
        [ngClass]="feedbackType === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'">
        <span class="flex items-center gap-2 font-medium">
          <span *ngIf="feedbackType === 'success'">✓</span>
          <span *ngIf="feedbackType === 'error'">⚠</span>
          {{ feedbackMessage }}
        </span>
        <button (click)="feedbackMessage = ''" class="hover:text-white text-xs">✕</button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div (click)="selectFilter(null)" class="cursor-pointer p-4 rounded-2xl bg-aurora-card border border-aurora-border hover:border-aurora-gold/50 transition-all">
          <span class="text-[10px] font-mono text-aurora-sand/50 uppercase tracking-wider block">Total Orders</span>
          <div class="text-2xl font-serif font-bold text-white mt-1">{{ allOrders.length }}</div>
        </div>

        <div (click)="selectFilter('PENDING_CONFIRMATION')" class="cursor-pointer p-4 rounded-2xl bg-aurora-card border transition-all"
          [class.border-amber-500]="activeFilter === 'PENDING_CONFIRMATION'"
          [class.border-aurora-border]="activeFilter !== 'PENDING_CONFIRMATION'">
          <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Pending Review</span>
          <div class="text-2xl font-serif font-bold text-amber-400 mt-1">{{ countByStatus('PENDING_CONFIRMATION') }}</div>
        </div>

        <div (click)="selectFilter('CONFIRMED')" class="cursor-pointer p-4 rounded-2xl bg-aurora-card border transition-all"
          [class.border-blue-500]="activeFilter === 'CONFIRMED'"
          [class.border-aurora-border]="activeFilter !== 'CONFIRMED'">
          <span class="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Confirmed</span>
          <div class="text-2xl font-serif font-bold text-blue-400 mt-1">{{ countByStatus('CONFIRMED') }}</div>
        </div>

        <div (click)="selectFilter('ON_THE_WAY')" class="cursor-pointer p-4 rounded-2xl bg-aurora-card border transition-all"
          [class.border-purple-500]="activeFilter === 'ON_THE_WAY'"
          [class.border-aurora-border]="activeFilter !== 'ON_THE_WAY'">
          <span class="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">On The Way</span>
          <div class="text-2xl font-serif font-bold text-purple-400 mt-1">{{ countByStatus('ON_THE_WAY') }}</div>
        </div>

        <div (click)="selectFilter('DELIVERED')" class="cursor-pointer p-4 rounded-2xl bg-aurora-card border transition-all"
          [class.border-emerald-500]="activeFilter === 'DELIVERED'"
          [class.border-aurora-border]="activeFilter !== 'DELIVERED'">
          <span class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Delivered</span>
          <div class="text-2xl font-serif font-bold text-emerald-400 mt-1">{{ countByStatus('DELIVERED') }}</div>
        </div>
      </div>

      <!-- Filter Tabs & Search Bar -->
      <div class="bg-aurora-card border border-aurora-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <!-- Tabs -->
        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            (click)="selectFilter(null)"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [class.bg-aurora-gold]="activeFilter === null"
            [class.text-aurora-darker]="activeFilter === null"
            [class.text-aurora-sand]="activeFilter !== null"
            [class.hover:text-white]="activeFilter !== null">
            All ({{ allOrders.length }})
          </button>
          
          <button 
            (click)="selectFilter('PENDING_CONFIRMATION')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            [class.bg-amber-500]="activeFilter === 'PENDING_CONFIRMATION'"
            [class.text-aurora-darker]="activeFilter === 'PENDING_CONFIRMATION'"
            [class.text-amber-400]="activeFilter !== 'PENDING_CONFIRMATION'"
            [class.hover:text-amber-300]="activeFilter !== 'PENDING_CONFIRMATION'">
            <span>Pending Review</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/30">
              {{ countByStatus('PENDING_CONFIRMATION') }}
            </span>
          </button>

          <button 
            (click)="selectFilter('CONFIRMED')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [class.bg-blue-500]="activeFilter === 'CONFIRMED'"
            [class.text-aurora-darker]="activeFilter === 'CONFIRMED'"
            [class.text-aurora-sand]="activeFilter !== 'CONFIRMED'"
            [class.hover:text-white]="activeFilter !== 'CONFIRMED'">
            Confirmed ({{ countByStatus('CONFIRMED') }})
          </button>

          <button 
            (click)="selectFilter('ON_THE_WAY')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [class.bg-purple-500]="activeFilter === 'ON_THE_WAY'"
            [class.text-aurora-darker]="activeFilter === 'ON_THE_WAY'"
            [class.text-aurora-sand]="activeFilter !== 'ON_THE_WAY'"
            [class.hover:text-white]="activeFilter !== 'ON_THE_WAY'">
            On The Way ({{ countByStatus('ON_THE_WAY') }})
          </button>

          <button 
            (click)="selectFilter('DELIVERED')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [class.bg-emerald-500]="activeFilter === 'DELIVERED'"
            [class.text-aurora-darker]="activeFilter === 'DELIVERED'"
            [class.text-aurora-sand]="activeFilter !== 'DELIVERED'"
            [class.hover:text-white]="activeFilter !== 'DELIVERED'">
            Delivered ({{ countByStatus('DELIVERED') }})
          </button>

          <button 
            (click)="selectFilter('REJECTED')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [class.bg-rose-500]="activeFilter === 'REJECTED'"
            [class.text-aurora-darker]="activeFilter === 'REJECTED'"
            [class.text-aurora-sand]="activeFilter !== 'REJECTED'"
            [class.hover:text-white]="activeFilter !== 'REJECTED'">
            Rejected ({{ countByStatus('REJECTED') }})
          </button>
        </div>

        <!-- Search -->
        <div class="relative w-full md:w-72">
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            placeholder="Search order #, tracking, email..." 
            class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2 text-xs text-white placeholder-aurora-sand/40 focus:outline-none focus:border-aurora-gold" />
          <span class="absolute right-3 top-2.5 text-aurora-sand/40 text-xs">🔍</span>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-aurora-card border border-aurora-border rounded-2xl overflow-hidden shadow-xl">
        <!-- Loading State -->
        <div *ngIf="loading" class="py-20 text-center space-y-3">
          <div class="w-8 h-8 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-aurora-sand/60">Fetching atelier orders from repository...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredOrders.length === 0" class="py-16 text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-aurora-darker border border-aurora-border flex items-center justify-center mx-auto text-2xl text-aurora-sand/40">
            📦
          </div>
          <h3 class="font-serif text-lg text-white font-medium">No Orders in this Queue</h3>
          <p class="text-xs text-aurora-sand/60 max-w-sm mx-auto">
            There are currently no customer orders matching the selected filter.
          </p>
        </div>

        <!-- Table View -->
        <div *ngIf="!loading && filteredOrders.length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-aurora-darker text-aurora-sand/70 border-b border-aurora-border/60 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Order Ref</th>
                <th class="px-5 py-3.5">Date</th>
                <th class="px-5 py-3.5">Customer / Destination</th>
                <th class="px-5 py-3.5">Payment</th>
                <th class="px-5 py-3.5">FSM Status</th>
                <th class="px-5 py-3.5">DHL Tracking</th>
                <th class="px-5 py-3.5 text-right">Total</th>
                <th class="px-5 py-3.5 text-center">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-aurora-border/40">
              <tr *ngFor="let order of filteredOrders" class="hover:bg-aurora-cardHover/60 transition-colors">
                <!-- Order Ref -->
                <td class="px-5 py-4 font-mono font-medium text-white whitespace-nowrap">
                  <span class="text-aurora-gold hover:underline cursor-pointer" (click)="openDetailModal(order)">
                    {{ order.orderNumber }}
                  </span>
                  <div class="text-[11px] text-aurora-sand/40 mt-0.5">{{ order.items.length }} piece(s)</div>
                </td>

                <!-- Date -->
                <td class="px-5 py-4 text-aurora-sand/70 whitespace-nowrap">
                  {{ order.createdAt | date:'mediumDate' }}
                  <div class="text-[10px] text-aurora-sand/40">{{ order.createdAt | date:'shortTime' }}</div>
                </td>

                <!-- Customer & Destination -->
                <td class="px-5 py-4">
                  <div class="font-medium text-white">{{ order.customerName }}</div>
                  <div class="text-[11px] text-aurora-sand/60 truncate max-w-xs">{{ order.customerEmail }}</div>
                  <div class="text-[10px] text-aurora-sand/40">{{ order.shippingCity }}, {{ order.shippingCountry }}</div>
                </td>

                <!-- Payment -->
                <td class="px-5 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    💳 {{ order.paymentMethod || 'STRIPE' }}
                  </span>
                  <div class="text-[10px] text-aurora-sand/40 mt-0.5">{{ order.paymentStatus }}</div>
                </td>

                <!-- Status Badge -->
                <td class="px-5 py-4 whitespace-nowrap">
                  <span *ngIf="order.status === 'PENDING_CONFIRMATION'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-400">
                    ⏳ Pending Review
                  </span>
                  <span *ngIf="order.status === 'CONFIRMED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/80 border border-blue-500/40 text-blue-400">
                    ✓ Confirmed
                  </span>
                  <span *ngIf="order.status === 'ON_THE_WAY'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300">
                    ✈️ On The Way
                  </span>
                  <span *ngIf="order.status === 'DELIVERED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    🎉 Delivered
                  </span>
                  <span *ngIf="order.status === 'REJECTED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 border border-rose-500/40 text-rose-400">
                    ✕ Rejected
                  </span>
                </td>

                <!-- Tracking -->
                <td class="px-5 py-4 whitespace-nowrap">
                  <div *ngIf="order.trackingNumber" class="flex items-center gap-1.5">
                    <span 
                      (click)="viewTracking(order)"
                      class="cursor-pointer font-mono text-[11px] text-amber-400 hover:text-amber-300 underline bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      {{ order.trackingNumber }}
                    </span>
                  </div>
                  <span *ngIf="!order.trackingNumber" class="text-aurora-sand/40 text-[11px] italic">
                    Not dispatched
                  </span>
                </td>

                <!-- Total -->
                <td class="px-5 py-4 text-right font-mono font-bold text-white whitespace-nowrap">
                  {{ order.currency === 'USD' ? '$' : '€' }}{{ order.totalAmount.toFixed(2) }}
                </td>

                <!-- Actions -->
                <td class="px-5 py-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    
                    <!-- 1. PENDING_CONFIRMATION: Confirm or Reject -->
                    <ng-container *ngIf="order.status === 'PENDING_CONFIRMATION'">
                      <button 
                        (click)="openConfirmModal(order)"
                        title="Confirm order & approve artisan preparation"
                        class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow">
                        Approve
                      </button>
                      <button 
                        (click)="openRejectModal(order)"
                        title="Reject order & restore inventory"
                        class="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-[11px] transition-colors shadow">
                        Reject
                      </button>
                    </ng-container>

                    <!-- 2. CONFIRMED: Ship with DHL Tracking Number -->
                    <ng-container *ngIf="order.status === 'CONFIRMED'">
                      <button 
                        (click)="openShipModal(order)"
                        title="Ship via DHL / Poste Rapide"
                        class="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition-colors shadow flex items-center gap-1">
                        <span>✈️</span>
                        <span>Dispatch DHL</span>
                      </button>
                    </ng-container>

                    <!-- 3. ON_THE_WAY: Mark Delivered -->
                    <ng-container *ngIf="order.status === 'ON_THE_WAY'">
                      <button 
                        (click)="deliverOrder(order)"
                        title="Mark as delivered"
                        class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow">
                        Mark Delivered
                      </button>
                    </ng-container>

                    <!-- General Details Button -->
                    <button 
                      (click)="openDetailModal(order)" 
                      title="View full order details"
                      class="px-2.5 py-1 rounded-lg bg-aurora-darker hover:bg-aurora-border border border-aurora-border text-aurora-sand/80 hover:text-white text-[11px] transition-colors">
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= DETAILS MODAL ================= -->
      <div *ngIf="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-aurora-card border border-aurora-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div class="flex items-start justify-between border-b border-aurora-border/60 pb-4">
            <div>
              <span class="text-[10px] font-mono uppercase tracking-widest text-aurora-gold">Order Specifications</span>
              <h2 class="font-serif text-xl font-bold text-white mt-0.5">Order #{{ selectedOrder.orderNumber }}</h2>
            </div>
            <button (click)="selectedOrder = null" class="text-aurora-sand/60 hover:text-white text-lg">✕</button>
          </div>

          <!-- Customer & Shipping Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-aurora-darker border border-aurora-border/60 space-y-1.5">
              <span class="text-[10px] font-mono text-aurora-sand/50 uppercase">Collector Information</span>
              <p class="text-white font-semibold">{{ selectedOrder.customerName }}</p>
              <p class="text-aurora-sand/70">{{ selectedOrder.customerEmail }}</p>
              <p *ngIf="selectedOrder.customerPhone" class="text-aurora-sand/70">{{ selectedOrder.customerPhone }}</p>
            </div>

            <div class="p-4 rounded-xl bg-aurora-darker border border-aurora-border/60 space-y-1.5">
              <span class="text-[10px] font-mono text-aurora-sand/50 uppercase">Delivery Destination</span>
              <p class="text-white">{{ selectedOrder.shippingAddressLine1 }}</p>
              <p *ngIf="selectedOrder.shippingAddressLine2" class="text-aurora-sand/70">{{ selectedOrder.shippingAddressLine2 }}</p>
              <p class="text-aurora-sand/70">{{ selectedOrder.shippingCity }}, {{ selectedOrder.shippingPostalCode }}</p>
              <p class="text-aurora-sand/70">{{ selectedOrder.shippingCountry }}</p>
            </div>
          </div>

          <!-- Tracking Pill in Modal if Shipped -->
          <div *ngIf="selectedOrder.trackingNumber" class="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs flex items-center justify-between">
            <div>
              <span class="text-[10px] font-mono text-amber-400 uppercase block">DHL Express Tracking</span>
              <span class="font-mono text-white text-sm font-bold">{{ selectedOrder.trackingNumber }}</span>
              <span *ngIf="selectedOrder.shippedAt" class="text-aurora-sand/60 block text-[10px]">
                Shipped on {{ selectedOrder.shippedAt | date:'medium' }}
              </span>
            </div>
            <button 
              (click)="viewTracking(selectedOrder)"
              class="px-3 py-1.5 rounded-lg bg-amber-500 text-aurora-darker font-bold text-xs hover:bg-amber-400 transition-colors">
              Inspect Live DHL Route
            </button>
          </div>

          <!-- Notes if any -->
          <div *ngIf="selectedOrder.notes" class="p-3.5 rounded-xl bg-aurora-darker border border-aurora-border/60 text-xs">
            <span class="text-[10px] font-mono text-aurora-gold uppercase block mb-1">Customer Delivery Instructions:</span>
            <p class="text-aurora-sand/90 italic">"{{ selectedOrder.notes }}"</p>
          </div>

          <!-- Review Audit Info if already reviewed -->
          <div *ngIf="selectedOrder.reviewedAt" class="p-3.5 rounded-xl bg-aurora-darker border border-aurora-gold/30 text-xs space-y-1">
            <div class="flex justify-between items-center text-[10px] font-mono text-aurora-gold uppercase">
              <span>Master Artisan Audit Record</span>
              <span>{{ selectedOrder.reviewedAt | date:'medium' }}</span>
            </div>
            <p class="text-white font-medium">Reviewed by: {{ selectedOrder.reviewedBy }}</p>
            <p *ngIf="selectedOrder.reviewNote" class="text-aurora-sand/80 italic">"{{ selectedOrder.reviewNote }}"</p>
          </div>

          <!-- Items Ordered Table -->
          <div class="space-y-2">
            <h4 class="font-serif text-xs font-semibold text-white uppercase tracking-wider">Reserved Consignment Masks</h4>
            <div class="border border-aurora-border/60 rounded-xl overflow-hidden divide-y divide-aurora-border/40">
              <div *ngFor="let item of selectedOrder.items" class="p-3 bg-aurora-darker flex justify-between items-center text-xs">
                <div>
                  <h5 class="font-serif font-semibold text-white">{{ item.productName }}</h5>
                  <p class="text-[11px] text-aurora-sand/50">{{ item.productWoodType || 'Authentic Tunisian Wood' }} • Qty: {{ item.quantity }}</p>
                </div>
                <span class="font-mono font-bold text-aurora-gold">
                  {{ selectedOrder.currency === 'USD' ? '$' : '€' }}{{ item.totalPrice.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Financial Breakdown -->
          <div class="space-y-1 text-xs border-t border-aurora-border/60 pt-3">
            <div class="flex justify-between text-aurora-sand/70">
              <span>Subtotal Amount</span>
              <span class="text-white font-mono">{{ selectedOrder.currency === 'USD' ? '$' : '€' }}{{ selectedOrder.subtotalAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-aurora-sand/70">
              <span>Insured DHL Express Shipping</span>
              <span class="text-white font-mono">{{ selectedOrder.shippingAmount === 0 ? 'FREE' : (selectedOrder.currency === 'USD' ? '$' : '€') + selectedOrder.shippingAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm font-serif font-bold text-white pt-2 border-t border-aurora-border/40">
              <span>Total Investment</span>
              <span class="text-aurora-gold font-mono">{{ selectedOrder.currency === 'USD' ? '$' : '€' }}{{ selectedOrder.totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Modal Action Footer -->
          <div class="flex items-center justify-between gap-3 pt-4 border-t border-aurora-border/60">
            <button 
              (click)="selectedOrder = null" 
              class="px-4 py-2 rounded-xl bg-aurora-darker border border-aurora-border text-aurora-sand text-xs font-semibold hover:text-white">
              Close
            </button>

            <div class="flex items-center gap-2">
              <button 
                *ngIf="selectedOrder.status === 'PENDING_CONFIRMATION'"
                (click)="openRejectModal(selectedOrder)"
                class="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider">
                Reject Order
              </button>
              <button 
                *ngIf="selectedOrder.status === 'PENDING_CONFIRMATION'"
                (click)="openConfirmModal(selectedOrder)"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider">
                Approve Order
              </button>
              <button 
                *ngIf="selectedOrder.status === 'CONFIRMED'"
                (click)="openShipModal(selectedOrder)"
                class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider">
                Dispatch DHL
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- ================= CONFIRM MODAL ================= -->
      <div *ngIf="orderToConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-aurora-card border border-aurora-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
          <div class="flex items-center gap-3 text-emerald-400">
            <div class="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-lg">✓</div>
            <div>
              <h3 class="font-serif text-base font-bold text-white">Confirm Order #{{ orderToConfirm.orderNumber }}</h3>
              <p class="text-[11px] text-aurora-sand/60">Approve fulfillment &amp; prepare packaging</p>
            </div>
          </div>

          <p class="text-xs text-aurora-sand/80 leading-relaxed">
            Confirming this order locks its status to <strong>CONFIRMED</strong>, instructs the Sidi Bou Saïd atelier to begin cedar box packaging, and dispatches a confirmation email to <strong>{{ orderToConfirm.customerEmail }}</strong>.
          </p>

          <div>
            <label class="block text-[11px] font-mono text-aurora-sand/70 uppercase mb-1">Artisan Inspection Note (Optional)</label>
            <textarea 
              [(ngModel)]="actionNote" 
              rows="3" 
              placeholder="e.g. Inspected grain &amp; applied olive oil balm. Ready for courier." 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              [disabled]="actionLoading"
              (click)="orderToConfirm = null" 
              class="px-4 py-2 rounded-xl bg-aurora-darker border border-aurora-border text-aurora-sand text-xs font-semibold hover:text-white">
              Cancel
            </button>
            <button 
              [disabled]="actionLoading"
              (click)="executeConfirm()" 
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span *ngIf="!actionLoading">Approve &amp; Prepare</span>
              <span *ngIf="actionLoading">Processing...</span>
              <div *ngIf="actionLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- ================= SHIP VIA DHL MODAL ================= -->
      <div *ngIf="orderToShip" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-aurora-card border border-aurora-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
          <div class="flex items-center gap-3 text-purple-400">
            <div class="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-lg">✈️</div>
            <div>
              <h3 class="font-serif text-base font-bold text-white">Dispatch Order #{{ orderToShip.orderNumber }}</h3>
              <p class="text-[11px] text-aurora-sand/60">Input DHL / Poste Rapide tracking dossier</p>
            </div>
          </div>

          <p class="text-xs text-aurora-sand/80 leading-relaxed">
            Entering the official tracking number transitions the order to <strong class="text-purple-400 font-mono">ON_THE_WAY</strong> and immediately triggers an automated notification email to the customer with their live DHL tracking link.
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-mono text-aurora-sand/70 uppercase mb-1">
                Official DHL / Poste Rapide Tracking Number *
              </label>
              <input 
                type="text" 
                [(ngModel)]="shipTrackingNumber" 
                placeholder="e.g. DHL-TN-84920392 or 10-digit DHL code" 
                class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500" />
            </div>

            <div>
              <label class="block text-[11px] font-mono text-aurora-sand/70 uppercase mb-1">
                Express Carrier
              </label>
              <input 
                type="text" 
                [(ngModel)]="shipCarrier" 
                placeholder="DHL Express International (Tunisia)" 
                class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              [disabled]="actionLoading"
              (click)="orderToShip = null" 
              class="px-4 py-2 rounded-xl bg-aurora-darker border border-aurora-border text-aurora-sand text-xs font-semibold hover:text-white">
              Cancel
            </button>
            <button 
              [disabled]="actionLoading || !shipTrackingNumber.trim()"
              (click)="executeShip()" 
              class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50">
              <span *ngIf="!actionLoading">Dispatch &amp; Notify</span>
              <span *ngIf="actionLoading">Dispatching...</span>
              <div *ngIf="actionLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- ================= REJECT MODAL ================= -->
      <div *ngIf="orderToReject" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-aurora-card border border-aurora-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
          <div class="flex items-center gap-3 text-rose-400">
            <div class="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-lg">✕</div>
            <div>
              <h3 class="font-serif text-base font-bold text-white">Reject Order #{{ orderToReject.orderNumber }}</h3>
              <p class="text-[11px] text-aurora-sand/60">Restore stock &amp; notify collector</p>
            </div>
          </div>

          <p class="text-xs text-aurora-sand/80 leading-relaxed">
            Rejecting this order marks it as <strong>REJECTED</strong>, automatically restores all reserved mask pieces back to catalog inventory with pessimistic lock safety, and emails the collector.
          </p>

          <div>
            <label class="block text-[11px] font-mono text-aurora-sand/70 uppercase mb-1">Reason for Rejection / Artisan Note</label>
            <textarea 
              [(ngModel)]="actionNote" 
              rows="3" 
              placeholder="e.g. Masterpiece piece reserved by private gallery or unable to verify shipping address." 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              [disabled]="actionLoading"
              (click)="orderToReject = null" 
              class="px-4 py-2 rounded-xl bg-aurora-darker border border-aurora-border text-aurora-sand text-xs font-semibold hover:text-white">
              Cancel
            </button>
            <button 
              [disabled]="actionLoading"
              (click)="executeReject()" 
              class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span *ngIf="!actionLoading">Reject &amp; Restore Stock</span>
              <span *ngIf="actionLoading">Restoring...</span>
              <div *ngIf="actionLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- ================= LIVE DHL TRACKING INSPECTION MODAL ================= -->
      <div *ngIf="inspectingTracking" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-aurora-card border border-aurora-border rounded-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div class="flex items-start justify-between border-b border-aurora-border/60 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg font-bold">
                DHL
              </div>
              <div>
                <span class="text-[10px] font-mono uppercase tracking-widest text-aurora-gold">Live Courier Milestones</span>
                <h3 class="font-serif text-lg font-bold text-white">Tracking #{{ inspectingTracking.trackingNumber }}</h3>
              </div>
            </div>
            <button (click)="inspectingTracking = null" class="text-aurora-sand/60 hover:text-white text-lg">✕</button>
          </div>

          <!-- Origin & Destination Banner -->
          <div class="grid grid-cols-2 gap-4 text-xs bg-aurora-darker p-4 rounded-xl border border-aurora-border/60">
            <div>
              <span class="text-[10px] font-mono text-aurora-sand/50 uppercase block">Origin Atelier</span>
              <p class="text-white font-medium">{{ inspectingTracking.origin }}</p>
            </div>
            <div>
              <span class="text-[10px] font-mono text-aurora-sand/50 uppercase block">Destination</span>
              <p class="text-white font-medium">{{ inspectingTracking.destination }}</p>
            </div>
          </div>

          <!-- Milestones Timeline -->
          <div class="space-y-4 max-h-72 overflow-y-auto pr-2">
            <div *ngFor="let cp of inspectingTracking.checkpoints; let last = last" class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  [ngClass]="cp.completed ? 'bg-amber-400 border-amber-400' : 'bg-aurora-darker border-aurora-border'">
                  <div *ngIf="cp.completed" class="w-1.5 h-1.5 rounded-full bg-aurora-darker"></div>
                </div>
                <div *ngIf="!last" class="w-0.5 flex-1 bg-aurora-border/80 my-1"></div>
              </div>
              <div class="pb-4 flex-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white">{{ cp.status }}</span>
                  <span class="text-[10px] font-mono text-aurora-sand/50">{{ cp.timestamp | date:'medium' }}</span>
                </div>
                <div class="text-[11px] text-aurora-gold font-mono">{{ cp.location }}</div>
                <p class="text-xs text-aurora-sand/70 mt-1 leading-relaxed">{{ cp.description }}</p>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-aurora-border/60 flex justify-end">
            <button 
              (click)="inspectingTracking = null" 
              class="px-5 py-2 rounded-xl bg-aurora-darker border border-aurora-border text-aurora-sand text-xs font-semibold hover:text-white">
              Done
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly orderService = inject(OrderService);

  allOrders: OrderResponse[] = [];
  activeFilter: OrderStatus | null = null;
  searchQuery = '';
  loading = false;

  selectedOrder: OrderResponse | null = null;
  orderToConfirm: OrderResponse | null = null;
  orderToReject: OrderResponse | null = null;
  orderToShip: OrderResponse | null = null;
  inspectingTracking: TrackingResponse | null = null;

  shipTrackingNumber = '';
  shipCarrier = 'DHL Express International';
  actionNote = '';
  actionLoading = false;

  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getOrders().subscribe({
      next: (res) => {
        this.allOrders = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showFeedback('Failed to load orders: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  get filteredOrders(): OrderResponse[] {
    let result = this.allOrders;

    if (this.activeFilter) {
      result = result.filter(o => o.status === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
        (o.shippingCity && o.shippingCity.toLowerCase().includes(q)) ||
        (o.shippingCountry && o.shippingCountry.toLowerCase().includes(q))
      );
    }

    return result;
  }

  countByStatus(status: OrderStatus): number {
    return this.allOrders.filter(o => o.status === status).length;
  }

  selectFilter(filter: OrderStatus | null): void {
    this.activeFilter = filter;
  }

  openDetailModal(order: OrderResponse): void {
    this.selectedOrder = order;
  }

  openConfirmModal(order: OrderResponse): void {
    this.selectedOrder = null;
    this.orderToConfirm = order;
    this.actionNote = '';
  }

  openRejectModal(order: OrderResponse): void {
    this.selectedOrder = null;
    this.orderToReject = order;
    this.actionNote = '';
  }

  openShipModal(order: OrderResponse): void {
    this.selectedOrder = null;
    this.orderToShip = order;
    // Auto-generate realistic DHL tracking format suggestion
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    this.shipTrackingNumber = `DHL-TN-${randomSuffix}`;
    this.shipCarrier = 'DHL Express International';
  }

  executeConfirm(): void {
    if (!this.orderToConfirm) return;
    this.actionLoading = true;
    const orderId = this.orderToConfirm.id;
    const orderNumber = this.orderToConfirm.orderNumber;

    this.adminService.confirmOrder(orderId, this.actionNote).subscribe({
      next: () => {
        this.actionLoading = false;
        this.orderToConfirm = null;
        this.showFeedback(`Order #${orderNumber} confirmed. Atelier preparation underway.`, 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.actionLoading = false;
        this.showFeedback(`Error confirming order: ${err.error?.message || err.message}`, 'error');
      }
    });
  }

  executeShip(): void {
    if (!this.orderToShip || !this.shipTrackingNumber.trim()) return;
    this.actionLoading = true;
    const orderId = this.orderToShip.id;
    const orderNumber = this.orderToShip.orderNumber;

    this.adminService.shipOrder(orderId, {
      trackingNumber: this.shipTrackingNumber.trim(),
      carrier: this.shipCarrier.trim()
    }).subscribe({
      next: () => {
        this.actionLoading = false;
        this.orderToShip = null;
        this.showFeedback(`Order #${orderNumber} marked ON_THE_WAY with DHL tracking ${this.shipTrackingNumber}. Dispatch email sent!`, 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.actionLoading = false;
        this.showFeedback(`Error shipping order: ${err.error?.message || err.message}`, 'error');
      }
    });
  }

  deliverOrder(order: OrderResponse): void {
    if (!confirm(`Mark Order #${order.orderNumber} as DELIVERED?`)) return;

    this.adminService.deliverOrder(order.id).subscribe({
      next: () => {
        this.showFeedback(`Order #${order.orderNumber} finalized as DELIVERED.`, 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.showFeedback(`Error delivering order: ${err.error?.message || err.message}`, 'error');
      }
    });
  }

  executeReject(): void {
    if (!this.orderToReject) return;
    this.actionLoading = true;
    const orderId = this.orderToReject.id;
    const orderNumber = this.orderToReject.orderNumber;

    this.adminService.rejectOrder(orderId, this.actionNote).subscribe({
      next: () => {
        this.actionLoading = false;
        this.orderToReject = null;
        this.showFeedback(`Order #${orderNumber} rejected. Inventory restored to catalog.`, 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.actionLoading = false;
        this.showFeedback(`Error rejecting order: ${err.error?.message || err.message}`, 'error');
      }
    });
  }

  viewTracking(order: OrderResponse): void {
    this.orderService.getOrderTracking(order.id).subscribe({
      next: (res) => {
        this.inspectingTracking = res.data;
      },
      error: (err) => {
        this.showFeedback(`Failed to load DHL tracking: ${err.error?.message || err.message}`, 'error');
      }
    });
  }

  private showFeedback(msg: string, type: 'success' | 'error'): void {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
      }
    }, 6000);
  }
}
