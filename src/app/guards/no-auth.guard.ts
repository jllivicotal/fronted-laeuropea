import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para prevenir el acceso a rutas de login/register cuando ya hay sesión activa
 */
export const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();

    // Redirigir según el rol
    if (user?.rol === 'ADMIN' || user?.rol === 'MANAGER') {
      return router.createUrlTree(['/admin/ordenes']);
    } else {
      return router.createUrlTree(['/productos']);
    }
  }

  return true;
};
