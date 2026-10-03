import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-aurora-darker text-aurora-sand flex flex-col md:flex-row">
      
      <!-- Admin Sidebar -->
      <aside class="w-full md:w-64 bg-aurora-dark border-r border-aurora-border flex-shrink-0 flex flex-col justify-between">
        <div>
          <!-- Logo & Admin Badge -->
          <div class="p-6 border-b border-aurora-border/60">
            <a routerLink="/" class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-gold to-aurora-terracotta flex items-center justify-center">
                <span class="font-serif font-bold text-white text-base">A</span>
              </div>
              <div>
                <span class="font-serif text-lg font-bold tracking-widest text-white">AURORA</span>
                <span class="block text-[9px] uppercase tracking-widest text-aurora-gold font-sans -mt-1">Atelier Director</span>
              </div>
            </a>
          </div>

          <!-- Navigation Links -->
          <nav class="p-4 space-y-1.5 text-xs font-medium">
            <a 
              routerLink="/admin/analytics" 
              routerLinkActive="bg-aurora-card text-aurora-gold border-aurora-gold/50 shadow-sm" 
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-transparent hover:bg-aurora-card text-aurora-sand/80 hover:text-white transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Sales &amp; Revenue Analytics</span>
            </a>

            <a 
              routerLink="/admin/products" 
              routerLinkActive="bg-aurora-card text-aurora-gold border-aurora-gold/50 shadow-sm" 
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-transparent hover:bg-aurora-card text-aurora-sand/80 hover:text-white transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Mask Catalog &amp; Inventory</span>
            </a>

            <div class="pt-4 mt-4 border-t border-aurora-border/40">
              <a 
                routerLink="/" 
                class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-aurora-card text-aurora-sand/60 hover:text-aurora-gold transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Storefront View</span>
              </a>
            </div>
          </nav>
        </div>

        <!-- Admin Profile Footer -->
        <div class="p-4 border-t border-aurora-border/60 bg-aurora-darker/60">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-aurora-card border border-aurora-gold/50 flex items-center justify-center text-xs font-bold text-aurora-gold">
                A
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-white truncate">{{ authService.currentUser()?.fullName || 'Atelier Admin' }}</p>
                <p class="text-[10px] text-aurora-gold font-mono truncate">ROLE_ADMIN</p>
              </div>
            </div>

            <button 
              (click)="authService.logout()" 
              class="text-aurora-sand/50 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
              title="Sign Out">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

      </aside>

      <!-- Main Admin Content Area -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
}
