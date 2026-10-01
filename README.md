# Camintra — Intranet

Portal interno de Camintra. Angular 19 con SSR, Tailwind y componentes
standalone. Consume la API de
[RestCamintra](https://github.com/CamachoLives/RestCamintra).

## Qué tiene

| Módulo | Ruta | Qué hace |
| --- | --- | --- |
| Inicio | `/Inicio` | Portada con indicadores, últimos comunicados, agenda, wiki reciente y personas por área |
| Comunicados | `/comunicados` | Tablón de noticias con categorías, prioridades, fijados y control de leídos |
| Calendario | `/calendario` | Agenda corporativa sobre FullCalendar |
| Directorio | `/directorio` | Quién es quién: cargo, área, extensión, sede y jefe |
| Wiki | `/wiki` | Documentos internos con categorías, etiquetas y versionado |
| Configuración | `/configuracion` | Parametrización de la plataforma y gestión de usuarios |
| Ingreso | `/Ingreso` | Inicio de sesión y registro |

## Roles

El rol viaja en el JWT y se lee desde `SesionService`.

- **admin** — todo, incluida la gestión de usuarios y cualquier ficha del
  directorio.
- **editor** — publica comunicados, eventos y documentos, pero solo edita
  y borra los suyos.
- **colaborador** — consulta todo y edita su propia ficha.

Los guards (`authGuard`, `publicadorGuard`) solo evitan mostrar pantallas
inútiles: el permiso real lo valida el backend en cada petición.

## Arrancar

```bash
npm install
npm start            # http://localhost:4200
```

Necesita RestCamintra corriendo en `http://localhost:7000`.

```bash
npm run build        # producción
npm run serve:ssr:Camintra
```

## Pruebas

```bash
npm test             # modo vigilancia, abre Chrome
npm run test:ci      # una sola pasada, sin ventana, con cobertura
```

Las pruebas corren en Karma + Jasmine y no tocan el backend: usan
`provideHttpClientTesting`, así que se puede ejecutar la suite sin tener
RestCamintra levantado.

`src/testing/proveedores.ts` reúne los proveedores que casi toda prueba
necesita (cliente HTTP simulado y router). Una prueba nueva empieza así:

```ts
import { proveedoresDePrueba } from '../../testing/proveedores';

TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
```

El orden de ejecución es aleatorio a propósito (`karma.conf.js`): si una
prueba depende de otra, falla. Para eso está `limpiarAlmacenamiento()`,
que borra `localStorage` y `sessionStorage` entre casos.

Qué está cubierto hoy: `ApiService`, `SesionService`, el
`authInterceptor`, los tres guards, el servicio de parametrización y los
servicios de comunicados, wiki, directorio, calendario y notificaciones.
## Configuración

`src/environments/environment.development.ts` apunta a
`http://localhost:7000/api`; el de producción usa `/api`. El reemplazo lo
hace `angular.json` según la configuración de build, así que no hay URLs
quemadas en los servicios.

## Cómo está organizado

```
src/app/
  core/              Interceptor, ApiService, SesionService y modelos
  testing/           Proveedores compartidos para las pruebas
  comunicados/       Listado, detalle y editor
  calendario/        Agenda
  directorio/        Colaboradores
  wiki/              Documentos
  Inicio/            Portada
  configuracion/     Parametrización y usuarios
  shared/            Layout, sidebar, header, footer
  guards/            authGuard, adminGuard y publicadorGuard
```

Cada módulo de negocio tiene su servicio, que habla con el backend a
través de `ApiService`. `ApiService` desempaca el sobre
`{ success, message, data }` y el `authInterceptor` se encarga del token,
así que ningún componente arma cabeceras a mano.
