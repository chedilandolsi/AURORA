import { Injectable, signal, computed } from '@angular/core';
import { Currency } from '../models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly STORAGE_KEY = 'aurora_currency';
  
  readonly currentCurrency = signal<Currency>(this.getInitialCurrency());

  readonly symbol = computed(() => this.currentCurrency() === 'EUR' ? '€' : '$');

  private getInitialCurrency(): Currency {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return (saved === 'USD' || saved === 'EUR') ? saved : 'EUR';
  }

  setCurrency(currency: Currency): void {
    this.currentCurrency.set(currency);
    localStorage.setItem(this.STORAGE_KEY, currency);
  }

  toggleCurrency(): void {
    const next = this.currentCurrency() === 'EUR' ? 'USD' : 'EUR';
    this.setCurrency(next);
  }

  formatPrice(priceEur: number, priceUsd: number): string {
    if (this.currentCurrency() === 'USD') {
      return `$${priceUsd.toFixed(2)}`;
    }
    return `€${priceEur.toFixed(2)}`;
  }
}
