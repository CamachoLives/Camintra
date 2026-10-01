import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SesionService } from '../core/services/sesion.service';

/**
 * Pantallas de administración: solo rol admin.
 *
 * /configuracion colgaba únicamente del authGuard, así que cualquier
 * colaborador podía entrar al panel de usuarios y al formulario de
 * parametrización. El backend ya rechaza esas operaciones con 403; esto
 * evita además mostrar pantallas que no se pueden usar.
 */
export const adminGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  return sesion.esAdmin() ? true : router.createUrlTree(['/Inicio']);
};
