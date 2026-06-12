import { Cliente } from "./users";
import { Servicio } from "./catalog";

//  * este es el nucleo de las operaciones
export interface Cita {
  id: number;
  cliente: Cliente;
  servicio: Servicio;
  fechaCita: string;
  horaCita: string;
  estado: "pendiente" | "completada" | "cancelada";
  montoPagado?: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface FranjaHoraria {
  hora: string;
  disponible: boolean;
}

export interface PoliticaCancelacion {
  id: number;
  horasAnticipacionMinimas: number;
  porcentajeReembolso: number;
  descripcion: string;
  activa: boolean;
  creadoEn?: string;
}
