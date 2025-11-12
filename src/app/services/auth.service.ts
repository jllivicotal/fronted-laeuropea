import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import {
  Usuario,
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from '../models/usuario.interface';
import { environment } from '../../environments/environment';

// Interfaz para la respuesta estándar del backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiBaseUrl}/auth`;
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'currentUser';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  /**
   * Registro de nuevo usuario
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<{ usuario: Usuario; accessToken: string; refreshToken: string }>>(`${this.API_URL}/registro`, data).pipe(
      map(response => ({
        usuario: response.data.usuario,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      })),
      tap(authData => this.handleAuthentication(authData))
    );
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<{ usuario: Usuario; accessToken: string; refreshToken: string }>>(`${this.API_URL}/login`, credentials).pipe(
      map(response => ({
        usuario: response.data.usuario,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      })),
      tap(authData => this.handleAuthentication(authData))
    );
  }

  /**
   * Logout - Limpiar tokens y redirigir
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'ADMIN' || user?.rol === 'MANAGER';
  }

  /**
   * Obtener token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      map(response => ({
        usuario: this.getCurrentUser()!,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      })),
      tap(authData => this.handleAuthentication(authData))
    );
  }

  /**
   * Manejar autenticación exitosa
   */
  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
    this.currentUserSubject.next(response.usuario);
  }

  /**
   * Obtener usuario del localStorage
   */
  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
