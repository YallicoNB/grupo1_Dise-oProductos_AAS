// * en esta parte tenemos lo que son la interfases de usuarios
export interface Cliente {
  id: number;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  versionContrasena: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface UsuarioAdmin {
  id: number;
  nombreUsuario: string;
  rol: string;
  creadoEn?: string;
}
