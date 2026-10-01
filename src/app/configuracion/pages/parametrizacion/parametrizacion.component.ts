import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ConfiguracionService,
  PlataformaGuardada,
} from '../../../services/configuracion/parametrizacion.service';

@Component({
  selector: 'app-parametrizacion',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './parametrizacion.component.html',
  styleUrl: './parametrizacion.component.css',
})
export class ParametrizacionComponent implements OnInit {
  private configuracionService = inject(ConfiguracionService);

  isActive = false;
  isEditable = false;
  guardando = false;

  /** Mensaje para el administrador: antes todo iba a la consola */
  mensaje = '';
  error = '';

  // Variables del formulario
  logo = '';
  favicon = '';
  color = '';
  path = '';
  idioma = '';
  caducidad = '';
  longitudminimapass = '';
  maximointentos = '';
  carousel = '';
  dashboard = '';
  autenticacion = '';
  tiemposesion = '';
  emailsoporte = '';
  sitionombre = '';
  Mantenimiento = '';

  ngOnInit(): void {
    // El formulario arrancaba vacío y guardar borraba lo que ya estaba
    this.configuracionService.obtener().subscribe({
      next: plataforma => this.pintar(plataforma),
      // 404 = la plataforma todavía no se parametrizó, no es un error
      error: () => undefined,
    });
  }

  PlatformCall(): void {
    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    this.configuracionService
      .updatePlatform({
        logo: this.logo,
        color: this.color,
        path: this.path,
        caducidad: this.caducidad,
        longitudminimapass: this.longitudminimapass,
        carousel: this.carousel,
        dashboard: this.dashboard,
        autenticacion: this.autenticacion,
        tiemposesion: this.tiemposesion,
        emailsoporte: this.emailsoporte,
        sitionombre: this.sitionombre,
        favicon: this.favicon,
        Mantenimiento: this.Mantenimiento,
        maximointentos: this.maximointentos,
      })
      .subscribe({
        next: plataforma => {
          this.pintar(plataforma);
          this.mensaje = 'Parametrización guardada';
          this.guardando = false;
          this.isEditable = false;
        },
        error: (err: Error) => {
          this.error = err.message;
          this.guardando = false;
        },
      });
  }

  // La tabla usa nombres de columna; el formulario, los suyos
  private pintar(plataforma: PlataformaGuardada): void {
    if (!plataforma) return;

    this.logo = plataforma.logo_url ?? '';
    this.favicon = plataforma.favicon_url ?? '';
    this.color = plataforma.color_hex ?? '';
    this.path = plataforma.ruta_almacenamiento ?? '';
    this.idioma = plataforma.idioma ?? '';
    this.sitionombre = plataforma.nombre_sitio ?? '';
    this.emailsoporte = plataforma.email_soporte ?? '';
    this.tiemposesion = this.aTexto(plataforma.tiempo_sesion_minutos);
    this.caducidad = this.aTexto(plataforma.pass_caducidad_dias);
    this.longitudminimapass = this.aTexto(plataforma.pass_longitud_minima);
    this.maximointentos = this.aTexto(plataforma.max_intentos_login);
    this.autenticacion = this.aTexto(plataforma.requiere_autenticacion);
    this.dashboard = this.aTexto(plataforma.mostrar_dashboard);
    this.carousel = this.aTexto(plataforma.mostrar_carousel);
    this.Mantenimiento = this.aTexto(plataforma.modo_mantenimiento);
    this.isActive = !!plataforma.modo_mantenimiento;
  }

  private aTexto(valor: number | boolean | null | undefined): string {
    return valor === null || valor === undefined ? '' : String(valor);
  }

  modulos = [
    { nombre: 'Mejoramiento continuo', activo: false },
    { nombre: 'Consultas', activo: false },
    { nombre: 'Auditorías', activo: false },
    { nombre: 'Recursos Humanos', activo: false },
    { nombre: 'SGSST', activo: false },
    { nombre: 'Proveedores', activo: false },
  ];

  toggleEdit(): void {
    this.isEditable = !this.isEditable;
  }

  toggleModulo(modulo: { nombre: string; activo: boolean }): void {
    modulo.activo = !modulo.activo;
  }
}
