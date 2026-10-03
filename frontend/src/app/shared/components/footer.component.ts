import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-aurora-darker border-t border-aurora-border text-aurora-sand/80 pt-16 pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Trust & Value Pillars -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-aurora-border/60">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-aurora-card border border-aurora-gold/30 flex items-center justify-center text-aurora-gold flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 class="font-serif text-sm font-semibold text-white">Certificate of Origin</h4>
              <p class="text-xs text-aurora-sand/60 mt-1">Every mask bears an inscribed artisan hallmark and numbered provenance certificate.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-aurora-card border border-aurora-gold/30 flex items-center justify-center text-aurora-gold flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-serif text-sm font-semibold text-white">Century-Old Olive Wood</h4>
              <p class="text-xs text-aurora-sand/60 mt-1">Sustainably salvaged from non-bearing ancient olive roots in Sfax and Kairouan.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-aurora-card border border-aurora-gold/30 flex items-center justify-center text-aurora-gold flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-serif text-sm font-semibold text-white">DHL Express Worldwide</h4>
              <p class="text-xs text-aurora-sand/60 mt-1">Customs-cleared, insured 3-5 day transit to USA, UK, and European destinations.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-aurora-card border border-aurora-gold/30 flex items-center justify-center text-aurora-gold flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h4 class="font-serif text-sm font-semibold text-white">Stripe &amp; Wise Protected</h4>
              <p class="text-xs text-aurora-sand/60 mt-1">Encrypted international payment processing with direct artisan payout rails.</p>
            </div>
          </div>
        </div>

        <!-- Links and Brand Story -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          
          <div class="md:col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-md bg-gradient-to-br from-aurora-gold to-aurora-darker flex items-center justify-center">
                <span class="font-serif font-bold text-white text-base">A</span>
              </div>
              <span class="font-serif text-xl font-bold tracking-[0.2em] text-white">AURORA</span>
            </div>
            <p class="text-xs text-aurora-sand/70 leading-relaxed max-w-sm">
              Aurora preserves the sacred carving traditions of North Africa. We bridge generational master woodcarvers with contemporary architecture collectors across the Mediterranean and North America.
            </p>
            <div class="pt-2 text-[11px] text-aurora-sand/50">
              Atelier: Sidi Bou Said &amp; Kairouan, Tunisia • Direct Exports to USA &amp; EU
            </div>
          </div>

          <div>
            <h5 class="font-serif text-sm font-semibold text-white tracking-wider mb-4 uppercase">Collections</h5>
            <ul class="space-y-2 text-xs text-aurora-sand/70">
              <li><a routerLink="/catalog" [queryParams]="{category: 'tribal-masks'}" class="hover:text-aurora-gold transition-colors">Tribal Ancestral</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category: 'modern-minimalist'}" class="hover:text-aurora-gold transition-colors">Modern Minimalist</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category: 'wall-sculptures'}" class="hover:text-aurora-gold transition-colors">Wall Sculptures</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category: 'ceremonial'}" class="hover:text-aurora-gold transition-colors">Ceremonial Relics</a></li>
              <li><a routerLink="/catalog" class="hover:text-aurora-gold transition-colors">All Masterpieces</a></li>
            </ul>
          </div>

          <div>
            <h5 class="font-serif text-sm font-semibold text-white tracking-wider mb-4 uppercase">Client Care</h5>
            <ul class="space-y-2 text-xs text-aurora-sand/70">
              <li><a routerLink="/cart" class="hover:text-aurora-gold transition-colors">Cart &amp; Checkout</a></li>
              <li><span class="hover:text-aurora-gold transition-colors cursor-pointer">Shipping &amp; Customs</span></li>
              <li><span class="hover:text-aurora-gold transition-colors cursor-pointer">Artisan Wood Care</span></li>
              <li><span class="hover:text-aurora-gold transition-colors cursor-pointer">Authenticity Guarantee</span></li>
            </ul>
          </div>

          <div>
            <h5 class="font-serif text-sm font-semibold text-white tracking-wider mb-4 uppercase">Atelier Gazette</h5>
            <p class="text-xs text-aurora-sand/70 mb-3">Receive private previews of limited edition wood releases.</p>
            <div class="flex gap-2">
              <input 
                type="email" 
                placeholder="collector@domain.com" 
                class="bg-aurora-card border border-aurora-border rounded-lg px-3 py-2 text-xs text-white placeholder-aurora-sand/40 focus:outline-none focus:border-aurora-gold w-full" />
              <button class="px-3 py-2 bg-aurora-gold text-aurora-darker font-semibold rounded-lg text-xs hover:bg-aurora-goldLight transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Copyright & Badges -->
        <div class="border-t border-aurora-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-aurora-sand/50 gap-4">
          <p>© 2026 Aurora Artisanal Atelier. All rights reserved. Handcrafted in Tunisia.</p>
          <div class="flex items-center gap-4 text-aurora-sand/40 text-[11px]">
            <span>Secured with Stripe</span>
            <span>•</span>
            <span>Wise Payout Rails</span>
            <span>•</span>
            <span>DHL Express Global</span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {}
