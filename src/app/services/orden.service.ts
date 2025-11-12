import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Orden, OrdenCreate, OrdenResponse } from '../models/orden.interface';
import { environment } from '../../environments/environment';

// Interfaz para la respuesta estándar del backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/ordenes`;

  /**
   * Obtener todas las órdenes (PÚBLICO)
   */
  getOrdenes(filtros?: any): Observable<any> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined) {
          params = params.set(key, filtros[key]);
        }
      });
    }

    return this.http.get<ApiResponse<any>>(this.API_URL, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Obtener orden por ID (PÚBLICO)
   */
  getOrdenById(id: string): Observable<OrdenResponse> {
    return this.http.get<ApiResponse<OrdenResponse>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Crear nueva orden (público)
   */
  createOrden(orden: OrdenCreate): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.API_URL, orden)
      .pipe(map(response => response.data));
  }

  /**
   * Aprobar orden (ADMIN/MANAGER)
   */
  aprobarOrden(id: string, observacion?: string): Observable<Orden> {
    return this.http.patch<ApiResponse<Orden>>(`${this.API_URL}/${id}/aprobar`, { observacion })
      .pipe(map(response => response.data));
  }

  /**
   * Rechazar orden (ADMIN/MANAGER)
   */
  rechazarOrden(id: string, motivo: string): Observable<Orden> {
    return this.http.patch<ApiResponse<Orden>>(`${this.API_URL}/${id}/rechazar`, { motivo })
      .pipe(map(response => response.data));
  }

  /**
   * Eliminar orden (ADMIN/MANAGER, solo si no está aprobada)
   */
  deleteOrden(id: string, motivo?: string): Observable<any> {
    const body = motivo ? { motivo } : {};
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`, { body })
      .pipe(map(response => response.data));
  }

  /**
   * Obtener estadísticas de órdenes (PÚBLICO)
   */
  getEstadisticas(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/estadisticas/resumen`)
      .pipe(map(response => response.data));
  }
}
