import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { map, of } from 'rxjs';
import { SesionService } from '../core/services/sesion.service';

/**
 * Deja pasar solo con token válido.
 *
 * Antes la verificación contra el servidor se lanzaba sin esperarla y el
 * guard retornaba true de inmediato, así que un token vencido igual entraba
 * hasta que el primer request fallara. Ahora se devuelve el Observable y el
 * router espera la respuesta.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const sesion = inject(SesionService);

  // En SSR no hay localStorage: se deja renderizar y el navegador decide
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!sesion.autenticado) {
    return router.createUrlTree(['/Ingreso']);
  }

  // Si ya se conoce al usuario no hace falta volver a preguntar
  if (sesion.usuario()) {
    return true;
  }

  return sesion.refrescar().pipe(
    map(() => true),
    // El interceptor ya limpió la sesión ante un 401/403
    map(ok => ok || router.createUrlTree(['/Ingreso']))
  );
};
