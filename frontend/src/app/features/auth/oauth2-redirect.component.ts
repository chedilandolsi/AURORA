import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.authService.handleOAuth2Redirect(token);
    }
  }
}
