import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarioService } from '../../calendario.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Evento, Departamento } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-calendario-intranet',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendario.component.html',
})
export class CalendarioIntranetComponent implements OnInit {
  private servicio = inject(CalendarioService);
  private sesion = inject(SesionService);

  readonly puedePublicar = this.sesion.puedePublicar;

  eventos = signal<Evento[]>([]);
  departamentos = signal<Departamento[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  // Panel lateral: ver o editar un evento
  seleccionado = signal<Evento | null>(null);
  formularioAbierto = signal(false);

  filtroTipo = '';

  readonly tipos = [
    { valor: 'evento', etiqueta: 'Evento', color: '#2563eb' },
    { valor: 'capacitacion', etiqueta: 'Capacitación', color: '#16a34a' },
    { valor: 'reunion', etiqueta: 'Reunión', color: '#9333ea' },
    { valor: 'festivo', etiqueta: 'Festivo', color: '#dc2626' },
    { valor: 'cumpleanos', etiqueta: 'Cumpleaños', color: '#db2777' },
  ];

  modelo: Partial<Evento> & { id?: number } = this.modeloVacio();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    height: 'auto',
    selectable: this.puedePublicar(),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek',
    },
    events: [],
    select: this.alSeleccionarFecha.bind(this),
    eventClick: this.alClicEvento.bind(this),
  };

  ngOnInit(): void {
    this.cargar();

    this.servicio.departamentos().subscribe({
      next: deps => this.departamentos.set(deps),
      error: () => this.departamentos.set([]),
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio.listar({ tipo: this.filtroTipo }).subscribe({
      next: eventos => {
        this.eventos.set(eventos);
        this.pintarEnCalendario(eventos);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  // FullCalendar necesita su propio formato; el id viaja en extendedProps
  private pintarEnCalendario(eventos: Evento[]): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: eventos.map(e => ({
        id: String(e.id),
        title: e.titulo,
        start: e.inicio,
        end: e.fin ?? undefined,
        allDay: e.todo_el_dia,
        backgroundColor: e.color_hex,
        borderColor: e.color_hex,
      })),
    };
  }

  alSeleccionarFecha(info: DateSelectArg): void {
    if (!this.puedePublicar()) return;

    this.modelo = {
      ...this.modeloVacio(),
      inicio: info.startStr.substring(0, 16),
      todo_el_dia: info.allDay,
    };

    this.formularioAbierto.set(true);
    this.seleccionado.set(null);
  }

  alClicEvento(info: EventClickArg): void {
    const evento = this.eventos().find(e => String(e.id) === info.event.id);
    if (!evento) return;

    this.seleccionado.set(evento);
    this.formularioAbierto.set(false);
  }

  nuevo(): void {
    this.modelo = this.modeloVacio();
    this.formularioAbierto.set(true);
    this.seleccionado.set(null);
  }

  editar(evento: Evento): void {
    this.modelo = {
      ...evento,
      // datetime-local no acepta zona horaria ni segundos
      inicio: evento.inicio.substring(0, 16),
      fin: evento.fin ? evento.fin.substring(0, 16) : null,
    };

    this.formularioAbierto.set(true);
  }

  cerrar(): void {
    this.formularioAbierto.set(false);
    this.seleccionado.set(null);
    this.error.set('');
  }

  guardar(): void {
    if (!this.modelo.titulo?.trim() || !this.modelo.inicio) {
      this.error.set('El título y la fecha de inicio son obligatorios');
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const datos: Partial<Evento> = {
      titulo: this.modelo.titulo,
      descripcion: this.modelo.descripcion,
      tipo: this.modelo.tipo,
      inicio: this.modelo.inicio,
      fin: this.modelo.fin || null,
      todo_el_dia: this.modelo.todo_el_dia,
      lugar: this.modelo.lugar,
      color_hex: this.colorDelTipo(this.modelo.tipo),
      departamento_id: this.modelo.departamento_id,
    };

    const peticion = this.modelo.id
      ? this.servicio.actualizar(this.modelo.id, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrar();
        this.cargar();
      },
      error: err => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }

  eliminar(evento: Evento): void {
    if (!confirm(`¿Eliminar el evento "${evento.titulo}"?`)) return;

    this.servicio.eliminar(evento.id).subscribe({
      next: () => {
        this.cerrar();
        this.cargar();
      },
      error: err => this.error.set(err.message),
    });
  }

  etiquetaTipo(tipo: string): string {
    return this.tipos.find(t => t.valor === tipo)?.etiqueta ?? tipo;
  }

  private colorDelTipo(tipo?: string): string {
    return this.tipos.find(t => t.valor === tipo)?.color ?? '#2563eb';
  }

  private modeloVacio(): Partial<Evento> & { id?: number } {
    return {
      titulo: '',
      descripcion: '',
      tipo: 'evento',
      inicio: '',
      fin: null,
      todo_el_dia: false,
      lugar: '',
      departamento_id: null,
    };
  }
}
