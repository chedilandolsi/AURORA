import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { FooterComponent } from './shared/components/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-aurora-dark text-aurora-sand">
      <app-header></app-header>
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
      <app-cart-drawer></app-cart-drawer>
    </div>
  `
})
export class AppComponent {
  title = 'aurora-frontend';
}
