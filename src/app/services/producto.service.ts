import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay, of } from 'rxjs';
import { Producto, ProductoCreate } from '../models/producto.interface';
import { environment } from '../../environments/environment';

// Interfaz para la respuesta estándar del backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interfaz para respuesta con paginación
export interface ProductosResponse {
  productos: Producto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/productos`;

  // Cache para productos
  private productosCache = new Map<string, Observable<ProductosResponse>>();
  private productoByIdCache = new Map<string, Observable<Producto>>();
  private readonly CACHE_SIZE = 50;
  private readonly CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener todos los productos (PÚBLICO) con paginación
   */
  getProductos(filtros?: any): Observable<ProductosResponse> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined) {
          params = params.set(key, filtros[key]);
        }
      });
    }

    const cacheKey = `productos_${params.toString()}`;

    // Verificar si está en cache
    if (this.productosCache.has(cacheKey)) {
      return this.productosCache.get(cacheKey)!;
    }

    // Si no está en cache, hacer la petición
    const request$ = this.http.get<ApiResponse<Producto[]>>(this.API_URL, { params })
      .pipe(
        map(response => ({
          productos: response.data,
          pagination: response.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }
        })),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    // Guardar en cache
    this.productosCache.set(cacheKey, request$);

    // Limpiar cache después de la expiración
    setTimeout(() => this.productosCache.delete(cacheKey), this.CACHE_EXPIRATION);

    // Limitar tamaño del cache
    if (this.productosCache.size > this.CACHE_SIZE) {
      const firstKey = this.productosCache.keys().next().value;
      if (firstKey) {
        this.productosCache.delete(firstKey);
      }
    }

    return request$;
  }

  /**
   * Obtener productos disponibles (con stock y activos) (PÚBLICO) con paginación
   */
  getProductosDisponibles(page: number = 1, limit: number = 12, filtros?: any): Observable<ProductosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Agregar filtros opcionales
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params = params.set(key, filtros[key]);
        }
      });
    }

    const cacheKey = `disponibles_${page}_${limit}_${params.toString()}`;

    // Verificar si está en cache
    if (this.productosCache.has(cacheKey)) {
      return this.productosCache.get(cacheKey)!;
    }

    // Si no está en cache, hacer la petición
    const request$ = this.http.get<ApiResponse<Producto[]>>(`${this.API_URL}/disponibles`, { params })
      .pipe(
        map(response => ({
          productos: response.data,
          pagination: response.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 }
        })),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    // Guardar en cache
    this.productosCache.set(cacheKey, request$);

    // Limpiar cache después de la expiración
    setTimeout(() => this.productosCache.delete(cacheKey), this.CACHE_EXPIRATION);

    // Limitar tamaño del cache
    if (this.productosCache.size > this.CACHE_SIZE) {
      const firstKey = this.productosCache.keys().next().value;
      if (firstKey) {
        this.productosCache.delete(firstKey);
      }
    }

    return request$;
  }

  /**
   * Obtener producto por ID (PÚBLICO)
   */
  getProductoById(id: string): Observable<Producto> {
    // Verificar si está en cache
    if (this.productoByIdCache.has(id)) {
      return this.productoByIdCache.get(id)!;
    }

    // Si no está en cache, hacer la petición
    const request$ = this.http.get<ApiResponse<Producto>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => response.data),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    // Guardar en cache
    this.productoByIdCache.set(id, request$);

    // Limpiar cache después de la expiración
    setTimeout(() => this.productoByIdCache.delete(id), this.CACHE_EXPIRATION);

    // Limitar tamaño del cache
    if (this.productoByIdCache.size > this.CACHE_SIZE) {
      const firstKey = this.productoByIdCache.keys().next().value;
      if (firstKey) {
        this.productoByIdCache.delete(firstKey);
      }
    }

    return request$;
  }

  /**
   * Crear nuevo producto (ADMIN/MANAGER)
   */
  createProducto(producto: ProductoCreate): Observable<Producto> {
    return this.http.post<ApiResponse<Producto>>(this.API_URL, producto)
      .pipe(
        map(response => {
          // Limpiar cache cuando se crea un producto
          this.clearCache();
          return response.data;
        })
      );
  }

  /**
   * Actualizar producto (ADMIN/MANAGER)
   */
  updateProducto(id: string, producto: Partial<ProductoCreate>): Observable<Producto> {
    return this.http.put<ApiResponse<Producto>>(`${this.API_URL}/${id}`, producto)
      .pipe(
        map(response => {
          // Limpiar cache cuando se actualiza un producto
          this.clearCache();
          return response.data;
        })
      );
  }

  /**
   * Eliminar producto (ADMIN/MANAGER)
   */
  deleteProducto(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          // Limpiar cache cuando se elimina un producto
          this.clearCache();
          return response.data;
        })
      );
  }

  /**
   * Limpiar toda la cache
   */
  clearCache(): void {
    this.productosCache.clear();
    this.productoByIdCache.clear();
  }

  /**
   * Limpiar cache de un producto específico
   */
  clearProductCache(id: string): void {
    this.productoByIdCache.delete(id);
    // También limpiar cache de listados para refrescar
    this.productosCache.clear();
  }

  /**
   * Obtener categorías únicas de productos
   * @deprecated Use CategoriaService.getCategorias() instead
   */
  getCategorias(): Observable<string[]> {
    // Esta es una llamada simulada, podrías agregar un endpoint en el backend para esto
    return new Observable(observer => {
      this.getProductosDisponibles(1, 1000).subscribe({
        next: (response) => {
          // Extraer nombres de categorías, manejando tanto strings como objetos
          const categorias = [...new Set(response.productos.map((p: Producto) => {
            return typeof p.categoria === 'string' ? p.categoria : p.categoria.nombre;
          }))];
          observer.next(categorias);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
