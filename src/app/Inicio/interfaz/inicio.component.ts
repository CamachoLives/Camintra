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
  clientes = [
    {
      name: 'Brinsa',
      level: 'High',
      activity: 'development',
      porcentage: '60',
    },
    {
      name: 'Mnemo',
      level: 'Medium',
      activity: 'Cibersecurity',
      porcentage: '80',
    },
    {
      name: 'Siscomputo',
      level: 'Low',
      activity: 'Infraestructure',
      porcentage: '20',
    },
  ];

  contacts = [
    {
      name: 'Cristian Camacho',
      phone: '3148917721',
      image: 'https://github.com/CamachoLives.png',
      contacts: 87,
      gradientColor: 'bg-gradient-to-tr from-blue-600 to-blue-400',
      contactColor: 'text-green-500',
    },
    {
      name: 'Esteban Heredia',
      phone: '3202152786',
      image: 'https://github.com/here0503.png',
      contacts: 43,
      gradientColor: 'bg-gradient-to-tr from-green-600 to-green-400',
      contactColor: 'text-yellow-500',
    },
    {
      name: 'Luis Villamizar',
      phone: '3118145001',
      image: 'https://github.com/LuisVillamizar.png',
      contacts: 15,
      gradientColor: 'bg-gradient-to-tr from-red-600 to-red-400',
      contactColor: 'text-red-500',
    },
  ];



  // constructor(private userService: UserService) {}
  // ngOnInit() {
  //   this.userService.getInformation().subscribe({
  //     next: (res) => {
  //       this.user = res.body.nombre;
  //       this.correo = res.body.email;
  //     },
  //     error: (err) => {
  //       this.error = 'Incorrect email';
  //       console.error(err);
  //     },
  //   });
  // }
}
