import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export default class LoginComponent {
  email = '';
  password = '';
  error = '';
  nombre = '';

  emailr = '';
  passwordr = '';
  nombrer = '';
  errorr = '';

  // Variable para el efecto dinámico
  rightPanelActive = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/Inicio']);
      },
      error: (err) => {
        this.error = err.message || 'Correo o contraseña incorrectos';
        console.error(err);
      },
    });
  }

  onRegister() {
    // Validaciones simples
    if (!this.nombrer || this.nombrer.trim().length < 3) {
      this.errorr = 'El nombre es muy corto';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.emailr || !emailPattern.test(this.emailr)) {
      this.errorr = 'Escribe un correo válido';
      return;
    }

    if (!this.passwordr || this.passwordr.length < 6) {
      this.errorr = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Si todo está bien, llama al servicio
    this.authService
      .register(this.nombrer, this.emailr, this.passwordr)
      .subscribe({
        next: () => {
          // Registrarse no autentica: se entra por la pestaña de ingreso
          this.errorr = '';
          this.email = this.emailr;
          this.toggleSignIn();
        },
        error: (err) => {
          this.errorr = err.message || 'No se pudo completar el registro';
          console.error(err);
        },
      });
  }

  // Funciones para cambiar entre Sign In / Sign Up
  toggleSignUp() {
    this.rightPanelActive = true;
  }

  toggleSignIn() {
    this.rightPanelActive = false;
  }
}
