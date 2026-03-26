import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent  } from '../../../app/ComponentesGlobales/carousel/carousel.component'
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, CarouselComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})

export class inicioComponent  {
  correo: string = '';
  user: any;
  error: string = '';
  TituloEntrada = '';
  username: string = '';


  constructor(private userService: UserService) {}
  userName: string = 'Cristian Alexander Camacho';
 
}
