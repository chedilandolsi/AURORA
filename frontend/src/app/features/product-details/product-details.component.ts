import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ProductDetail } from '../../core/models/product.models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-aurora-dark min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumb Navigation -->
        <div class="text-xs text-aurora-sand/60 mb-8 flex items-center gap-2">
          <a routerLink="/" class="hover:text-aurora-gold">Atelier</a>
          <span>/</span>
          <a routerLink="/catalog" class="hover:text-aurora-gold">Catalog</a>
          <span *ngIf="product">/</span>
          <a *ngIf="product" [routerLink]="['/catalog']" [queryParams]="{category: product.categorySlug}" class="hover:text-aurora-gold">
            {{ product.categoryName }}
          </a>
          <span *ngIf="product">/</span>
          <span *ngIf="product" class="text-aurora-gold truncate">{{ product.name }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="py-32 text-center">
          <div class="w-10 h-10 border-2 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-xs text-aurora-sand/60">Loading artisan masterpiece details...</p>
        </div>

        <!-- Product View -->
        <div *ngIf="!loading && product" class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          <!-- Image Gallery Column -->
          <div class="space-y-4">
            <!-- Active High-Res Viewport -->
            <div class="relative h-[480px] sm:h-[560px] rounded-2xl overflow-hidden bg-aurora-card border border-aurora-border shadow-2xl">
              <img 
                [src]="activeImageUrl" 
                [alt]="product.name" 
                class="w-full h-full object-cover object-center transition-all duration-300" />

              <span *ngIf="product.discountPercentage > 0" class="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-aurora-terracotta text-white shadow-lg">
                -{{ product.discountPercentage }}% Collector Privilege
              </span>

              <span class="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-medium bg-aurora-darker/90 text-aurora-gold border border-aurora-border backdrop-blur-md">
                Certified Natural Woodcraft
              </span>
            </div>

            <!-- Thumbnail Carousel Strip -->
            <div *ngIf="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-2">
              <button 
                *ngFor="let img of product.images" 
                (click)="activeImageUrl = img.imageUrl" 
                class="w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all"
                [class.border-aurora-gold]="activeImageUrl === img.imageUrl"
                [class.border-aurora-border]="activeImageUrl !== img.imageUrl"
                [class.opacity-50]="activeImageUrl !== img.imageUrl">
                <img [src]="img.imageUrl" [alt]="img.altText || product.name" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Specifications & Purchase Action Column -->
          <div class="space-y-6">
            
            <!-- Category and Wood Origin -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-aurora-card border border-aurora-gold/30 text-aurora-gold">
                  {{ product.categoryName }}
                </span>
                <span class="text-xs text-aurora-sand/60">
                  {{ product.woodType }}
                </span>
              </div>

              <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                {{ product.name }}
              </h1>
            </div>

            <!-- Pricing Section in EUR/USD -->
            <div class="p-4 rounded-xl bg-aurora-card/60 border border-aurora-border flex items-baseline justify-between">
              <div>
                <span class="text-xs text-aurora-sand/50 block">Investment Value (Includes Export Customs)</span>
                <div class="flex items-baseline gap-3 mt-1">
                  <span class="font-serif text-3xl font-bold text-white">
                    {{ currencyService.formatPrice(product.discountedPriceEur, product.discountedPriceUsd) }}
                  </span>
                  <span *ngIf="product.discountPercentage > 0" class="text-sm text-aurora-sand/40 line-through">
                    {{ currencyService.formatPrice(product.priceEur, product.priceUsd) }}
                  </span>
                </div>
              </div>

              <!-- Currency Switcher shortcut -->
              <button 
                (click)="currencyService.toggleCurrency()" 
                class="text-xs text-aurora-gold hover:underline font-mono">
                Currency: {{ currencyService.currentCurrency() }} (Switch)
              </button>
            </div>

            <!-- Artisan Narrative & Descriptions -->
            <div class="space-y-3">
              <h3 class="font-serif text-sm font-semibold text-white uppercase tracking-wider">Artisan Provenance</h3>
              <p class="text-xs sm:text-sm text-aurora-sand/80 leading-relaxed">
                {{ product.detailedDescription }}
              </p>
              
              <div *ngIf="product.artisanNotes" class="p-3.5 rounded-xl bg-aurora-darker border-l-2 border-aurora-gold text-xs text-aurora-sand/70 italic">
                "{{ product.artisanNotes }}"
              </div>
            </div>

            <!-- Technical Wood & Dimension Specs Table -->
            <div class="border border-aurora-border rounded-xl divide-y divide-aurora-border text-xs">
              <div class="grid grid-cols-2 p-3">
                <span class="text-aurora-sand/50">Primary Timber</span>
                <span class="text-white font-medium">{{ product.woodType }}</span>
              </div>
              <div class="grid grid-cols-2 p-3">
                <span class="text-aurora-sand/50">Sculptural Dimensions</span>
                <span class="text-white font-mono font-medium">{{ product.dimensions }}</span>
              </div>
              <div *ngIf="product.weightGrams" class="grid grid-cols-2 p-3">
                <span class="text-aurora-sand/50">Sculptural Weight</span>
                <span class="text-white font-mono font-medium">{{ product.weightGrams }} grams</span>
              </div>
              <div class="grid grid-cols-2 p-3">
                <span class="text-aurora-sand/50">Atelier Availability</span>
                <span class="font-medium" [class.text-emerald-400]="product.stockQuantity > 3" [class.text-amber-400]="product.stockQuantity <= 3">
                  {{ product.stockQuantity }} handcrafted pieces remaining
                </span>
              </div>
            </div>

            <!-- Quantity Selector & Action CTAs -->
            <div class="space-y-4 pt-4 border-t border-aurora-border/60">
              <div class="flex items-center gap-4">
                <div class="flex items-center border border-aurora-border rounded-xl bg-aurora-card overflow-hidden">
                  <button 
                    (click)="decreaseQuantity()" 
                    class="px-4 py-3 text-aurora-sand hover:text-white hover:bg-aurora-cardHover transition-colors font-bold text-sm">
                    -
                  </button>
                  <span class="px-4 py-3 text-sm font-semibold text-white">{{ quantity }}</span>
                  <button 
                    (click)="increaseQuantity()" 
                    class="px-4 py-3 text-aurora-sand hover:text-white hover:bg-aurora-cardHover transition-colors font-bold text-sm"
                    [disabled]="quantity >= product.stockQuantity">
                    +
                  </button>
                </div>

                <!-- Add to Cart CTA -->
                <button 
                  (click)="addToCart()"
                  class="flex-1 py-3.5 px-6 rounded-xl bg-aurora-card hover:bg-aurora-cardHover border border-aurora-gold/60 text-aurora-gold font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add to Atelier Cart</span>
                </button>
              </div>

              <!-- Buy Now with Stripe CTA -->
              <button 
                (click)="buyNow()" 
                class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aurora-gold via-amber-400 to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-aurora-gold/20 transition-all flex items-center justify-center gap-2">
                <span>Direct Checkout with Stripe</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <!-- Guarantee Badges -->
            <div class="grid grid-cols-2 gap-4 pt-4 text-xs text-aurora-sand/60">
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>DHL Express: 3-5 days delivery</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Customs &amp; Duties Pre-Cleared</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Insured Fragile Art Handling</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Numbered Provenance Certificate</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class ProductDetailsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);

  product: ProductDetail | null = null;
  activeImageUrl: string = '';
  quantity: number = 1;
  loading: boolean = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchProduct(slug);
      }
    });
  }

  fetchProduct(slug: string): void {
    this.loading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.product = res.data;
        this.activeImageUrl = this.product.primaryImageUrl;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/catalog']);
      }
    });
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.cartService.closeDrawer();
      this.router.navigate(['/checkout']);
    }
  }
}
