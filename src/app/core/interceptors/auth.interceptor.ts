import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const TOKEN_KEY = 'authToken';

/**
 * Adjunta el token a cada petición y saca al usuario si el backend
 * responde 401/403.
 *
 * Antes cada servicio leía el token por su cuenta -- y varios lo buscaban
 * en la clave 'token' mientras el login lo guardaba en 'authToken', así que
 * salían sin Authorization. Centralizarlo aquí acaba con esa discrepancia.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // En SSR no hay localStorage: la petición sale sin token
  const token = isPlatformBrowser(platformId)
    ? localStorage.getItem(TOKEN_KEY)
    : null;

  const autenticada = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(autenticada).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login');

      if (!esLogin && (error.status === 401 || error.status === 403)) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem('userData');
          router.navigate(['/Ingreso']);
        }
      }

      return throwError(() => error);
    })
  );
};
