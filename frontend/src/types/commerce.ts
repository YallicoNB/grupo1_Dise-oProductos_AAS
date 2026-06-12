import { Cita } from "./appointments";
import { Cliente } from "./users";
import { Producto } from "./catalog";

// * interfaces de todo el flujo de dinero y adquisición
export interface Pago {
  id: number;
  cita: Cita;
  cliente: Cliente;
  metodoPago: string;
  monto: number;
  estado: string;
  idTransaccionSimulada?: string;
  creadoEn?: string;
}

export interface Reembolso {
  id: number;
  cita: Cita;
  pago: Pago;
  montoReembolsado: number;
  porcentajeReembolso: number;
  estado: string;
  idTransaccionSimulada?: string;
  mensajeError?: string;
  procesadoEn?: string;
  creadoEn?: string;
}

export interface OrdenCompra {
  id: number;
  cliente: Cliente;
  productos: string;
  montoTotal: number;
  metodoPago: string;
  estado: string;
  idTransaccionSimulada: string;
  creadoEn?: string;
}

export interface ArticuloCarrito {
  producto: Producto;
  cantidad: number;
}
