import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'aurora_token';
  private readonly USER_KEY = 'aurora_user';

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // If token exists, optionally fetch fresh profile
    if (this.getToken()) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap(res => this.handleAuthSuccess(res.data)));
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => this.handleAuthSuccess(res.data)));
  }

  loginWithGoogle(): void {
    // Redirect to Spring Boot OAuth2 authorization endpoint
    window.location.href = `${environment.apiUrl.replace('/api', '')}/oauth2/authorization/google`;
  }

  handleOAuth2Redirect(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.fetchCurrentUser().subscribe({
      next: (res) => {
        this.currentUser.set(res.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        this.router.navigate(['/']);
      },
      error: () => this.logout()
    });
  }

  fetchCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`)
      .pipe(tap(res => {
        this.currentUser.set(res.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
      }));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(auth: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, auth.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
    this.currentUser.set(auth.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
