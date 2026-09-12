import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SesionService } from '../core/services/sesion.service';

/**
 * Rutas de creación y edición: solo admin o editor.
 * El backend lo vuelve a validar; esto es para no mostrar formularios
 * que van a terminar en un 403.
 */
export const publicadorGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  return sesion.puedePublicar() ? true : router.createUrlTree(['/Inicio']);
};
