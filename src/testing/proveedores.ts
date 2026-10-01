import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

/**
 * Proveedores que casi toda prueba de la intranet necesita.
 *
 * Los servicios usan inject(HttpClient) y los componentes del layout leen
 * la sesión, que a su vez cuelga de ApiService. Sin esto el TestBed falla
 * con "No provider for HttpClient!", que era justo lo que les pasaba a las
 * pruebas generadas por el CLI.
 */
type ProveedorDePrueba = Provider | EnvironmentProviders;

export const proveedoresDePrueba = (
  extra: ProveedorDePrueba[] = []
): ProveedorDePrueba[] => [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
  ...extra,
];

/** Atajo para el controlador que responde las peticiones simuladas */
export const httpSimulado = (): HttpTestingController =>
  TestBed.inject(HttpTestingController);

/**
 * localStorage y sessionStorage de mentira.
 *
 * Karma comparte el almacenamiento entre pruebas, así que una que guarda
 * un token deja contaminada a la siguiente.
 */
export const limpiarAlmacenamiento = (): void => {
  localStorage.clear();
  sessionStorage.clear();
};
