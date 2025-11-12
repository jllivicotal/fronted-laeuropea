import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria, Subcategoria } from '../models/categoria.interface';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/categorias`;

  // Cache para categorías y subcategorías
  private categoriasCache$?: Observable<Categoria[]>;
  private subcategoriasCache$?: Observable<Subcategoria[]>;
  private subcategoriasPorCategoriaCache = new Map<string, Observable<Subcategoria[]>>();
  private readonly CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutos (categorías cambian menos)

  /**
   * Obtener todas las categorías activas
   */
  getCategorias(): Observable<Categoria[]> {
    // Si ya está en cache, retornar cache
    if (this.categoriasCache$) {
      return this.categoriasCache$;
    }

    // Si no está en cache, hacer la petición
    this.categoriasCache$ = this.http.get<ApiResponse<Categoria[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data),
        shareReplay({ bufferSize: 1, refCount: false }) // refCount: false mantiene el cache incluso sin suscriptores
      );

    // Limpiar cache después de la expiración
    setTimeout(() => {
      this.categoriasCache$ = undefined;
    }, this.CACHE_EXPIRATION);

    return this.categoriasCache$;
  }

  /**
   * Obtener una categoría por ID
   */
  getCategoriaById(id: string): Observable<Categoria> {
    return this.http.get<ApiResponse<Categoria>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener subcategorías por categoría
   */
  getSubcategoriasPorCategoria(categoriaId: string): Observable<Subcategoria[]> {
    // Verificar si está en cache
    if (this.subcategoriasPorCategoriaCache.has(categoriaId)) {
      return this.subcategoriasPorCategoriaCache.get(categoriaId)!;
    }

    // Si no está en cache, hacer la petición
    const request$ = this.http.get<ApiResponse<Subcategoria[]>>(`${environment.apiBaseUrl}/subcategorias/categoria/${categoriaId}`)
      .pipe(
        map(response => response.data),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    // Guardar en cache
    this.subcategoriasPorCategoriaCache.set(categoriaId, request$);

    // Limpiar cache después de la expiración
    setTimeout(() => {
      this.subcategoriasPorCategoriaCache.delete(categoriaId);
    }, this.CACHE_EXPIRATION);

    return request$;
  }

  /**
   * Obtener todas las subcategorías activas
   */
  getSubcategorias(): Observable<Subcategoria[]> {
    // Si ya está en cache, retornar cache
    if (this.subcategoriasCache$) {
      return this.subcategoriasCache$;
    }

    // Si no está en cache, hacer la petición
    this.subcategoriasCache$ = this.http.get<ApiResponse<Subcategoria[]>>(`${environment.apiBaseUrl}/subcategorias`)
      .pipe(
        map(response => response.data),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    // Limpiar cache después de la expiración
    setTimeout(() => {
      this.subcategoriasCache$ = undefined;
    }, this.CACHE_EXPIRATION);

    return this.subcategoriasCache$;
  }

  /**
   * Limpiar toda la cache
   */
  clearCache(): void {
    this.categoriasCache$ = undefined;
    this.subcategoriasCache$ = undefined;
    this.subcategoriasPorCategoriaCache.clear();
  }
}
