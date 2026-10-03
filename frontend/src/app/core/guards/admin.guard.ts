import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (user && user.role === 'ROLE_ADMIN') {
    return true;
  }

  // Not authorized as admin
  return router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url, error: 'admin_required' } });
};
