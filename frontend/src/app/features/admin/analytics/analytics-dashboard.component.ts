import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AnalyticsSummary, RevenueTrendPoint } from '../../../core/models/admin.models';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      
      <!-- Top Title & Range Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-aurora-border/60">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[11px] font-mono uppercase tracking-widest text-aurora-gold">Executive Intelligence &amp; Sales Matrix</span>
          </div>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Atelier Sales &amp; Revenue Analytics
          </h1>
          <p class="text-xs text-aurora-sand/60 mt-1">Real-time international financial metrics, volume trends, traffic sessions, and wooden mask leaderboard.</p>
        </div>

        <!-- Range Buttons -->
        <div class="flex items-center bg-aurora-card p-1 rounded-xl border border-aurora-border self-start sm:self-auto shadow-inner">
          <button 
            *ngFor="let r of ranges" 
            (click)="selectRange(r.value)"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            [class.bg-aurora-gold]="selectedRange === r.value"
            [class.text-aurora-darker]="selectedRange === r.value"
            [class.shadow-md]="selectedRange === r.value"
            [class.text-aurora-sand]="selectedRange !== r.value"
            [class.opacity-70]="selectedRange !== r.value"
            [class.hover:text-white]="selectedRange !== r.value">
            {{ r.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="py-28 text-center bg-aurora-card/40 rounded-3xl border border-aurora-border/40 backdrop-blur-sm">
        <div class="w-12 h-12 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm font-serif text-white">Aggregating Sales Records &amp; Calculating Matrix</p>
        <p class="text-xs text-aurora-sand/50 mt-1">Reading PostgreSQL transactional tables and visitor event hooks...</p>
      </div>

      <div *ngIf="!loading && summary" class="space-y-8">
        
        <!-- Key Financial & Operational Metrics (5 Cards Grid) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          <!-- Card 1: Total Revenue -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-aurora-card via-aurora-card to-amber-950/20 border border-aurora-gold/40 shadow-xl relative overflow-hidden group">
            <div class="flex items-center justify-between text-xs text-aurora-gold mb-2 font-medium">
              <span>Total Revenue</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-aurora-gold/20 font-mono font-semibold">SETTLED</span>
            </div>
            <div class="font-serif text-3xl font-bold text-white tracking-tight">
              €{{ (summary.totalRevenue || 0).toFixed(2) }}
            </div>
            <div class="text-[11px] text-aurora-sand/60 mt-2 flex items-center justify-between">
              <span>Gross: €{{ (summary.grossSales || 0).toFixed(2) }}</span>
              <span class="text-emerald-400 font-semibold" *ngIf="hasOrders">Active</span>
              <span class="text-aurora-sand/40" *ngIf="!hasOrders">Awaiting Sales</span>
            </div>
          </div>

          <!-- Card 2: Average Order Value (AOV) -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl relative overflow-hidden group">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Average Order Value</span>
              <span class="text-aurora-gold">🎯</span>
            </div>
            <div class="font-serif text-3xl font-bold text-aurora-gold tracking-tight">
              €{{ (summary.averageOrderValue || 0).toFixed(2) }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2">
              <span *ngIf="hasOrders">Across {{ summary.totalOrders }} completed orders</span>
              <span *ngIf="!hasOrders" class="italic text-aurora-sand/40">No transactions recorded</span>
            </div>
          </div>

          <!-- Card 3: Completed Orders -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl relative overflow-hidden group">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Order Volume</span>
              <span class="text-blue-400">📦</span>
            </div>
            <div class="font-serif text-3xl font-bold text-white tracking-tight">
              {{ summary.totalOrders || 0 }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2">
              <span *ngIf="hasOrders">From <strong class="text-white">{{ summary.totalCustomers }}</strong> collectors</span>
              <span *ngIf="!hasOrders" class="italic text-aurora-sand/40">Zero orders placed</span>
            </div>
          </div>

          <!-- Card 4: Store Traffic & Visits -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl relative overflow-hidden group">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Store Visits</span>
              <span class="text-indigo-400">👁️</span>
            </div>
            <div class="font-serif text-3xl font-bold text-white tracking-tight">
              {{ summary.totalVisits || 0 }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2 flex items-center justify-between">
              <span>{{ summary.uniqueVisitors || 0 }} unique</span>
              <span class="font-mono text-emerald-400 font-semibold" *ngIf="summary.conversionRate > 0">
                {{ summary.conversionRate }}% conv.
              </span>
              <span class="text-aurora-sand/40" *ngIf="summary.conversionRate === 0">0% conv.</span>
            </div>
          </div>

          <!-- Card 5: Inventory Stock Status -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl relative overflow-hidden group">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Low Inventory Alert</span>
              <span class="text-amber-400">⚠️</span>
            </div>
            <div class="font-serif text-3xl font-bold" [class.text-amber-400]="summary.lowStockCount > 0" [class.text-white]="summary.lowStockCount === 0">
              {{ summary.lowStockCount || 0 }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2">
              <span>Carvings with ≤ 5 units in stock</span>
            </div>
          </div>

        </div>

        <!-- Most Sold Article Spotlight (Hero Showcase or Empty State) -->
        <div class="p-6 rounded-3xl bg-gradient-to-r from-aurora-card via-[#161a25] to-aurora-card border border-aurora-gold/30 shadow-2xl relative overflow-hidden">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-aurora-gold/5 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Active Spotlight: When Most Sold Product Exists -->
          <div *ngIf="summary.mostSoldProduct" class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div class="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-aurora-gold/50 shadow-lg bg-aurora-dark shrink-0">
                <img 
                  [src]="summary.mostSoldProduct.primaryImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80'" 
                  [alt]="summary.mostSoldProduct.productName"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-aurora-gold text-aurora-darker font-mono font-bold text-[9px]">
                  #1 BESTSELLER
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2 justify-center sm:justify-start">
                  <span class="px-2.5 py-0.5 rounded-full bg-aurora-gold/20 text-aurora-gold font-mono text-[10px] font-bold uppercase tracking-wider">
                    Premier High-Demand Masterpiece
                  </span>
                  <span class="text-xs text-aurora-sand/50 font-serif italic">{{ summary.mostSoldProduct.woodType }}</span>
                </div>
                <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                  {{ summary.mostSoldProduct.productName }}
                </h2>
                <p class="text-xs text-aurora-sand/60 mt-0.5">
                  Generated <strong class="text-aurora-gold font-mono">€{{ (summary.mostSoldProduct.totalRevenue || 0).toFixed(2) }}</strong> across <strong class="text-white font-mono">{{ summary.mostSoldProduct.unitsSold }}</strong> consignments in selected timeframe.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4 bg-aurora-darker/80 px-5 py-3 rounded-2xl border border-aurora-border/60 shrink-0">
              <div class="text-right">
                <div class="text-[10px] text-aurora-sand/50 uppercase tracking-wider font-mono">Current Stock</div>
                <div class="font-serif text-lg font-bold text-white flex items-center justify-end gap-1.5">
                  <span>{{ summary.mostSoldProduct.stockRemaining }} units</span>
                  <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="summary.mostSoldProduct.stockRemaining > 3" [class.bg-amber-400]="summary.mostSoldProduct.stockRemaining <= 3"></span>
                </div>
              </div>
              <a 
                routerLink="/admin/products"
                class="px-4 py-2 rounded-xl bg-aurora-gold/15 hover:bg-aurora-gold hover:text-aurora-darker text-aurora-gold text-xs font-semibold border border-aurora-gold/40 transition-all duration-200">
                Manage Stock
              </a>
            </div>
          </div>

          <!-- Empty State: When Zero Sales Exist -->
          <div *ngIf="!summary.mostSoldProduct" class="flex flex-col md:flex-row items-center gap-6 py-2">
            <div class="w-20 h-20 rounded-2xl bg-aurora-darker border border-aurora-gold/30 flex items-center justify-center text-3xl shadow-inner shrink-0 text-aurora-gold">
              <svg class="w-10 h-10 text-aurora-gold/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/>
                <path d="M12 22V12"/>
                <path d="M20 7l-8 5-8-5"/>
              </svg>
            </div>
            <div class="flex-grow text-center md:text-left">
              <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-aurora-gold/10 text-aurora-gold font-mono text-[10px] font-semibold uppercase tracking-wider mb-1">
                <span>✦ Awaiting First Bestseller</span>
              </div>
              <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
                Artisanal Bestseller Spotlight
              </h3>
              <p class="text-xs text-aurora-sand/70 max-w-2xl mt-1 leading-relaxed">
                No sales recorded yet. Your premier wooden mask and top-grossing carving will be featured here with live velocity tracking once customer orders commence.
              </p>
            </div>
            <a 
              routerLink="/admin/products"
              class="px-4 py-2.5 rounded-xl bg-aurora-gold text-aurora-darker text-xs font-bold hover:bg-white transition-all shadow-md shrink-0">
              Browse Mask Catalog
            </a>
          </div>

        </div>

        <!-- Visualizations Grid (Revenue Trend Line Chart & Category Split) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Revenue Trend Chart (8 cols) -->
          <div class="lg:col-span-8 p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4 shadow-xl relative">
            <div class="flex items-center justify-between pb-3 border-b border-aurora-border/40">
              <div>
                <h3 class="font-serif text-base font-bold text-white">Revenue Trajectory</h3>
                <p class="text-[11px] text-aurora-sand/50">Settlement volume progression over {{ selectedRange.toLowerCase() }} timeline</p>
              </div>
              <div class="flex items-center gap-4 text-xs font-mono">
                <span class="flex items-center gap-1.5 text-aurora-gold">
                  <span class="w-3 h-0.5 bg-aurora-gold inline-block"></span> Revenue (€)
                </span>
              </div>
            </div>

            <!-- Chart with Data -->
            <div *ngIf="hasRevenueData" class="h-64 w-full relative pt-4">
              <svg viewBox="0 0 700 200" class="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#cba358" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#cba358" stop-opacity="0.0" />
                  </linearGradient>
                </defs>

                <!-- Gridlines -->
                <line x1="0" y1="50" x2="700" y2="50" stroke="#2a2f3e" stroke-dasharray="4,4" stroke-width="0.7" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#2a2f3e" stroke-dasharray="4,4" stroke-width="0.7" />
                <line x1="0" y1="150" x2="700" y2="150" stroke="#2a2f3e" stroke-dasharray="4,4" stroke-width="0.7" />

                <!-- Area Fill -->
                <path [attr.d]="svgAreaPath" fill="url(#revenueGradient)" />

                <!-- Stroke Line -->
                <path [attr.d]="svgLinePath" fill="none" stroke="#cba358" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

                <!-- Data Points -->
                <g *ngFor="let pt of chartPoints">
                  <circle 
                    [attr.cx]="pt.x" 
                    [attr.cy]="pt.y" 
                    r="4" 
                    fill="#0e1015" 
                    stroke="#cba358" 
                    stroke-width="2" 
                    class="hover:scale-150 transition-transform cursor-pointer" />
                </g>
              </svg>

              <!-- X-Axis Labels -->
              <div class="flex justify-between text-[10px] text-aurora-sand/50 pt-2 font-mono">
                <span *ngFor="let point of summary.revenueTrend">{{ point.label }}</span>
              </div>
            </div>

            <!-- Empty State for Revenue Chart: Zero Sales in Timeframe -->
            <div *ngIf="!hasRevenueData" class="h-64 flex flex-col items-center justify-center text-center p-6 bg-aurora-darker/50 rounded-xl border border-dashed border-aurora-border/80">
              <div class="w-14 h-14 rounded-full bg-aurora-gold/10 border border-aurora-gold/20 flex items-center justify-center mb-3">
                <svg class="w-7 h-7 text-aurora-gold/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18M7 16l4-4 4 4 5-6" />
                </svg>
              </div>
              <h4 class="font-serif text-sm font-semibold text-white">No Revenue Activity Recorded</h4>
              <p class="text-xs text-aurora-sand/60 max-w-md mt-1 leading-relaxed">
                There are no completed sales recorded for this timeframe. The financial trajectory curve will calibrate automatically as transactions settle.
              </p>
              <div class="mt-3 inline-flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Ledger listening for customer checkout events</span>
              </div>
            </div>

          </div>

          <!-- Category Sales Breakdown (4 cols) -->
          <div class="lg:col-span-4 p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <h3 class="font-serif text-base font-bold text-white pb-3 border-b border-aurora-border/40">
                Category Distribution
              </h3>
              <p class="text-[11px] text-aurora-sand/50 mt-1 mb-4">Volume split across artisanal carving lineages</p>

              <!-- Progress Bars & Percentage Badges -->
              <div *ngIf="hasOrders" class="space-y-4">
                <div *ngFor="let cat of summary.categoryBreakdown" class="space-y-1.5">
                  <div class="flex justify-between text-xs">
                    <span class="font-medium text-white truncate">{{ cat.categoryName }}</span>
                    <span class="font-mono text-aurora-gold font-semibold">{{ cat.percentage }}%</span>
                  </div>
                  <div class="w-full bg-aurora-darker rounded-full h-2 overflow-hidden border border-aurora-border/40">
                    <div 
                      class="h-full bg-gradient-to-r from-aurora-terracotta to-aurora-gold rounded-full transition-all duration-700" 
                      [style.width.%]="cat.percentage">
                    </div>
                  </div>
                  <div class="flex justify-between text-[10px] text-aurora-sand/40">
                    <span>{{ cat.unitsSold }} units</span>
                    <span>€{{ (cat.totalSales || 0).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Empty State for Categories: When Zero Orders Placed -->
              <div *ngIf="!hasOrders" class="py-8 px-4 text-center bg-aurora-darker/40 rounded-xl border border-dashed border-aurora-border/80">
                <div class="text-2xl mb-2 text-aurora-gold">🏺</div>
                <h5 class="font-serif text-xs font-semibold text-white">Awaiting Lineage Orders</h5>
                <p class="text-[11px] text-aurora-sand/60 mt-1">
                  Category distribution splits will dynamically populate as soon as customers purchase items across olive wood, cedar, and brass collections.
                </p>
              </div>
            </div>

            <!-- Wise Payout Rail Note -->
            <div class="p-3.5 rounded-xl bg-aurora-darker border border-aurora-border/60 text-[11px] text-aurora-sand/60 flex items-center gap-2.5 mt-4">
              <span class="text-aurora-gold text-base">🏛️</span>
              <span>All settled proceeds route automatically to Wise EUR artisanal IBAN.</span>
            </div>
          </div>

        </div>

        <!-- Most Sold Article Leaderboard -->
        <div class="p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-aurora-border/40">
            <div>
              <h3 class="font-serif text-base font-bold text-white">Most Sold Masterpieces (Leaderboard)</h3>
              <p class="text-[11px] text-aurora-sand/50">Top requested mask carvings ranked by total international consignment volume</p>
            </div>
            <span class="text-xs text-aurora-gold font-mono">{{ summary.topSellingProducts.length || 0 }} Recorded</span>
          </div>

          <!-- Active Leaderboard Table -->
          <div *ngIf="hasTopProducts" class="overflow-x-auto">
            <table class="w-full text-left text-xs text-aurora-sand/80">
              <thead class="text-[10px] uppercase tracking-wider text-aurora-sand/50 bg-aurora-darker border-y border-aurora-border">
                <tr>
                  <th class="py-3 px-4">Rank</th>
                  <th class="py-3 px-4">Mask Masterpiece</th>
                  <th class="py-3 px-4">Wood Type</th>
                  <th class="py-3 px-4 text-center">Units Sold</th>
                  <th class="py-3 px-4 text-right">Revenue Generated</th>
                  <th class="py-3 px-4 text-center">Atelier Stock</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-aurora-border/40">
                <tr *ngFor="let item of summary.topSellingProducts; let i = index" class="hover:bg-aurora-darker/60 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-aurora-gold">
                    <span *ngIf="i === 0" class="text-sm mr-1">👑</span>
                    #{{ i + 1 }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <img 
                        [src]="item.primaryImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80'" 
                        [alt]="item.productName"
                        class="w-9 h-9 rounded-lg object-cover border border-aurora-border shrink-0 bg-aurora-darker" />
                      <span class="font-serif font-semibold text-white">{{ item.productName }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-aurora-sand/60">{{ item.woodType }}</td>
                  <td class="py-3.5 px-4 text-center font-mono font-bold text-white">{{ item.unitsSold }}</td>
                  <td class="py-3.5 px-4 text-right font-mono font-bold text-aurora-gold">€{{ (item.totalRevenue || 0).toFixed(2) }}</td>
                  <td class="py-3.5 px-4 text-center">
                    <span 
                      class="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold"
                      [class.bg-emerald-950]="item.stockRemaining > 3"
                      [class.text-emerald-400]="item.stockRemaining > 3"
                      [class.bg-amber-950]="item.stockRemaining <= 3"
                      [class.text-amber-400]="item.stockRemaining <= 3">
                      {{ item.stockRemaining }} left
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State for Leaderboard: When Zero Top Products Exist -->
          <div *ngIf="!hasTopProducts" class="py-16 px-6 text-center bg-aurora-darker/40 rounded-2xl border border-dashed border-aurora-border/80 flex flex-col items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-aurora-gold/10 border border-aurora-gold/30 flex items-center justify-center mb-4 text-aurora-gold shadow-lg">
              <svg class="w-8 h-8 text-aurora-gold/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h4 class="font-serif text-base font-semibold text-white">No Sales Recorded Yet</h4>
            <p class="text-xs text-aurora-sand/65 max-w-md mt-1.5 leading-relaxed">
              Your revenue and top-selling masks will appear here once customers start purchasing. Every handcrafted mask order will be ranked by volume and gross proceeds.
            </p>
            <div class="mt-5 flex items-center gap-3">
              <a 
                routerLink="/admin/products"
                class="px-4 py-2 rounded-xl bg-aurora-gold text-aurora-darker text-xs font-semibold hover:bg-white transition-all shadow-md">
                Manage Inventory
              </a>
              <button 
                (click)="selectRange('YEARLY')"
                class="px-4 py-2 rounded-xl bg-aurora-card hover:bg-aurora-cardHover text-aurora-sand text-xs font-semibold border border-aurora-border transition-all">
                Check All-Time Records
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class AnalyticsDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  summary: AnalyticsSummary | null = null;
  loading = true;
  selectedRange: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' = 'MONTHLY';

  hasOrders = false;
  hasRevenueData = false;
  hasTopProducts = false;

  ranges: { label: string; value: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' }[] = [
    { label: 'Today', value: 'DAILY' },
    { label: 'Last 7 Days', value: 'WEEKLY' },
    { label: 'Last 30 Days', value: 'MONTHLY' },
    { label: 'This Year', value: 'YEARLY' }
  ];

  svgLinePath = '';
  svgAreaPath = '';
  chartPoints: { x: number; y: number }[] = [];

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  selectRange(range: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'): void {
    this.selectedRange = range;
    this.fetchAnalytics();
  }

  private fetchAnalytics(): void {
    this.loading = true;
    this.adminService.getAnalytics(this.selectedRange).subscribe({
      next: (res) => {
        this.summary = res.data;
        this.hasOrders = (this.summary?.totalOrders ?? 0) > 0;
        this.hasTopProducts = (this.summary?.topSellingProducts?.length ?? 0) > 0;
        this.hasRevenueData = (this.summary?.revenueTrend || []).some(p => p.revenue > 0);
        this.computeChartPaths(this.summary.revenueTrend);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private computeChartPaths(trend: RevenueTrendPoint[]): void {
    if (!trend || trend.length === 0 || !this.hasRevenueData) {
      this.svgLinePath = '';
      this.svgAreaPath = '';
      this.chartPoints = [];
      return;
    }

    const maxRev = Math.max(...trend.map(p => p.revenue), 100);
    const width = 700;
    const height = 180;
    const step = trend.length > 1 ? width / (trend.length - 1) : width;

    this.chartPoints = trend.map((p, idx) => ({
      x: idx * step,
      y: height - (p.revenue / maxRev) * 150 - 15
    }));

    if (this.chartPoints.length === 1) {
      this.svgLinePath = `M 0,${this.chartPoints[0].y} L 700,${this.chartPoints[0].y}`;
      this.svgAreaPath = `M 0,${this.chartPoints[0].y} L 700,${this.chartPoints[0].y} L 700,${height} L 0,${height} Z`;
      return;
    }

    // Build SVG smooth path
    let d = `M ${this.chartPoints[0].x},${this.chartPoints[0].y}`;
    for (let i = 1; i < this.chartPoints.length; i++) {
      const prev = this.chartPoints[i - 1];
      const cur = this.chartPoints[i];
      const midX = (prev.x + cur.x) / 2;
      d += ` C ${midX},${prev.y} ${midX},${cur.y} ${cur.x},${cur.y}`;
    }

    this.svgLinePath = d;
    this.svgAreaPath = `${d} L ${this.chartPoints[this.chartPoints.length - 1].x},${height} L ${this.chartPoints[0].x},${height} Z`;
  }
}
