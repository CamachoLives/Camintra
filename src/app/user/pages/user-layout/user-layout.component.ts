import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  imports: [RouterModule],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css',
})
export class UserLayoutComponent {
  private router = inject(Router);

  Name = 'Cristian Camacho';
  Company = 'Incocredito';
  Group = 'Desarrollo de la Tecnologia';
  Role = 'Ingeniero de Desarrollo';
  Email = 'IntraPruebas@gmail.com';
  Phone = '3148917721';
  Hobbies = 'Futbol, Candelear, Deporte, Estudiar';

  photo = 'https://github.com/CamachoLives.png';
  userId = 'Cris';

  editarUsuario() {
    this.router.navigate(['user/user-edicion']);
  }
}
