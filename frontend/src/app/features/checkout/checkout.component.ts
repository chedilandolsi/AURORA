import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CurrencyService } from '../../core/services/currency.service';
import { StripeService } from '../../core/services/stripe.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateCheckoutSessionRequest } from '../../core/models/order.models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, ImageUrlPipe],
  template: `
    <div class="bg-aurora-dark min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Breadcrumbs -->
        <div class="mb-10 text-center sm:text-left">
          <div class="text-xs text-aurora-sand/60 mb-2">
            <a routerLink="/" class="hover:text-aurora-gold">Atelier</a> / 
            <a routerLink="/cart" class="hover:text-aurora-gold">Cart</a> / 
            <span class="text-aurora-gold">Secure Checkout</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">Express International Checkout</h1>
          <p class="text-xs sm:text-sm text-aurora-sand/70 mt-1">
            Insured DHL courier dispatch from Tunisia directly to your address in Europe or the USA.
          </p>
        </div>

        <!-- Empty Cart Safeguard -->
        <div *ngIf="cartService.items().length === 0" class="text-center py-20 bg-aurora-card rounded-2xl border border-aurora-border p-8">
          <h3 class="font-serif text-xl text-white font-semibold">Your Atelier Cart is Empty</h3>
          <p class="text-xs text-aurora-sand/60 mt-2 mb-6">Select a handcrafted mask from our catalog to proceed with checkout.</p>
          <a routerLink="/catalog" class="px-6 py-3 rounded-xl bg-aurora-gold text-aurora-darker font-bold text-xs uppercase tracking-wider">
            Explore Catalog
          </a>
        </div>

        <!-- Checkout Layout -->
        <div *ngIf="cartService.items().length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Left: Shipping & Customer Form (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            <form [formGroup]="checkoutForm" (ngSubmit)="submitCheckout()" class="space-y-6">
              
              <!-- Contact Details -->
              <div class="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-aurora-border/60">
                  <div class="w-6 h-6 rounded-full bg-aurora-darker text-aurora-gold flex items-center justify-center text-xs font-bold">1</div>
                  <h3 class="font-serif text-base font-semibold text-white">Collector Contact Details</h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-aurora-sand/70 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      formControlName="customerName" 
                      placeholder="e.g. Julian Vance" 
                      class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                    <span *ngIf="isInvalid('customerName')" class="text-[11px] text-rose-400 mt-1 block">Full name is required</span>
                  </div>

                  <div>
                    <label class="block text-xs text-aurora-sand/70 mb-1">Email Address (Order Confirmation) *</label>
                    <input 
                      type="email" 
                      formControlName="customerEmail" 
                      placeholder="julian.vance@design.com" 
                      class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                    <span *ngIf="isInvalid('customerEmail')" class="text-[11px] text-rose-400 mt-1 block">Valid email is required</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-aurora-sand/70 mb-1">Mobile Phone (For DHL Courier Delivery Alert)</label>
                  <input 
                    type="tel" 
                    formControlName="customerPhone" 
                    placeholder="+1 (212) 555-0199 or +33 6 12 34 56 78" 
                    class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                </div>
              </div>

              <!-- Shipping Address -->
              <div class="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-aurora-border/60">
                  <div class="w-6 h-6 rounded-full bg-aurora-darker text-aurora-gold flex items-center justify-center text-xs font-bold">2</div>
                  <h3 class="font-serif text-base font-semibold text-white">Delivery Destination (Europe &amp; USA)</h3>
                </div>

                <div>
                  <label class="block text-xs text-aurora-sand/70 mb-1">Country *</label>
                  <select 
                    formControlName="shippingCountry" 
                    class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold">
                    <option value="United States">United States</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Italy">Italy</option>
                    <option value="Spain">Spain</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Canada">Canada</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-aurora-sand/70 mb-1">Street Address *</label>
                  <input 
                    type="text" 
                    formControlName="shippingAddressLine1" 
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B" 
                    class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                  <span *ngIf="isInvalid('shippingAddressLine1')" class="text-[11px] text-rose-400 mt-1 block">Street address is required</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs text-aurora-sand/70 mb-1">City *</label>
                    <input 
                      type="text" 
                      formControlName="shippingCity" 
                      placeholder="New York / Paris" 
                      class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                    <span *ngIf="isInvalid('shippingCity')" class="text-[11px] text-rose-400 mt-1 block">City required</span>
                  </div>

                  <div>
                    <label class="block text-xs text-aurora-sand/70 mb-1">State / Province</label>
                    <input 
                      type="text" 
                      formControlName="shippingState" 
                      placeholder="NY / Île-de-France" 
                      class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                  </div>

                  <div>
                    <label class="block text-xs text-aurora-sand/70 mb-1">Postal Code *</label>
                    <input 
                      type="text" 
                      formControlName="shippingPostalCode" 
                      placeholder="10001 or 75001" 
                      class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
                    <span *ngIf="isInvalid('shippingPostalCode')" class="text-[11px] text-rose-400 mt-1 block">Postal code required</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-aurora-sand/70 mb-1">Courier Delivery Instructions (Optional)</label>
                  <textarea 
                    formControlName="notes" 
                    rows="2" 
                    placeholder="Leave with concierge, gate security code, fragile art handling..." 
                    class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-aurora-gold"></textarea>
                </div>
              </div>

              <!-- Payment Method Overview -->
              <div class="bg-aurora-card border border-aurora-border rounded-2xl p-6 space-y-3">
                <div class="flex items-center gap-2 pb-3 border-b border-aurora-border/60">
                  <div class="w-6 h-6 rounded-full bg-aurora-darker text-aurora-gold flex items-center justify-center text-xs font-bold">3</div>
                  <h3 class="font-serif text-base font-semibold text-white">Encrypted Stripe Checkout</h3>
                </div>

                <p class="text-xs text-aurora-sand/70">
                  You will be securely redirected to Stripe's hosted PCI-DSS compliant checkout session. We support international cards (Visa, MasterCard, Amex), Apple Pay, Google Pay, and European direct debit.
                </p>

                <div class="flex items-center gap-3 pt-2 text-xs text-aurora-sand/50">
                  <span class="px-2 py-1 bg-aurora-darker rounded border border-aurora-border">🔒 256-bit TLS</span>
                  <span class="px-2 py-1 bg-aurora-darker rounded border border-aurora-border">Direct Wise Payout</span>
                  <span class="px-2 py-1 bg-aurora-darker rounded border border-aurora-border">DHL Express Courier</span>
                </div>
              </div>

              <!-- Error Message if API fails -->
              <div *ngIf="errorMessage" class="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {{ errorMessage }}
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                [disabled]="submitting"
                class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aurora-gold via-amber-400 to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-aurora-gold/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <span *ngIf="!submitting">Pay {{ cartService.formattedTotal() }} via Stripe</span>
                <span *ngIf="submitting">Connecting to Secure Stripe Gateway...</span>
                <div *ngIf="submitting" class="w-4 h-4 border-2 border-aurora-darker border-t-transparent rounded-full animate-spin"></div>
              </button>
            </form>
          </div>

          <!-- Right: Order Summary Sidebar (5 cols) -->
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-aurora-card border border-aurora-border rounded-2xl p-6 sticky top-28 space-y-6">
              
              <div class="flex items-center justify-between pb-4 border-b border-aurora-border/60">
                <h3 class="font-serif text-lg font-bold text-white">Order Summary</h3>
                <span class="text-xs text-aurora-gold font-mono">{{ cartService.itemCount() }} pieces</span>
              </div>

              <!-- Items list -->
              <div class="space-y-4 max-h-72 overflow-y-auto pr-1">
                <div *ngFor="let item of cartService.items()" class="flex gap-3">
                  <img 
                    [src]="item.product | imageUrl" 
                    [alt]="item.product.name" 
                    (error)="$any($event.target).src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'"
                    class="w-16 h-20 object-cover rounded-lg border border-aurora-border flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-serif text-xs font-semibold text-white truncate">{{ item.product.name }}</h4>
                    <p class="text-[11px] text-aurora-sand/50 truncate">{{ item.product.woodType }}</p>
                    <div class="flex justify-between items-center mt-2 text-xs">
                      <span class="text-aurora-sand/60">Qty: {{ item.quantity }}</span>
                      <span class="font-semibold text-aurora-gold">
                        {{ currencyService.formatPrice(item.product.discountedPriceEur * item.quantity, item.product.discountedPriceUsd * item.quantity) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Calculations -->
              <div class="space-y-2 pt-4 border-t border-aurora-border/60 text-xs">
                <div class="flex justify-between text-aurora-sand/70">
                  <span>Subtotal</span>
                  <span class="text-white font-medium">{{ cartService.formattedSubtotal() }}</span>
                </div>
                <div class="flex justify-between text-aurora-sand/70">
                  <span>DHL Express Courier</span>
                  <span class="font-medium" [class.text-emerald-400]="cartService.formattedShipping() === 'FREE'" [class.text-white]="cartService.formattedShipping() !== 'FREE'">
                    {{ cartService.formattedShipping() }}
                  </span>
                </div>
                <div class="flex justify-between text-base font-serif font-bold text-white pt-2 border-t border-aurora-border/40">
                  <span>Total Due</span>
                  <span class="text-aurora-gold">{{ cartService.formattedTotal() }}</span>
                </div>
              </div>

              <!-- Authenticity Badge -->
              <div class="p-4 rounded-xl bg-aurora-darker border border-aurora-border/60 flex items-start gap-3">
                <div class="text-aurora-gold text-lg">🛡️</div>
                <div class="text-[11px] text-aurora-sand/70 leading-relaxed">
                  Every mask in this shipment will be accompanied by an official Certificate of Authenticity signed by the master carver in Kairouan.
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  readonly currencyService = inject(CurrencyService);
  private readonly stripeService = inject(StripeService);
  private readonly authService = inject(AuthService);

  submitting = false;
  errorMessage = '';

  checkoutForm = this.fb.group({
    customerName: [this.authService.currentUser()?.fullName || '', [Validators.required]],
    customerEmail: [this.authService.currentUser()?.email || '', [Validators.required, Validators.email]],
    customerPhone: [''],
    shippingCountry: ['United States', [Validators.required]],
    shippingAddressLine1: ['', [Validators.required]],
    shippingAddressLine2: [''],
    shippingCity: ['', [Validators.required]],
    shippingState: [''],
    shippingPostalCode: ['', [Validators.required]],
    notes: ['']
  });

  isInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submitCheckout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formVal = this.checkoutForm.value;

    const request: CreateCheckoutSessionRequest = {
      currency: this.currencyService.currentCurrency(),
      items: this.cartService.items().map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      })),
      customerName: formVal.customerName!,
      customerEmail: formVal.customerEmail!,
      customerPhone: formVal.customerPhone || undefined,
      shippingCountry: formVal.shippingCountry!,
      shippingAddressLine1: formVal.shippingAddressLine1!,
      shippingAddressLine2: formVal.shippingAddressLine2 || undefined,
      shippingCity: formVal.shippingCity!,
      shippingState: formVal.shippingState || undefined,
      shippingPostalCode: formVal.shippingPostalCode!,
      notes: formVal.notes || undefined
    };

    this.stripeService.createCheckoutSession(request).subscribe({
      next: (res) => {
        // Clear cart and redirect to Stripe hosted checkout page
        this.cartService.clearCart();
        this.stripeService.redirectToCheckout(res.data.checkoutUrl);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to initiate secure Stripe checkout. Please try again.';
      }
    });
  }
}
