import { Cliente, UsuarioAdmin } from "./users";

// * en esta parte tenemos todas las interfaces de los metodos de autenticación
export interface AuthResponse {
  token: string;
  cliente?: Cliente;
  usuarioAdmin?: UsuarioAdmin;
}

export interface LoginRequest {
  correoElectronico?: string;
  nombreUsuario?: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  contrasena: string;
}

export interface TokenRecuperacionContrasena {
  id: number;
  cliente: Cliente;
  token: string;
  usado: boolean;
  expiraEn: string;
  creadoEn?: string;
}
