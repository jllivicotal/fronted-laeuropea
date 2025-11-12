import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto.interface';
import { Categoria, Subcategoria } from '../../models/categoria.interface';

@Component({
  selector: 'app-producto-detalle',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);

  producto: Producto | null = null;
  cantidad = 1;
  loading = true;
  error: string | null = null;
  imagenActual = 0;
  imagenPorDefecto = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"%3E%3Crect width="600" height="600" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="%236b7280"%3E🥩 Sin Imagen%3C/text%3E%3C/svg%3E';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(id);
    }
  }

  cargarProducto(id: string) {
    this.loading = true;
    this.error = null;

    this.productoService.getProductoById(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Producto no encontrado';
        this.loading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/productos']);
  }

  agregarAlCarrito() {
    if (this.producto) {
      this.carritoService.agregarProducto(this.producto, this.cantidad);
      this.router.navigate(['/carrito']);
    }
  }

  incrementarCantidad() {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  cambiarImagen(index: number) {
    this.imagenActual = index;
  }

  /**
   * Manejar error de carga de imagen
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Evitar loop infinito
    if (!img.src.includes('text=Sin+Imagen')) {
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"%3E%3Crect width="600" height="600" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="%236b7280"%3E🥩 Sin Imagen%3C/text%3E%3C/svg%3E';
    }
  }

  /**
   * Obtener el nombre de la categoría
   */
  getCategoriaNombre(categoria: string | Categoria | undefined): string {
    if (!categoria) return '';
    return typeof categoria === 'string' ? categoria : categoria.nombre;
  }

  /**
   * Obtener el nombre de la subcategoría
   */
  getSubcategoriaNombre(subcategoria: string | Subcategoria | undefined): string {
    if (!subcategoria) return '';
    return typeof subcategoria === 'string' ? subcategoria : subcategoria.nombre;
  }
}

