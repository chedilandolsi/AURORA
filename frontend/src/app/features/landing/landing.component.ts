import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { Category, ProductSummary } from '../../core/models/product.models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
    <!-- Top Seasonal Promotion Banner -->
    <div class="bg-gradient-to-r from-aurora-terracotta via-amber-700 to-aurora-terracotta text-white py-2.5 px-4 text-center text-xs font-medium tracking-wider shadow-inner">
      <div class="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <span class="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Seasonal Privilege</span>
        <span>Enjoy <strong>up to 30% off</strong> curated artisanal masks for international collectors. Direct DHL Express to USA &amp; Europe.</span>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-aurora-darker border-b border-aurora-border">
      <!-- Background Image with Dark Vignette Gradient -->
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=85" 
          alt="Artisanal Tunisian olive wood mask carving" 
          class="w-full h-full object-cover object-center opacity-30 filter brightness-75 scale-105 animate-pulse duration-1000" />
        <div class="absolute inset-0 bg-gradient-to-t from-aurora-darker via-aurora-dark/80 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-aurora-darker via-transparent to-aurora-darker"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        
        <!-- Atelier Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-aurora-gold/30 bg-aurora-card/80 backdrop-blur-md mb-8">
          <span class="w-2 h-2 rounded-full bg-aurora-gold"></span>
          <span class="text-xs uppercase tracking-[0.25em] text-aurora-gold font-semibold">Tunisian Artisanal Heritage</span>
        </div>

        <!-- Grand Title -->
        <h1 class="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          Sculpted by Centuries.<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-aurora-gold via-amber-200 to-aurora-goldLight">
            Carved with Soul.
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="max-w-2xl mx-auto text-base sm:text-lg text-aurora-sand/80 font-sans font-light leading-relaxed mb-10">
          Rare handcrafted wooden masks chiseled from 300-year-old salvaged Mediterranean olive roots. Delivered directly from the historic workshops of Kairouan and Sfax to collectors across the USA and Europe.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            routerLink="/catalog" 
            class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-aurora-gold via-amber-400 to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-aurora-gold/20 transition-all transform hover:-translate-y-0.5">
            Explore Masterpieces
          </a>
          <a 
            routerLink="/catalog" 
            [queryParams]="{category: 'people'}"
            class="w-full sm:w-auto px-8 py-4 rounded-xl bg-aurora-card/80 hover:bg-aurora-card border border-aurora-border hover:border-aurora-gold/50 text-white font-semibold text-xs uppercase tracking-[0.2em] transition-all">
            People &amp; Ancestral Masks
          </a>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-16 pt-10 border-t border-aurora-border/40 text-center">
          <div>
            <div class="font-serif text-2xl font-bold text-white">300+ yrs</div>
            <div class="text-[11px] text-aurora-sand/60 uppercase tracking-wider mt-1">Aged Olive Wood</div>
          </div>
          <div>
            <div class="font-serif text-2xl font-bold text-white">100%</div>
            <div class="text-[11px] text-aurora-sand/60 uppercase tracking-wider mt-1">Hand-Chiseled</div>
          </div>
          <div>
            <div class="font-serif text-2xl font-bold text-white">DHL 3-5d</div>
            <div class="text-[11px] text-aurora-sand/60 uppercase tracking-wider mt-1">US &amp; EU Express</div>
          </div>
        </div>

      </div>
    </section>

    <!-- Category Shortcuts Gallery -->
    <section class="py-20 bg-aurora-dark border-b border-aurora-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span class="text-xs uppercase tracking-[0.25em] text-aurora-gold font-semibold">Curation</span>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">3 Mask Lineages</h2>
            <p class="text-xs text-aurora-sand/60 mt-1">Exclusively specialized in handcrafted decorative wooden masks</p>
          </div>
          <a routerLink="/catalog" class="mt-4 md:mt-0 text-xs font-semibold text-aurora-gold hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider">
            <span>View Complete Collection</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            *ngFor="let cat of categories" 
            [routerLink]="['/catalog']" 
            [queryParams]="{category: cat.slug}"
            class="group cursor-pointer rounded-2xl overflow-hidden bg-aurora-card border border-aurora-border hover:border-aurora-gold/50 transition-all duration-300 transform hover:-translate-y-1">
            
            <div class="h-64 relative overflow-hidden">
              <img 
                [src]="cat.imageUrl" 
                [alt]="cat.name" 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div class="absolute inset-0 bg-gradient-to-t from-aurora-card via-aurora-card/20 to-transparent"></div>
              
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="font-serif text-xl font-bold text-white group-hover:text-aurora-gold transition-colors">{{ cat.name }}</h3>
                <p class="text-xs text-aurora-sand/70 line-clamp-2 mt-1">{{ cat.description }}</p>
                <div class="mt-3 flex items-center gap-1 text-[11px] font-semibold text-aurora-gold uppercase tracking-wider">
                  <span>Explore Series</span>
                  <span>→</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- NEW FEATURE: Discounts & Special Offers Section -->
    <section *ngIf="onSaleProducts.length > 0" class="py-24 bg-gradient-to-b from-aurora-darker via-aurora-dark to-aurora-darker border-b border-aurora-border relative overflow-hidden">
      <!-- Ambient decorative glow -->
      <div class="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-aurora-terracotta/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/3 right-10 -translate-y-1/2 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/40 bg-rose-500/10 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400 mb-3 shadow-inner">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Curated Atelier Privilege
            </div>
            <h2 class="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Discounts &amp; Special Offers
            </h2>
            <p class="text-sm text-aurora-sand/70 mt-3 max-w-2xl leading-relaxed">
              Acquire certified museum-grade Tunisian wooden masks at seasonal atelier privilege pricing. Each piece is unique, hand-chiseled from heritage olive and cedar timbers.
            </p>
          </div>

          <!-- Controls: Category Filter & Carousel Nav -->
          <div class="flex items-center gap-3 flex-wrap">
            <!-- Filter Pills -->
            <div class="inline-flex items-center bg-aurora-card/80 backdrop-blur-md border border-aurora-border rounded-xl p-1 text-xs">
              <button 
                (click)="activeSaleCategory = 'all'"
                class="px-3 py-1.5 rounded-lg font-medium transition-all"
                [class.bg-aurora-gold]="activeSaleCategory === 'all'"
                [class.text-aurora-darker]="activeSaleCategory === 'all'"
                [class.text-aurora-sand]="activeSaleCategory !== 'all'">
                All Offers ({{ onSaleProducts.length }})
              </button>
              <button 
                *ngFor="let cat of categories"
                (click)="activeSaleCategory = cat.slug"
                class="px-3 py-1.5 rounded-lg font-medium transition-all"
                [class.bg-aurora-gold]="activeSaleCategory === cat.slug"
                [class.text-aurora-darker]="activeSaleCategory === cat.slug"
                [class.text-aurora-sand]="activeSaleCategory !== cat.slug">
                {{ cat.name }}
              </button>
            </div>

            <!-- Carousel Arrow Buttons -->
            <div class="hidden sm:flex items-center gap-2">
              <button 
                (click)="scrollCarousel('left', carouselRef)"
                class="w-10 h-10 rounded-xl bg-aurora-card/90 border border-aurora-border hover:border-aurora-gold/60 text-white flex items-center justify-center transition-all hover:bg-aurora-darker shadow-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button 
                (click)="scrollCarousel('right', carouselRef)"
                class="w-10 h-10 rounded-xl bg-aurora-card/90 border border-aurora-border hover:border-aurora-gold/60 text-white flex items-center justify-center transition-all hover:bg-aurora-darker shadow-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Horizontal Carousel / Fluid Grid Container -->
        <div 
          #carouselRef
          class="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth scrollbar-none"
          style="scrollbar-width: none; -ms-overflow-style: none;">
          
          <div 
            *ngFor="let product of filteredSaleProducts()" 
            class="snap-start flex-shrink-0 w-[290px] sm:w-[320px] md:w-[340px] rounded-2xl overflow-hidden bg-aurora-card/90 backdrop-blur-md border border-aurora-border/70 hover:border-aurora-gold/60 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-aurora-gold/10 hover:-translate-y-1.5 flex flex-col justify-between group">
            
            <div>
              <!-- Image Viewport with Hover Zoom & Quick View Trigger -->
              <div class="relative h-72 sm:h-80 overflow-hidden bg-aurora-darker cursor-pointer" [routerLink]="['/product', product.slug]">
                <img 
                  [src]="product.primaryImageUrl | imageUrl" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                
                <div class="absolute inset-0 bg-gradient-to-t from-aurora-card via-transparent to-transparent opacity-60"></div>

                <!-- Animated Sale Badge -->
                <div class="absolute top-3 left-3 z-10">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 text-white shadow-lg shadow-rose-950/60 border border-white/20 animate-pulse">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.533 1.035-.688 1.587a6.945 6.945 0 00-.28 1.34c-.11.834-.055 1.55.19 2.203.24.639.697 1.157 1.298 1.488.583.322 1.25.414 1.895.275.642-.14 1.21-.497 1.637-.998.423-.497.663-1.127.697-1.782.035-.653-.131-1.312-.486-1.874a7.962 7.962 0 00-1.986-2.034z" clip-rule="evenodd" />
                    </svg>
                    -{{ product.discountPercentage }}% OFF
                  </span>
                </div>

                <!-- Category Pill -->
                <span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-aurora-sand">
                  {{ product.categoryName }}
                </span>

                <!-- Quick View Overlay on Hover -->
                <div 
                  (click)="$event.stopPropagation(); openQuickView(product)"
                  class="absolute inset-0 bg-aurora-darker/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                  <button 
                    type="button"
                    class="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs tracking-wider uppercase border border-white/30 backdrop-blur-md transition-all transform hover:scale-105 flex items-center gap-2 shadow-2xl">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    Quick View
                  </button>
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-5">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="text-aurora-gold font-medium truncate">{{ product.woodType }}</span>
                  <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">In Atelier Stock</span>
                </div>

                <h3 
                  [routerLink]="['/product', product.slug]" 
                  class="font-serif text-lg font-bold text-white group-hover:text-aurora-gold transition-colors cursor-pointer line-clamp-1">
                  {{ product.name }}
                </h3>

                <p class="text-xs text-aurora-sand/70 line-clamp-2 mt-1.5 leading-relaxed">
                  {{ product.shortDescription }}
                </p>

                <div class="text-[11px] text-aurora-sand/50 font-mono mt-3 pb-3 border-b border-aurora-border/40">
                  Dimensions: {{ product.dimensions }}
                </div>
              </div>
            </div>

            <!-- Price & Actions Footer -->
            <div class="p-5 pt-0">
              <div class="flex items-end justify-between mb-4">
                <div>
                  <div class="text-[10px] uppercase tracking-wider text-rose-400 font-semibold">Special Offer</div>
                  <div class="flex items-baseline gap-2 mt-0.5">
                    <span class="text-xl sm:text-2xl font-serif font-bold text-white">
                      {{ currencyService.formatPrice(product.discountedPriceEur, product.discountedPriceUsd) }}
                    </span>
                    <span class="text-xs text-aurora-sand/40 line-through">
                      {{ currencyService.formatPrice(product.priceEur, product.priceUsd) }}
                    </span>
                  </div>
                </div>
                <div class="text-[11px] font-mono text-emerald-400 font-semibold">
                  Save {{ getSavings(product) }}
                </div>
              </div>

              <!-- Dual Action: Quick View + Direct Add to Cart -->
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  (click)="openQuickView(product)"
                  class="px-3 py-2.5 rounded-xl bg-aurora-darker hover:bg-aurora-cardHover text-aurora-sand hover:text-white border border-aurora-border hover:border-aurora-gold/40 text-[11px] font-semibold uppercase tracking-wider transition-all">
                  Quick View
                </button>
                <button 
                  type="button"
                  (click)="addToCartWithFeedback(product)"
                  [class.bg-emerald-600]="addedProductId === product.id"
                  [class.text-white]="addedProductId === product.id"
                  [class.bg-gradient-to-r]="addedProductId !== product.id"
                  [class.from-aurora-gold]="addedProductId !== product.id"
                  [class.to-amber-500]="addedProductId !== product.id"
                  [class.text-aurora-darker]="addedProductId !== product.id"
                  class="px-3 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-aurora-gold/10 hover:brightness-110">
                  <ng-container *ngIf="addedProductId !== product.id">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span>Add to Bag</span>
                  </ng-container>
                  <ng-container *ngIf="addedProductId === product.id">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span>Added!</span>
                  </ng-container>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- Featured Masterpieces Section -->
    <section class="py-24 bg-aurora-darker border-b border-aurora-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-xs uppercase tracking-[0.25em] text-aurora-gold font-semibold">Atelier Spotlight</span>
          <h2 class="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">Highlighted Masterworks</h2>
          <p class="text-sm text-aurora-sand/70 mt-4">
            Individual, one-of-one wooden masks carved from individual tree formations. Once sold, no identical piece can ever be replicated.
          </p>
        </div>

        <!-- Featured Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let product of featuredProducts" 
            class="group rounded-2xl overflow-hidden bg-aurora-card border border-aurora-border hover:border-aurora-gold/50 transition-all duration-300 flex flex-col justify-between">
            
            <div>
              <!-- Image Container -->
              <div class="relative h-80 overflow-hidden bg-aurora-dark cursor-pointer" [routerLink]="['/product', product.slug]">
                <img 
                  [src]="product.primaryImageUrl | imageUrl" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <!-- Category Badge -->
                <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-aurora-darker/80 text-aurora-gold border border-aurora-border backdrop-blur-md">
                  {{ product.categoryName }}
                </span>

                <!-- Discount Tag if applicable -->
                <span *ngIf="product.discountPercentage > 0" class="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-aurora-terracotta text-white shadow">
                  -{{ product.discountPercentage }}%
                </span>
              </div>

              <!-- Product Info -->
              <div class="p-6">
                <div class="text-xs text-aurora-gold font-medium mb-1">{{ product.woodType }}</div>
                <h3 
                  [routerLink]="['/product', product.slug]" 
                  class="font-serif text-xl font-bold text-white group-hover:text-aurora-gold transition-colors cursor-pointer mb-2">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-aurora-sand/70 line-clamp-2 leading-relaxed mb-4">
                  {{ product.shortDescription }}
                </p>
                
                <!-- Dimensions -->
                <div class="flex items-center gap-2 text-[11px] text-aurora-sand/50 pb-4 border-b border-aurora-border/40">
                  <span>Dimensions:</span>
                  <span class="text-aurora-sand/80 font-mono">{{ product.dimensions }}</span>
                </div>
              </div>
            </div>

            <!-- Footer: Price & Add to Cart -->
            <div class="px-6 pb-6 pt-2 flex items-center justify-between">
              <div>
                <div class="text-xs text-aurora-sand/50">Price</div>
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
                <span>Add to Cart</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- The Artisan Heritage Story Section -->
    <section class="py-24 bg-aurora-dark relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div class="space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-aurora-gold/30 bg-aurora-card text-xs uppercase tracking-[0.2em] text-aurora-gold font-semibold">
              Heritage Narrative
            </div>
            
            <h2 class="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              The Soul of the Tunisian Olive Tree
            </h2>
            
            <p class="text-sm text-aurora-sand/80 leading-relaxed">
              In the Mediterranean heartlands of Tunisia, olive trees have stood watch for over three millennia. When trees naturally cease fruit bearing after three to five centuries, our master carvers respectfully harvest the ancient root burl.
            </p>

            <p class="text-sm text-aurora-sand/80 leading-relaxed">
              Every mask is chiseled exclusively by hand using generational carbon gouges in the historic medina of Kairouan. No two pieces share the same grain, fissures, or honey-caramel hues. Finished solely with organic cold-pressed oil and desert beeswax.
            </p>

            <div class="grid grid-cols-2 gap-6 pt-4">
              <div class="p-4 rounded-xl bg-aurora-card border border-aurora-border">
                <div class="font-serif text-lg font-bold text-aurora-gold">Zero Deforestation</div>
                <p class="text-xs text-aurora-sand/60 mt-1">Only salvaged, deceased, or non-producing heritage wood is sculpted.</p>
              </div>
              <div class="p-4 rounded-xl bg-aurora-card border border-aurora-border">
                <div class="font-serif text-lg font-bold text-aurora-gold">Direct Artisan Payout</div>
                <p class="text-xs text-aurora-sand/60 mt-1">Wise-powered banking ensures 80% of net value reaches Tunisian master carvers.</p>
              </div>
            </div>
          </div>

          <!-- Imagery Showcase -->
          <div class="relative">
            <div class="relative z-10 rounded-2xl overflow-hidden border border-aurora-border shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85" 
                alt="Master woodcarver at work in atelier" 
                class="w-full h-[450px] object-cover" />
            </div>
            <div class="absolute -bottom-6 -right-6 w-64 h-64 rounded-2xl overflow-hidden border-2 border-aurora-gold shadow-2xl hidden sm:block z-20">
              <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=85" 
                alt="Close-up of olive wood grain texture" 
                class="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- International Testimonials -->
    <section class="py-20 bg-aurora-darker border-t border-aurora-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <span class="text-xs uppercase tracking-[0.25em] text-aurora-gold font-semibold">Collector Perspectives</span>
        <h2 class="font-serif text-3xl font-bold text-white mt-2 mb-12">Adorning Homes Across the Globe</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div class="p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4">
            <div class="text-amber-400 flex gap-1">★★★★★</div>
            <p class="text-xs text-aurora-sand/80 leading-relaxed italic">
              "The Guardian of Matmata arrived in Manhattan via DHL in just 4 days. The depth of the olive grain in ambient evening light is breathtaking. You can smell the natural beeswax finish."
            </p>
            <div class="pt-2 border-t border-aurora-border/40">
              <div class="font-serif text-sm font-semibold text-white">Julian V.</div>
              <div class="text-[11px] text-aurora-gold">Architect • New York, USA</div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4">
            <div class="text-amber-400 flex gap-1">★★★★★</div>
            <p class="text-xs text-aurora-sand/80 leading-relaxed italic">
              "An extraordinary collector centerpiece for our Paris salon. The authenticity certificate and artisan signature on the rear make it truly gallery caliber."
            </p>
            <div class="pt-2 border-t border-aurora-border/40">
              <div class="font-serif text-sm font-semibold text-white">Claire &amp; Antoine B.</div>
              <div class="text-[11px] text-aurora-gold">Interior Stylists • Paris, France</div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-aurora-card border border-aurora-border space-y-4">
            <div class="text-amber-400 flex gap-1">★★★★★</div>
            <p class="text-xs text-aurora-sand/80 leading-relaxed italic">
              "Smooth payment via Stripe and Wise payout assurance that local Tunisian craftsmen are fairly compensated made this purchase deeply meaningful."
            </p>
            <div class="pt-2 border-t border-aurora-border/40">
              <div class="font-serif text-sm font-semibold text-white">Marcus H.</div>
              <div class="text-[11px] text-aurora-gold">Design Collector • London, UK</div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Quick View Modal -->
    <div 
      *ngIf="quickViewProduct" 
      (click)="closeQuickView()"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      <div 
        (click)="$event.stopPropagation()"
        class="bg-aurora-card border border-aurora-border rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Close Button -->
        <button 
          (click)="closeQuickView()" 
          class="absolute top-5 right-5 w-9 h-9 rounded-full bg-aurora-darker hover:bg-aurora-cardHover text-aurora-sand/70 hover:text-white flex items-center justify-center border border-aurora-border transition-colors z-20">
          ✕
        </button>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          
          <!-- Image -->
          <div class="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-aurora-darker border border-aurora-border">
            <img 
              [src]="quickViewProduct.primaryImageUrl | imageUrl" 
              [alt]="quickViewProduct.name" 
              class="w-full h-full object-cover" />
            
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-lg">
              -{{ quickViewProduct.discountPercentage }}% Off
            </span>
          </div>

          <!-- Specs & Action -->
          <div class="space-y-4">
            <div>
              <span class="text-[10px] font-mono uppercase tracking-widest text-aurora-gold font-bold">
                {{ quickViewProduct.categoryName }} Lineage
              </span>
              <h3 class="font-serif text-2xl font-bold text-white mt-1">
                {{ quickViewProduct.name }}
              </h3>
              <p class="text-xs text-aurora-sand/60 mt-0.5">{{ quickViewProduct.woodType }}</p>
            </div>

            <p class="text-xs text-aurora-sand/80 leading-relaxed">
              {{ quickViewProduct.shortDescription }}
            </p>

            <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-aurora-darker border border-aurora-border text-xs">
              <div>
                <span class="text-aurora-sand/50 block text-[10px] uppercase">Dimensions</span>
                <span class="text-white font-mono">{{ quickViewProduct.dimensions }}</span>
              </div>
              <div>
                <span class="text-aurora-sand/50 block text-[10px] uppercase">Availability</span>
                <span class="text-emerald-400 font-semibold">{{ quickViewProduct.stockQuantity }} pieces available</span>
              </div>
            </div>

            <!-- Price -->
            <div class="pt-2">
              <div class="text-[10px] text-aurora-sand/50 uppercase tracking-wider">Promotional Collector Price</div>
              <div class="flex items-baseline gap-3 mt-1">
                <span class="font-serif text-3xl font-bold text-white">
                  {{ currencyService.formatPrice(quickViewProduct.discountedPriceEur, quickViewProduct.discountedPriceUsd) }}
                </span>
                <span class="text-sm text-aurora-sand/40 line-through">
                  {{ currencyService.formatPrice(quickViewProduct.priceEur, quickViewProduct.priceUsd) }}
                </span>
                <span class="text-xs text-rose-400 font-semibold">
                  Save {{ getSavings(quickViewProduct) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-3">
              <button 
                type="button"
                (click)="addToCartWithFeedback(quickViewProduct); closeQuickView()"
                class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-aurora-gold to-amber-500 hover:brightness-110 text-aurora-darker font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-aurora-gold/20 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <span>Add to Atelier Bag</span>
              </button>
              
              <a 
                [routerLink]="['/product', quickViewProduct.slug]"
                (click)="closeQuickView()"
                class="py-3 px-4 rounded-xl bg-aurora-darker hover:bg-aurora-cardHover text-aurora-sand hover:text-white border border-aurora-border text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center">
                Full Specs
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class LandingComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);

  categories: Category[] = [];
  featuredProducts: ProductSummary[] = [];
  onSaleProducts: ProductSummary[] = [];
  activeSaleCategory: string = 'all';
  quickViewProduct: ProductSummary | null = null;
  addedProductId: string | null = null;

  ngOnInit(): void {
    this.productService.getCategories().subscribe(res => {
      this.categories = res.data;
    });

    this.productService.getFeaturedProducts().subscribe(res => {
      this.featuredProducts = res.data;
    });

    this.productService.getOnSaleProducts().subscribe(res => {
      this.onSaleProducts = res.data || [];
    });
  }

  filteredSaleProducts(): ProductSummary[] {
    if (this.activeSaleCategory === 'all') {
      return this.onSaleProducts;
    }
    return this.onSaleProducts.filter(p => p.categorySlug === this.activeSaleCategory);
  }

  scrollCarousel(direction: 'left' | 'right', el: HTMLElement): void {
    const scrollAmount = direction === 'left' ? -360 : 360;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  openQuickView(product: ProductSummary): void {
    this.quickViewProduct = product;
  }

  closeQuickView(): void {
    this.quickViewProduct = null;
  }

  addToCartWithFeedback(product: ProductSummary): void {
    this.cartService.addToCart(product);
    this.addedProductId = product.id;
    setTimeout(() => {
      if (this.addedProductId === product.id) {
        this.addedProductId = null;
      }
    }, 1800);
  }

  getSavings(product: ProductSummary): string {
    const isUsd = this.currencyService.currentCurrency() === 'USD';
    if (isUsd) {
      const orig = product.priceUsd || 0;
      const disc = product.discountedPriceUsd || orig;
      return `$${(orig - disc).toFixed(2)}`;
    } else {
      const orig = product.priceEur || 0;
      const disc = product.discountedPriceEur || orig;
      return `€${(orig - disc).toFixed(2)}`;
    }
  }
}
