import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AnalyticsSummary, RevenueTrendPoint } from '../../../core/models/admin.models';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      
      <!-- Top Title & Range Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-aurora-border/60">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[11px] font-mono uppercase tracking-widest text-aurora-gold">Executive Intelligence</span>
          </div>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Atelier Sales &amp; Revenue Analytics
          </h1>
          <p class="text-xs text-aurora-sand/60 mt-1">Real-time international financial metrics, volume trends, and inventory performance.</p>
        </div>

        <!-- Range Buttons -->
        <div class="flex items-center bg-aurora-card p-1 rounded-xl border border-aurora-border self-start sm:self-auto">
          <button 
            *ngFor="let r of ranges" 
            (click)="selectRange(r.value)"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [class.bg-aurora-gold]="selectedRange === r.value"
            [class.text-aurora-darker]="selectedRange === r.value"
            [class.text-aurora-sand]="selectedRange !== r.value"
            [class.opacity-70]="selectedRange !== r.value"
            [class.hover:text-white]="selectedRange !== r.value">
            {{ r.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="py-24 text-center">
        <div class="w-10 h-10 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-xs text-aurora-sand/60">Aggregating PostgreSQL sales records and calculating metrics...</p>
      </div>

      <div *ngIf="!loading && summary" class="space-y-8">
        
        <!-- Key Financial Metrics Cards (4 columns) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- Card 1: Total Revenue -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-aurora-card via-aurora-card to-amber-950/20 border border-aurora-gold/40 shadow-xl relative overflow-hidden">
            <div class="flex items-center justify-between text-xs text-aurora-gold mb-2 font-medium">
              <span>Total Revenue</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-aurora-gold/20 font-mono">PAID</span>
            </div>
            <div class="font-serif text-3xl font-bold text-white tracking-tight">
              €{{ summary.totalRevenue.toFixed(2) }}
            </div>
            <div class="text-[11px] text-aurora-sand/60 mt-2 flex items-center justify-between">
              <span>Gross Sales: €{{ summary.grossSales.toFixed(2) }}</span>
              <span class="text-emerald-400 font-semibold">100% Settled</span>
            </div>
          </div>

          <!-- Card 2: Average Order Value (AOV) -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Average Order Value (AOV)</span>
              <span>🎯</span>
            </div>
            <div class="font-serif text-3xl font-bold text-aurora-gold tracking-tight">
              €{{ summary.averageOrderValue.toFixed(2) }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2">
              Across {{ summary.totalOrders }} completed shipments
            </div>
          </div>

          <!-- Card 3: Total Orders & Customers -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Order Volume</span>
              <span>📦</span>
            </div>
            <div class="font-serif text-3xl font-bold text-white tracking-tight">
              {{ summary.totalOrders }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2">
              From <strong class="text-white">{{ summary.totalCustomers }}</strong> unique collectors
            </div>
          </div>

          <!-- Card 4: Low Stock Inventory Alert -->
          <div class="p-5 rounded-2xl bg-aurora-card border border-aurora-border shadow-xl">
            <div class="flex items-center justify-between text-xs text-aurora-sand/60 mb-2 font-medium">
              <span>Low Inventory Alert</span>
              <span class="text-amber-400">⚠️</span>
            </div>
            <div class="font-serif text-3xl font-bold" [class.text-amber-400]="summary.lowStockCount > 0" [class.text-white]="summary.lowStockCount === 0">
              {{ summary.lowStockCount }}
            </div>
            <div class="text-[11px] text-aurora-sand/50 mt-2">
              Masks with ≤ 5 units remaining in atelier
            </div>
          </div>

        </div>

        <!-- Visualizations Grid (Revenue Trend Line Chart & Category Pie/Distribution) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Revenue Trend Chart (8 cols) -->
          <div class="lg:col-span-8 p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4 shadow-xl">
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

            <!-- SVG Line Chart with Gradient and Smooth Curve -->
            <div class="h-64 w-full relative pt-4">
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
          </div>

          <!-- Category Sales Breakdown (4 cols) -->
          <div class="lg:col-span-4 p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <h3 class="font-serif text-base font-bold text-white pb-3 border-b border-aurora-border/40">
                Category Distribution
              </h3>
              <p class="text-[11px] text-aurora-sand/50 mt-1 mb-4">Volume split across artisanal carving lineages</p>

              <!-- Progress Bars & Percentage Badges -->
              <div class="space-y-4">
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
                    <span>€{{ cat.totalSales.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wise Payout Rail Note -->
            <div class="p-3.5 rounded-xl bg-aurora-darker border border-aurora-border/60 text-[11px] text-aurora-sand/60 flex items-center gap-2.5">
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
            <span class="text-xs text-aurora-gold font-mono">{{ summary.topSellingProducts.length }} Recorded</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-aurora-sand/80">
              <thead class="text-[10px] uppercase tracking-wider text-aurora-sand/50 bg-aurora-darker border-y border-aurora-border">
                <tr>
                  <th class="py-3 px-4">Rank</th>
                  <th class="py-3 px-4">Mask Title</th>
                  <th class="py-3 px-4">Wood Type</th>
                  <th class="py-3 px-4 text-center">Units Sold</th>
                  <th class="py-3 px-4 text-right">Revenue Generated</th>
                  <th class="py-3 px-4 text-center">Atelier Stock</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-aurora-border/40">
                <tr *ngFor="let item of summary.topSellingProducts; let i = index" class="hover:bg-aurora-darker/60 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-aurora-gold">#{{ i + 1 }}</td>
                  <td class="py-3.5 px-4 font-serif font-semibold text-white">{{ item.productName }}</td>
                  <td class="py-3.5 px-4 text-aurora-sand/60">{{ item.woodType }}</td>
                  <td class="py-3.5 px-4 text-center font-mono font-bold text-white">{{ item.unitsSold }}</td>
                  <td class="py-3.5 px-4 text-right font-mono font-bold text-aurora-gold">€{{ item.totalRevenue.toFixed(2) }}</td>
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
        this.computeChartPaths(this.summary.revenueTrend);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private computeChartPaths(trend: RevenueTrendPoint[]): void {
    if (!trend || trend.length === 0) {
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
