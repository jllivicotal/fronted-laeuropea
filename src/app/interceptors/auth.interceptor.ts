import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Lista de rutas que NO requieren autenticación (métodos GET públicos)
  const publicGetEndpoints = [
    '/api/productos',
    '/api/ordenes'
  ];

  // Verificar si es un método GET y si la ruta es pública
  const isPublicGet = req.method === 'GET' &&
    publicGetEndpoints.some(endpoint => req.url.includes(endpoint));

  // Si existe token Y NO es una petición GET pública, agregarlo al header
  if (token && !isPublicGet) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
