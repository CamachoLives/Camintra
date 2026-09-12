// Contratos que devuelve RestCamintra.
// Todas las respuestas vienen envueltas en este sobre.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Paginado<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPaginas: number;
}

export type Rol = 'admin' | 'editor' | 'colaborador';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  ultimo_acceso?: string | null;
}

export interface Departamento {
  id: number;
  nombre: string;
  descripcion: string;
  color_hex: string;
  total_colaboradores?: number;
}

export interface Colaborador {
  id: number;
  usuario_id: number;
  nombre: string;
  email: string;
  rol: Rol;
  cargo: string;
  extension: string;
  celular: string;
  sede: string;
  fecha_ingreso: string | null;
  departamento_id: number | null;
  departamento: string | null;
  departamento_color: string | null;
  jefe_id: number | null;
  jefe: string | null;
  imagen_url: string | null;
  biografia: string | null;
}

export type Prioridad = 'baja' | 'normal' | 'alta' | 'urgente';
export type Estado = 'borrador' | 'publicado' | 'archivado';

export interface Comunicado {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  imagen_url: string;
  prioridad: Prioridad;
  estado: Estado;
  fijado: boolean;
  publicado_en: string | null;
  expira_en: string | null;
  categoria_id: number | null;
  categoria: string | null;
  categoria_color: string | null;
  autor_id: number;
  autor: string;
  leido: boolean;
  total_lecturas: number;
}

export interface ListadoComunicados extends Paginado<Comunicado> {
  noLeidos: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  color_hex: string;
  total_comunicados?: number;
}

export type TipoEvento =
  | 'evento'
  | 'capacitacion'
  | 'reunion'
  | 'festivo'
  | 'cumpleanos';

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: TipoEvento;
  inicio: string;
  fin: string | null;
  todo_el_dia: boolean;
  lugar: string;
  color_hex: string;
  departamento_id: number | null;
  departamento: string | null;
  creado_por: number;
  creador: string;
}

export interface Documento {
  id: number;
  titulo: string;
  slug: string;
  resumen: string;
  contenido?: string;
  categoria: string;
  etiquetas: string[];
  version: number;
  estado: Estado;
  vistas: number;
  departamento_id: number | null;
  departamento: string | null;
  autor_id: number;
  autor: string;
  created_at: string;
  updated_at: string;
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'comunicado' | 'evento' | 'documento' | 'alerta';
  enlace: string;
  leida: boolean;
  created_at: string;
}

export interface IndicadoresIntranet {
  comunicados_vigentes: number;
  comunicados_no_leidos: number;
  colaboradores: number;
  departamentos: number;
  eventos_proximos: number;
  documentos: number;
  notificaciones_pendientes: number;
}

export interface ResumenIntranet {
  indicadores: IndicadoresIntranet;
  ultimosComunicados: Comunicado[];
  proximosEventos: Evento[];
  documentosRecientes: Documento[];
  colaboradoresPorDepartamento: Array<{
    nombre: string;
    color_hex: string;
    total: number;
  }>;
}
