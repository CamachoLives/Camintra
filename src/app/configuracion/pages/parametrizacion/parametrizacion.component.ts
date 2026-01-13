import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ConfiguracionService } from '../../../services/configuracion/parametrizacion.service';

@Component({
  selector: 'app-parametrizacion',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './parametrizacion.component.html',
  styleUrl: './parametrizacion.component.css',
})
export class ParametrizacionComponent {
  constructor(private configuracionService: ConfiguracionService) { }
  isActive: boolean = false;
  isEditable = false;

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


  PlatformCall() {
    const json = {
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
      maximointentos: this.maximointentos
    };
    console.log("Json -->", json )
    this.configuracionService.updatePlatform(json).subscribe({
      next: (response) =>
        console.log('✅ Positiva la respuesta del backend:', response),
      error: (err) =>
         console.error('❌ Error:', err),
    });
  }

  modulos = [
    { nombre: 'Mejoramiento continuo', activo: false },
    { nombre: 'Consultas', activo: false },
    { nombre: 'Auditorías', activo: false },
    { nombre: 'Recursos Humanos', activo: false },
    { nombre: 'SGSST', activo: false },
    { nombre: 'Proveedores', activo: false },
  ];

 

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('AuthService Error:', error);
    return throwError(() => new Error(errorMessage));
  }

   toggleEdit(): void {
    this.isEditable = !this.isEditable;
  }
   toggleModulo(modulo: any): void {
    modulo.activo = !modulo.activo;
  }
}
