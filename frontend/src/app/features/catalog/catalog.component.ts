import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { Category, ProductFilter, ProductSummary } from '../../core/models/product.models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ImageUrlPipe],
  template: `
    <div class="bg-aurora-dark min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Breadcrumbs -->
        <div class="mb-10 text-center sm:text-left">
          <div class="text-xs text-aurora-sand/60 mb-2">
            <a routerLink="/" class="hover:text-aurora-gold">Atelier</a> / <span class="text-aurora-gold">Catalog</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">Artisanal Mask Gallery</h1>
          <p class="text-xs sm:text-sm text-aurora-sand/70 mt-1 max-w-2xl">
            Each mask is individually carved from ancient Tunisian olive wood and native timbers. Explore by sculptural lineage or aesthetic dimension.
          </p>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-aurora-card border border-aurora-border rounded-2xl p-4 sm:p-6 mb-8 space-y-4">
          
          <!-- Category Filter Buttons / Chips -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button 
              (click)="selectCategory('')" 
              class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              [class.bg-aurora-gold]="!selectedCategorySlug"
              [class.text-aurora-darker]="!selectedCategorySlug"
              [class.bg-aurora-darker]="selectedCategorySlug"
              [class.text-aurora-sand]="selectedCategorySlug"
              [class.border]="selectedCategorySlug"
              [class.border-aurora-border]="selectedCategorySlug">
              All Masks
            </button>

            <button 
              *ngFor="let cat of categories" 
              (click)="selectCategory(cat.slug)" 
              class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              [class.bg-aurora-gold]="selectedCategorySlug === cat.slug"
              [class.text-aurora-darker]="selectedCategorySlug === cat.slug"
              [class.bg-aurora-darker]="selectedCategorySlug !== cat.slug"
              [class.text-aurora-sand]="selectedCategorySlug !== cat.slug"
              [class.border]="selectedCategorySlug !== cat.slug"
              [class.border-aurora-border]="selectedCategorySlug !== cat.slug">
              {{ cat.name }}
            </button>
          </div>

          <!-- Search & Sort Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-aurora-border/40">
            <!-- Search Bar -->
            <div class="relative sm:col-span-2">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="applyFilters()" 
                placeholder="Search by mask name, olive wood, Saharan cedar..." 
                class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-aurora-sand/40 focus:outline-none focus:border-aurora-gold" />
              <button 
                (click)="applyFilters()" 
                class="absolute right-3 top-2.5 text-aurora-sand/60 hover:text-aurora-gold">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <!-- Sort Selector -->
            <div>
              <select 
                [(ngModel)]="sortBy" 
                (change)="applyFilters()" 
                class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-aurora-sand focus:outline-none focus:border-aurora-gold">
                <option value="createdAt-desc">Newest Additions</option>
                <option value="priceEur-asc">Price: Low to High</option>
                <option value="priceEur-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

        </div>

        <!-- Products Grid -->
        <div *ngIf="loading" class="py-24 text-center">
          <div class="w-10 h-10 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-xs text-aurora-sand/60">Retrieving artisanal carvings from atelier...</p>
        </div>

        <div *ngIf="!loading && products.length === 0" class="py-24 text-center bg-aurora-card rounded-2xl border border-aurora-border p-8">
          <p class="font-serif text-lg text-white">No masks found matching criteria</p>
          <p class="text-xs text-aurora-sand/60 mt-1">Try clearing filters or searching for alternative wood types.</p>
          <button (click)="resetFilters()" class="mt-4 px-4 py-2 bg-aurora-gold text-aurora-darker font-semibold text-xs rounded-lg">
            Reset Filters
          </button>
        </div>

        <div *ngIf="!loading && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let product of products" 
            class="group rounded-2xl overflow-hidden bg-aurora-card border border-aurora-border hover:border-aurora-gold/50 transition-all duration-300 flex flex-col justify-between">
            
            <div>
              <!-- Image Container -->
              <div class="relative h-80 overflow-hidden bg-aurora-darker cursor-pointer" [routerLink]="['/product', product.slug]">
                <img 
                  [src]="product.primaryImageUrl | imageUrl" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <!-- Category Badge -->
                <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-aurora-darker/80 text-aurora-gold border border-aurora-border backdrop-blur-md">
                  {{ product.categoryName }}
                </span>

                <!-- Discount Tag -->
                <span *ngIf="product.discountPercentage > 0" class="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-aurora-terracotta text-white shadow">
                  -{{ product.discountPercentage }}%
                </span>

                <!-- Low Stock Indicator -->
                <span *ngIf="product.stockQuantity > 0 && product.stockQuantity <= 5" class="absolute bottom-4 left-4 px-2.5 py-1 rounded-md text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-600/40 backdrop-blur-sm">
                  Only {{ product.stockQuantity }} pieces in atelier
                </span>
              </div>

              <!-- Product Info -->
              <div class="p-6">
                <div class="text-xs text-aurora-gold font-medium mb-1">{{ product.woodType }}</div>
                <h3 
                  [routerLink]="['/product', product.slug]" 
                  class="font-serif text-lg font-bold text-white group-hover:text-aurora-gold transition-colors cursor-pointer mb-2 truncate">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-aurora-sand/70 line-clamp-2 leading-relaxed mb-4">
                  {{ product.shortDescription }}
                </p>
                
                <div class="flex items-center justify-between text-[11px] text-aurora-sand/50 pb-4 border-b border-aurora-border/40">
                  <span>Dimensions:</span>
                  <span class="text-aurora-sand/80 font-mono">{{ product.dimensions }}</span>
                </div>
              </div>
            </div>

            <!-- Footer: Price & Add to Cart -->
            <div class="px-6 pb-6 pt-2 flex items-center justify-between">
              <div>
                <div class="text-[11px] text-aurora-sand/50">Atelier Price</div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-serif font-bold text-white">
                    {{ currencyService.formatPrice(product.discountedPriceEur, product.discountedPriceUsd) }}
                  </span>
                  <span *ngIf="product.discountPercentage > 0" class="text-xs text-aurora-sand/40 line-through">
                    {{ currencyService.formatPrice(product.priceEur, product.priceUsd) }}
                  </span>
                </div>
              </div>

              <button 
                (click)="cartService.addToCart(product)"
                class="px-4 py-2.5 rounded-xl bg-aurora-gold hover:bg-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md shadow-aurora-gold/10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);

  categories: Category[] = [];
  products: ProductSummary[] = [];
  selectedCategorySlug = '';
  searchQuery = '';
  sortBy = 'createdAt-desc';
  loading = true;

  ngOnInit(): void {
    this.productService.getCategories().subscribe(res => {
      this.categories = res.data;
    });

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategorySlug = params['category'];
      } else {
        this.selectedCategorySlug = '';
      }
      this.fetchProducts();
    });
  }

  selectCategory(slug: string): void {
    this.selectedCategorySlug = slug;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: slug || null },
      queryParamsHandling: 'merge'
    });
  }

  applyFilters(): void {
    this.fetchProducts();
  }

  resetFilters(): void {
    this.selectedCategorySlug = '';
    this.searchQuery = '';
    this.sortBy = 'createdAt-desc';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    this.fetchProducts();
  }

  private fetchProducts(): void {
    this.loading = true;
    const [sortField, sortDir] = this.sortBy.split('-');

    const filter: ProductFilter = {
      categorySlug: this.selectedCategorySlug || undefined,
      search: this.searchQuery || undefined,
      sortBy: sortField,
      sortDirection: (sortDir as 'asc' | 'desc') || 'desc',
      size: 24
    };

    this.productService.getProducts(filter).subscribe({
      next: (res) => {
        this.products = res.data.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
