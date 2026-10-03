import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-aurora-dark min-h-screen py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-aurora-card border border-aurora-border rounded-2xl p-8 shadow-2xl space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-gold to-aurora-terracotta flex items-center justify-center mx-auto shadow-lg shadow-aurora-gold/20">
            <span class="font-serif font-bold text-white text-xl">A</span>
          </div>
          <h2 class="font-serif text-2xl font-bold text-white">Collector Access</h2>
          <p class="text-xs text-aurora-sand/60">Manage your orders and private atelier reservations</p>
        </div>

        <!-- Google OAuth2 One-Click Button -->
        <div>
          <button 
            type="button" 
            (click)="authService.loginWithGoogle()"
            class="w-full py-3 px-4 rounded-xl bg-aurora-darker hover:bg-aurora-cardHover border border-aurora-border hover:border-aurora-gold/40 text-xs font-semibold text-white transition-all flex items-center justify-center gap-3">
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <!-- Separator -->
        <div class="relative flex items-center justify-center">
          <div class="border-t border-aurora-border w-full"></div>
          <span class="bg-aurora-card px-3 text-[11px] text-aurora-sand/40 uppercase tracking-widest absolute">Or</span>
        </div>

        <!-- Mode Toggle Tabs (Sign In / Register) -->
        <div class="flex rounded-xl bg-aurora-darker p-1 border border-aurora-border">
          <button 
            type="button"
            (click)="isLoginMode = true; errorMessage = ''"
            class="flex-1 py-2 text-xs font-semibold rounded-lg transition-colors"
            [class.bg-aurora-gold]="isLoginMode"
            [class.text-aurora-darker]="isLoginMode"
            [class.text-aurora-sand]="!isLoginMode"
            [class.opacity-70]="!isLoginMode">
            Sign In
          </button>
          <button 
            type="button"
            (click)="isLoginMode = false; errorMessage = ''"
            class="flex-1 py-2 text-xs font-semibold rounded-lg transition-colors"
            [class.bg-aurora-gold]="!isLoginMode"
            [class.text-aurora-darker]="!isLoginMode"
            [class.text-aurora-sand]="isLoginMode"
            [class.opacity-70]="isLoginMode">
            Create Account
          </button>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
          {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form *ngIf="isLoginMode" [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="space-y-4">
          <div>
            <label class="block text-xs text-aurora-sand/70 mb-1">Email</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="collector@domain.com" 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
          </div>

          <div>
            <label class="block text-xs text-aurora-sand/70 mb-1">Password</label>
            <input 
              type="password" 
              formControlName="password" 
              placeholder="••••••••" 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2.5 cursor-pointer select-none text-aurora-sand/80 hover:text-white transition-colors">
              <input 
                type="checkbox" 
                formControlName="rememberMe" 
                class="w-4 h-4 rounded bg-aurora-darker border-aurora-border text-aurora-gold focus:ring-0 focus:ring-offset-0 transition-colors" />
              <span>Remember me (30-day session persistence)</span>
            </label>
          </div>

          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-aurora-gold to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-lg shadow-aurora-gold/20 flex items-center justify-center gap-2">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Authenticating...</span>
          </button>
        </form>

        <!-- Simplified Registration Form -->
        <form *ngIf="!isLoginMode" [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="space-y-4">
          <div>
            <label class="block text-xs text-aurora-sand/70 mb-1">Email Address *</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="collector@domain.com" 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
          </div>

          <div>
            <label class="block text-xs text-aurora-sand/70 mb-1">Password (Min. 6 chars) *</label>
            <input 
              type="password" 
              formControlName="password" 
              placeholder="••••••••" 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
          </div>

          <div>
            <label class="block text-xs text-aurora-sand/70 mb-1">Confirm Password *</label>
            <input 
              type="password" 
              formControlName="confirmPassword" 
              placeholder="••••••••" 
              class="w-full bg-aurora-darker border border-aurora-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aurora-gold" />
          </div>

          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-aurora-gold to-aurora-goldLight text-aurora-darker font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-lg shadow-aurora-gold/20 flex items-center justify-center gap-2">
            <span *ngIf="!loading">Register Account</span>
            <span *ngIf="loading">Creating Account...</span>
          </button>
        </form>

      </div>
    </div>
  `
})
export class AuthComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoginMode = true;
  loading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true]
  });

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  submitLogin(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
      rememberMe: this.loginForm.value.rememberMe ?? true
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      confirmPassword: this.registerForm.value.confirmPassword!
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try another email.';
      }
    });
  }
}
