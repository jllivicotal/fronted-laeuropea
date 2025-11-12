export interface Usuario {
  _id?: string;
  email: string;
  nombre: string;
  ciudad: string; // ID de la ciudad
  rol: 'USER' | 'MANAGER' | 'ADMIN';
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  ciudad: string; // ID de la ciudad
  rol?: 'USER' | 'MANAGER' | 'ADMIN';
}

export interface AuthResponse {
  mensaje?: string;
  usuario: Usuario;
  accessToken: string;
  refreshToken: string;
}
