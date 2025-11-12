import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Ciudad } from '../models/ciudad.interface';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CiudadService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ciudades`;

  /**
   * Obtener todas las ciudades activas
   */
  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<ApiResponse<Ciudad[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener ciudad por ID
   */
  getCiudadById(id: string): Observable<Ciudad> {
    return this.http.get<ApiResponse<Ciudad>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }
}
