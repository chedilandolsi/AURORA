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
    // If token exists, verify and refresh user profile
    if (this.getToken()) {
      this.fetchCurrentUser().subscribe({
        error: (err) => {
          // Only clear session if token is explicitly rejected (401 Unauthorized)
          if (err && err.status === 401) {
            this.logout();
          }
        }
      });
    }
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap(res => this.handleAuthSuccess(res.data, true)));
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    const remember = request.rememberMe ?? false;
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => this.handleAuthSuccess(res.data, remember)));
  }

  loginWithGoogle(): void {
    // Redirect to Spring Boot OAuth2 authorization endpoint
    window.location.href = `${environment.apiUrl.replace('/api', '')}/oauth2/authorization/google`;
  }

  handleOAuth2Redirect(token: string): void {
    // OAuth2 defaults to persistent session
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('aurora_remember_me', 'true');
    this.fetchCurrentUser().subscribe({
      next: (res) => {
        this.currentUser.set(res.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err && err.status === 401) {
          this.logout();
        }
      }
    });
  }

  fetchCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`)
      .pipe(tap(res => {
        this.currentUser.set(res.data);
        if (this.isRememberMe()) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        } else {
          sessionStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      }));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('aurora_remember_me');
    localStorage.removeItem('aurora_token_expiry');

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('aurora_token_expiry');

    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  isRememberMe(): boolean {
    return localStorage.getItem('aurora_remember_me') === 'true';
  }

  private handleAuthSuccess(auth: AuthResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clean up alternative storage to prevent state divergence
    if (rememberMe) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      localStorage.setItem('aurora_remember_me', 'true');
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem('aurora_remember_me');
    }

    storage.setItem(this.TOKEN_KEY, auth.token);
    storage.setItem(this.USER_KEY, JSON.stringify(auth.user));
    if (auth.expiresIn) {
      storage.setItem('aurora_token_expiry', (Date.now() + auth.expiresIn).toString());
    }

    this.currentUser.set(auth.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
