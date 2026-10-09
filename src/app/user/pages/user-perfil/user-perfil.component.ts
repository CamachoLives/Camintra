import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarioComponent  } from '../../../ComponentesGlobales/calendario/calendario.component';

@Component({
  selector: 'app-user-perfil',
  imports: [RouterModule, FullCalendarModule, CalendarioComponent],
  templateUrl: './user-perfil.component.html',
  styleUrl: './user-perfil.component.css',
})
export class UserPerfilComponent {
  private router = inject(Router);

  calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true
  };
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
