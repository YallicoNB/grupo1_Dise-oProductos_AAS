// * son todos los productos y servicios que ofresemos
export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precioMinimo: number;
  precioMaximo?: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  urlImagen?: string;
  disponible: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}
export interface ImagenGaleria {
  id: number;
  urlImagen: string;
  categoria?: string;
  descripcion?: string;
  idServicio?: number;
  creadoEn?: string;
}
