import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Top Announcement Bar -->
    <div class="bg-gradient-to-r from-aurora-darker via-aurora-card to-aurora-darker border-b border-aurora-border/40 py-2 px-4 text-xs text-center text-aurora-sand/90 tracking-wider">
      <span class="inline-flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-aurora-gold animate-pulse"></span>
        <span>Worldwide DHL Express Courier from Tunisia — <strong>Complimentary delivery</strong> on orders over {{ currencyService.currentCurrency() === 'EUR' ? '€200' : '$200' }}</span>
        <span class="hidden md:inline text-aurora-gold/80">| Authenticity Certificate Included</span>
      </span>
    </div>

    <!-- Main Navigation Bar -->
    <header class="sticky top-0 z-40 bg-aurora-dark/95 backdrop-blur-md border-b border-aurora-border/60 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">

          <!-- Mobile Menu Trigger -->
          <div class="flex items-center lg:hidden">
            <button (click)="mobileMenuOpen = !mobileMenuOpen" class="text-aurora-sand p-2 hover:text-aurora-gold transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
                <path *ngIf="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Brand Logo -->
          <div class="flex-shrink-0 flex items-center gap-3">
            <a routerLink="/" class="group flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-aurora-gold via-aurora-terracotta to-aurora-darker flex items-center justify-center shadow-lg shadow-aurora-gold/10 group-hover:scale-105 transition-transform duration-300">
                <span class="font-serif font-black text-xl text-white tracking-widest">A</span>
              </div>
              <div class="flex flex-col">
                <span class="font-serif text-2xl font-bold tracking-[0.25em] text-white group-hover:text-aurora-gold transition-colors">AURORA</span>
                <span class="text-[9px] uppercase tracking-[0.3em] text-aurora-gold/90 -mt-1 font-sans">Artisanal Atelier</span>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation Links -->
          <nav class="hidden lg:flex items-center space-x-8 font-sans text-sm font-medium tracking-wide">
            <a routerLink="/" routerLinkActive="text-aurora-gold font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-aurora-sand/80 hover:text-aurora-gold transition-colors py-1">Atelier</a>
            <a routerLink="/catalog" routerLinkActive="text-aurora-gold font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-aurora-sand/80 hover:text-aurora-gold transition-colors py-1">All Masks</a>
            <a routerLink="/catalog" [queryParams]="{category: 'abstract'}" class="text-aurora-sand/80 hover:text-aurora-gold transition-colors py-1">Abstract</a>
            <a routerLink="/catalog" [queryParams]="{category: 'animals'}" class="text-aurora-sand/80 hover:text-aurora-gold transition-colors py-1">Animals</a>
            <a routerLink="/catalog" [queryParams]="{category: 'people'}" class="text-aurora-sand/80 hover:text-aurora-gold transition-colors py-1">People</a>
            <a *ngIf="authService.currentUser()?.role === 'ROLE_ADMIN'" routerLink="/admin/analytics" class="px-3 py-1 rounded-full bg-aurora-card border border-aurora-gold/60 text-xs font-semibold text-aurora-gold hover:bg-aurora-gold hover:text-aurora-darker transition-all flex items-center gap-1.5 shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-aurora-gold animate-ping"></span>
              <span>Director Portal</span>
            </a>
          </nav>

          <!-- Right Action Controls -->
          <div class="flex items-center space-x-3 sm:space-x-5">

            <!-- Currency Selector (EUR / USD) -->
            <button 
              (click)="currencyService.toggleCurrency()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-aurora-border bg-aurora-card/60 hover:border-aurora-gold/50 text-xs font-semibold text-aurora-gold transition-colors"
              title="Toggle Currency (EUR/USD)">
              <span class="text-aurora-sand/70">Currency:</span>
              <span class="font-bold underline decoration-aurora-gold">{{ currencyService.currentCurrency() }}</span>
            </button>

            <!-- User Auth Profile / Login Button -->
            <div class="relative">
              <ng-container *ngIf="authService.currentUser() as user; else loginButton">
                <div class="flex items-center gap-2">
                  <button 
                    (click)="userMenuOpen = !userMenuOpen"
                    class="flex items-center gap-2 p-1.5 rounded-full hover:bg-aurora-card transition-colors">
                    <img 
                      *ngIf="user.avatarUrl" 
                      [src]="user.avatarUrl" 
                      [alt]="user.fullName" 
                      class="w-8 h-8 rounded-full border border-aurora-gold/40 object-cover" />
                    <div *ngIf="!user.avatarUrl" class="w-8 h-8 rounded-full bg-aurora-card border border-aurora-gold/40 flex items-center justify-center text-xs font-bold text-aurora-gold">
                      {{ user.firstName ? user.firstName.charAt(0) : 'U' }}
                    </div>
                  </button>

                  <!-- User Dropdown Menu -->
                  <div *ngIf="userMenuOpen" class="absolute right-0 top-full mt-2 w-56 bg-aurora-card border border-aurora-border rounded-xl shadow-2xl py-2 z-50">
                    <div class="px-4 py-2 border-b border-aurora-border/50">
                      <p class="text-xs text-aurora-sand/60">Signed in as</p>
                      <p class="text-sm font-semibold text-aurora-gold truncate">{{ user.email }}</p>
                    </div>
                    <a *ngIf="user.role === 'ROLE_ADMIN'" routerLink="/admin/analytics" (click)="userMenuOpen = false" class="block px-4 py-2 text-sm text-aurora-gold font-semibold hover:bg-aurora-cardHover">Atelier Director Portal</a>
                    <button (click)="authService.logout(); userMenuOpen = false" class="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-aurora-cardHover">
                      Sign Out
                    </button>
                  </div>
                </div>
              </ng-container>

              <ng-template #loginButton>
                <a routerLink="/auth" class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-aurora-sand hover:text-aurora-gold font-medium py-1.5 px-3 rounded-lg border border-transparent hover:border-aurora-border transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="hidden sm:inline">Sign In</span>
                </a>
              </ng-template>
            </div>

            <!-- Cart Drawer Button with Bounce Animation (Hidden for Admins) -->
            <button 
              *ngIf="authService.currentUser()?.role !== 'ROLE_ADMIN'"
              (click)="cartService.toggleDrawer()"
              class="relative p-2.5 rounded-full bg-aurora-card border border-aurora-border hover:border-aurora-gold/60 text-aurora-sand hover:text-aurora-gold transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span *ngIf="cartService.itemCount() > 0" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-aurora-gold text-aurora-darker text-[11px] font-bold flex items-center justify-center shadow-lg animate-bounce">
                {{ cartService.itemCount() }}
              </span>
            </button>

          </div>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div *ngIf="mobileMenuOpen" class="lg:hidden border-t border-aurora-border bg-aurora-darker/95 px-4 pt-3 pb-6 space-y-3">
        <a routerLink="/" (click)="mobileMenuOpen = false" class="block py-2 text-base font-medium text-aurora-sand hover:text-aurora-gold">Atelier Home</a>
        <a routerLink="/catalog" (click)="mobileMenuOpen = false" class="block py-2 text-base font-medium text-aurora-sand hover:text-aurora-gold">All Masks Catalog</a>
        <a routerLink="/catalog" [queryParams]="{category: 'abstract'}" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-aurora-sand/70 pl-3 border-l-2 border-aurora-gold/40">Abstract Masks</a>
        <a routerLink="/catalog" [queryParams]="{category: 'animals'}" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-aurora-sand/70 pl-3 border-l-2 border-aurora-gold/40">Animal Spirit Masks</a>
        <a routerLink="/catalog" [queryParams]="{category: 'people'}" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-aurora-sand/70 pl-3 border-l-2 border-aurora-gold/40">People &amp; Ancestral Masks</a>
        <a *ngIf="authService.currentUser()?.role === 'ROLE_ADMIN'" routerLink="/admin/analytics" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-aurora-gold font-semibold">Atelier Director Portal</a>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);

  mobileMenuOpen = false;
  userMenuOpen = false;
}
