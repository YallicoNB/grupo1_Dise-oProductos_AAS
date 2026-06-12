// * las tareas que se muestran al admin
// todo: todavia no se que hace notificaciones
export interface Tarea {
  id: number;
  descripcion: string;
  completada: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  creadoEn?: string;
}
