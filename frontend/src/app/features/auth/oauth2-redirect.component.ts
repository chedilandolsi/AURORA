import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-aurora-dark min-h-screen flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="w-12 h-12 border-3 border-aurora-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="font-serif text-lg text-white">Completing Google Authentication...</p>
        <p class="text-xs text-aurora-sand/60">Securing your session in the Aurora Atelier</p>
      </div>
    </div>
  `
})
export class OAuth2RedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const token = params['token'] || params['access_token'] || params['jwt'];
    if (token) {
      this.authService.handleOAuth2Redirect(token);
    } else {
      console.warn('No authentication token found in OAuth2 callback params:', params);
      this.router.navigate(['/auth'], { queryParams: { error: 'oauth_missing_token' } });
    }
  }
}
