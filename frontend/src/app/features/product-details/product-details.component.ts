import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ProductDetail, ProductImage } from '../../core/models/product.models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
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
          
          <!-- Animated Interactive Image Gallery Column -->
          <div class="space-y-4">
            
            <!-- Main High-Res Viewport with Zoom and Transitions -->
            <div class="relative h-[480px] sm:h-[580px] rounded-3xl overflow-hidden bg-aurora-card border border-aurora-border shadow-2xl group select-none">
              
              <!-- Active Image with Smooth Crossfade & Micro-Zoom on Hover -->
              <div class="w-full h-full overflow-hidden flex items-center justify-center bg-black/40">
                <img 
                  [src]="activeImageUrl | imageUrl" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-110 cursor-zoom-in"
                  [class.opacity-40]="isTransitioning"
                  [class.scale-95]="isTransitioning"
                  [class.opacity-100]="!isTransitioning"
                  [class.scale-100]="!isTransitioning"
                  (click)="openFullscreenZoom()" />
              </div>

              <!-- Top Left: Category & Angle Counter -->
              <div class="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-aurora-gold border border-white/10 shadow-lg">
                  {{ product.categoryName }}
                </span>
                <span *ngIf="galleryImages.length > 1" class="px-2.5 py-1 rounded-full text-[10px] font-mono text-white/80 bg-black/50 backdrop-blur-md border border-white/10">
                  Angle {{ activeImageIndex + 1 }} / {{ galleryImages.length }}
                </span>
              </div>

              <!-- Top Right: Discount Badge & Grain Inspect Button -->
              <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
                <span *ngIf="product.discountPercentage > 0" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg animate-pulse">
                  -{{ product.discountPercentage }}% Collector Privilege
                </span>

                <button 
                  type="button"
                  (click)="openFullscreenZoom()" 
                  class="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 shadow-xl"
                  title="Inspect Wood Grain Fullscreen">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                </button>
              </div>

              <!-- Bottom Bar: Certified Authenticity Tag -->
              <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                <span class="px-3 py-1.5 rounded-full text-[11px] font-medium bg-aurora-darker/90 text-aurora-gold border border-aurora-border/80 backdrop-blur-md shadow-lg">
                  Certified Natural Tunisian Woodcraft
                </span>

                <span class="text-[10px] font-mono text-aurora-sand/60 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5 hidden sm:inline-block">
                  Click to inspect wood grain
                </span>
              </div>

              <!-- Carousel Navigation Overlay Arrows (Fade-in on Hover) -->
              <div *ngIf="galleryImages.length > 1" class="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  type="button"
                  (click)="prevImage(); $event.stopPropagation()" 
                  class="w-10 h-10 rounded-full bg-black/70 hover:bg-black/95 text-white flex items-center justify-center border border-white/20 pointer-events-auto transition-transform hover:scale-110 shadow-2xl backdrop-blur-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button 
                  type="button"
                  (click)="nextImage(); $event.stopPropagation()" 
                  class="w-10 h-10 rounded-full bg-black/70 hover:bg-black/95 text-white flex items-center justify-center border border-white/20 pointer-events-auto transition-transform hover:scale-110 shadow-2xl backdrop-blur-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

            </div>

            <!-- Thumbnail Carousel Strip -->
            <div *ngIf="galleryImages.length > 1" class="space-y-2">
              <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none pt-1">
                <button 
                  *ngFor="let img of galleryImages; let i = index" 
                  (click)="setActiveImage(i)" 
                  class="group relative w-20 sm:w-24 h-24 sm:h-28 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 transform bg-black/30 hover:opacity-100 hover:scale-105"
                  [class.border-aurora-gold]="activeImageIndex === i"
                  [class.ring-2]="activeImageIndex === i"
                  [class.ring-aurora-gold]="activeImageIndex === i"
                  [class.shadow-xl]="activeImageIndex === i"
                  [class.scale-105]="activeImageIndex === i"
                  [class.border-aurora-border]="activeImageIndex !== i"
                  [class.opacity-50]="activeImageIndex !== i">
                  
                  <img [src]="img.imageUrl | imageUrl" [alt]="img.altText || product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  
                  <!-- Angle number badge -->
                  <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/90 backdrop-blur-sm">
                    {{ i + 1 }}
                  </span>
                </button>
              </div>
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

            <!-- Artisan Narrative & Provenance Description -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase tracking-widest text-aurora-gold">Sculptural Provenance</h3>
              <p class="text-xs sm:text-sm text-aurora-sand/80 leading-relaxed">
                {{ product.detailedDescription }}
              </p>
            </div>

            <!-- Master Artisan Notes -->
            <div *ngIf="product.artisanNotes" class="p-4 rounded-xl bg-aurora-darker border-l-2 border-aurora-gold space-y-1">
              <div class="text-[11px] font-semibold uppercase tracking-wider text-aurora-gold">Atelier Carving Notes</div>
              <p class="text-xs text-aurora-sand/70 italic leading-relaxed">
                "{{ product.artisanNotes }}"
              </p>
            </div>

            <!-- Material & Dimensional Specs Table -->
            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-aurora-card border border-aurora-border text-xs">
              <div>
                <span class="text-aurora-sand/50 block text-[10px] uppercase tracking-wider">Wood Type</span>
                <span class="text-white font-medium">{{ product.woodType }}</span>
              </div>
              <div>
                <span class="text-aurora-sand/50 block text-[10px] uppercase tracking-wider">Dimensions</span>
                <span class="text-white font-mono">{{ product.dimensions }}</span>
              </div>
              <div *ngIf="product.weightGrams">
                <span class="text-aurora-sand/50 block text-[10px] uppercase tracking-wider">Weight</span>
                <span class="text-white font-mono">{{ (product.weightGrams / 1000).toFixed(2) }} kg</span>
              </div>
              <div>
                <span class="text-aurora-sand/50 block text-[10px] uppercase tracking-wider">Provenance</span>
                <span class="text-white">Kairouan / Sfax, Tunisia</span>
              </div>
            </div>

            <!-- Stock Availability & International Shipping Info -->
            <div class="flex items-center justify-between text-xs py-2 border-y border-aurora-border/60">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" [class.bg-emerald-400]="product.stockQuantity > 2" [class.bg-amber-400]="product.stockQuantity <= 2"></span>
                <span class="text-aurora-sand/80">
                  {{ product.stockQuantity > 0 ? (product.stockQuantity + ' piece' + (product.stockQuantity === 1 ? '' : 's') + ' available in atelier') : 'Reserved for Private Collection' }}
                </span>
              </div>
              <div class="text-aurora-gold font-medium">
                DHL Express: 3-5 Business Days
              </div>
            </div>

            <!-- Quantity & Add to Cart Actions -->
            <div class="space-y-4 pt-2">
              
              <div class="flex items-center gap-4">
                <!-- Quantity Selector -->
                <div class="flex items-center border border-aurora-border rounded-xl bg-aurora-darker p-1">
                  <button 
                    (click)="decreaseQuantity()" 
                    [disabled]="quantity <= 1"
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-aurora-sand hover:text-white disabled:opacity-30 transition-colors">
                    -
                  </button>
                  <span class="w-12 text-center font-mono font-bold text-white text-sm">
                    {{ quantity }}
                  </span>
                  <button 
                    (click)="increaseQuantity()" 
                    [disabled]="quantity >= product.stockQuantity"
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-aurora-sand hover:text-white disabled:opacity-30 transition-colors">
                    +
                  </button>
                </div>

                <!-- Add to Atelier Cart Button -->
                <button 
                  (click)="addToCart()"
                  [disabled]="product.stockQuantity <= 0"
                  class="flex-1 py-4 px-6 rounded-xl bg-aurora-gold hover:bg-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl shadow-aurora-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 disabled:transform-none">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add to Atelier Bag</span>
                </button>
              </div>

              <!-- Buy Now Direct Action -->
              <button 
                (click)="buyNow()"
                [disabled]="product.stockQuantity <= 0"
                class="w-full py-3.5 px-6 rounded-xl bg-aurora-card/80 hover:bg-aurora-card border border-aurora-border hover:border-aurora-gold/50 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-40">
                Instant International Checkout
              </button>

            </div>

            <!-- Guarantee Badges -->
            <div class="grid grid-cols-2 gap-4 pt-4 text-xs text-aurora-sand/60">
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Salvaged Heritage Wood Only</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Direct Artisan Compensation</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Insured Global Freight &amp; Customs</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-aurora-gold font-bold">✓</span>
                <span>Numbered Provenance Certificate</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Collector Fullscreen Wood Grain Inspection Lightbox Modal -->
      <div 
        *ngIf="showFullscreenZoom && product" 
        (click)="closeFullscreenZoom()"
        class="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-300">
        
        <!-- Lightbox Header -->
        <div class="w-full max-w-6xl flex items-center justify-between text-white pb-4 z-20" (click)="$event.stopPropagation()">
          <div>
            <h4 class="font-serif text-xl font-bold">{{ product.name }}</h4>
            <p class="text-xs text-aurora-gold font-mono">{{ product.woodType }} • Angle {{ activeImageIndex + 1 }} of {{ galleryImages.length }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              type="button" 
              (click)="toggleZoomScale()" 
              class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-colors">
              Zoom: {{ zoomScale }}x
            </button>

            <button 
              type="button" 
              (click)="closeFullscreenZoom()" 
              class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all">
              ✕
            </button>
          </div>
        </div>

        <!-- Lightbox Main Image Viewport -->
        <div class="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-4" (click)="$event.stopPropagation()">
          <img 
            [src]="activeImageUrl | imageUrl" 
            [alt]="product.name" 
            class="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
            [style.transform]="'scale(' + zoomScale + ')'" />

          <!-- Prev/Next inside lightbox -->
          <div *ngIf="galleryImages.length > 1" class="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
            <button 
              type="button" 
              (click)="prevImage(); $event.stopPropagation()" 
              class="w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 pointer-events-auto transition-transform hover:scale-110 shadow-2xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button 
              type="button" 
              (click)="nextImage(); $event.stopPropagation()" 
              class="w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 pointer-events-auto transition-transform hover:scale-110 shadow-2xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- Lightbox Bottom Thumbnails Strip -->
        <div *ngIf="galleryImages.length > 1" class="flex gap-2 pb-2 z-20" (click)="$event.stopPropagation()">
          <button 
            *ngFor="let img of galleryImages; let i = index" 
            (click)="setActiveImage(i)" 
            class="w-14 h-16 rounded-xl overflow-hidden border-2 transition-all"
            [class.border-aurora-gold]="activeImageIndex === i"
            [class.border-neutral-700]="activeImageIndex !== i"
            [class.opacity-40]="activeImageIndex !== i">
            <img [src]="img.imageUrl | imageUrl" class="w-full h-full object-cover" />
          </button>
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
  activeImageIndex: number = 0;
  isTransitioning: boolean = false;
  showFullscreenZoom: boolean = false;
  zoomScale: number = 1.0;

  quantity: number = 1;
  loading: boolean = true;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.showFullscreenZoom) {
      if (event.key === 'Escape') {
        this.closeFullscreenZoom();
      } else if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'ArrowLeft') {
        this.prevImage();
      }
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevImage();
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchProduct(slug);
      }
    });
  }

  get galleryImages(): ProductImage[] {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images;
    }
    if (this.product?.primaryImageUrl) {
      return [{
        id: 1,
        imageUrl: this.product.primaryImageUrl,
        altText: this.product.name,
        isPrimary: true,
        displayOrder: 1
      }];
    }
    return [];
  }

  fetchProduct(slug: string): void {
    this.loading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.product = res.data;
        this.activeImageIndex = 0;
        this.activeImageUrl = this.product.primaryImageUrl || (this.product.images && this.product.images[0]?.imageUrl) || '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/catalog']);
      }
    });
  }

  setActiveImage(index: number): void {
    if (index === this.activeImageIndex) return;
    this.isTransitioning = true;
    setTimeout(() => {
      this.activeImageIndex = index;
      const images = this.galleryImages;
      if (images[index]) {
        this.activeImageUrl = images[index].imageUrl;
      }
      this.isTransitioning = false;
    }, 150);
  }

  nextImage(): void {
    const images = this.galleryImages;
    if (images.length <= 1) return;
    const nextIdx = (this.activeImageIndex + 1) % images.length;
    this.setActiveImage(nextIdx);
  }

  prevImage(): void {
    const images = this.galleryImages;
    if (images.length <= 1) return;
    const prevIdx = (this.activeImageIndex - 1 + images.length) % images.length;
    this.setActiveImage(prevIdx);
  }

  openFullscreenZoom(): void {
    this.showFullscreenZoom = true;
    this.zoomScale = 1.0;
  }

  closeFullscreenZoom(): void {
    this.showFullscreenZoom = false;
    this.zoomScale = 1.0;
  }

  toggleZoomScale(): void {
    if (this.zoomScale === 1.0) {
      this.zoomScale = 1.5;
    } else if (this.zoomScale === 1.5) {
      this.zoomScale = 2.0;
    } else {
      this.zoomScale = 1.0;
    }
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
