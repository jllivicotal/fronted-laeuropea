import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CarritoItem } from '../models/carrito.interface';
import { Producto } from '../models/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly CARRITO_KEY = 'carrito';
  private carritoSubject = new BehaviorSubject<CarritoItem[]>(this.getCarritoFromStorage());
  public carrito$ = this.carritoSubject.asObservable();

  constructor() {}

  /**
   * Agregar producto al carrito
   */
  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const carritoActual = this.carritoSubject.value;
    const itemExistente = carritoActual.find(item => item.producto._id === producto._id);

    if (itemExistente) {
      // Si el producto ya existe, aumentar la cantidad
      itemExistente.cantidad += cantidad;

      // Verificar que no exceda el stock
      if (itemExistente.cantidad > producto.stock) {
        itemExistente.cantidad = producto.stock;
      }
    } else {
      // Si es nuevo, agregarlo
      carritoActual.push({
        producto,
        cantidad: Math.min(cantidad, producto.stock)
      });
    }

    this.actualizarCarrito(carritoActual);
  }

  /**
   * Eliminar producto del carrito
   */
  eliminarProducto(productoId: string): void {
    const carritoActual = this.carritoSubject.value.filter(
      item => item.producto._id !== productoId
    );
    this.actualizarCarrito(carritoActual);
  }

  /**
   * Actualizar cantidad de un producto
   */
  actualizarCantidad(productoId: string, cantidad: number): void {
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.find(item => item.producto._id === productoId);

    if (item) {
      item.cantidad = Math.min(Math.max(1, cantidad), item.producto.stock);
      this.actualizarCarrito(carritoActual);
    }
  }

  /**
   * Limpiar todo el carrito
   */
  limpiarCarrito(): void {
    this.actualizarCarrito([]);
  }

  /**
   * Obtener items del carrito
   */
  getCarrito(): CarritoItem[] {
    return this.carritoSubject.value;
  }

  /**
   * Obtener total del carrito
   */
  getTotal(): number {
    return this.carritoSubject.value.reduce(
      (total, item) => total + (item.producto.precio * item.cantidad),
      0
    );
  }

  /**
   * Obtener cantidad total de items
   */
  getCantidadTotal(): number {
    return this.carritoSubject.value.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }

  /**
   * Actualizar carrito y guardar en localStorage
   */
  private actualizarCarrito(carrito: CarritoItem[]): void {
    localStorage.setItem(this.CARRITO_KEY, JSON.stringify(carrito));
    this.carritoSubject.next(carrito);
  }

  /**
   * Obtener carrito del localStorage
   */
  private getCarritoFromStorage(): CarritoItem[] {
    const carritoStr = localStorage.getItem(this.CARRITO_KEY);
    return carritoStr ? JSON.parse(carritoStr) : [];
  }
}
