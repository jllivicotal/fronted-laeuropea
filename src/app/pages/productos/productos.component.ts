import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { CategoriaService } from '../../services/categoria.service';
import { Producto } from '../../models/producto.interface';
import { Categoria, Subcategoria } from '../../models/categoria.interface';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private categoriaService = inject(CategoriaService);

  // Exponer Math al template
  Math = Math;

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  subcategoriasFiltradas: Subcategoria[] = [];
  categoriaSeleccionada: string = '';
  subcategoriaSeleccionada: string = '';
  busqueda: string = '';
  isLoading = true;

  // Paginación
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;

  ngOnInit() {
    this.cargarCategorias();
    this.cargarSubcategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  cargarSubcategorias() {
    this.categoriaService.getSubcategorias().subscribe({
      next: (subcategorias) => {
        this.subcategorias = subcategorias;
        this.subcategoriasFiltradas = subcategorias;
      },
      error: (error) => {
        console.error('Error al cargar subcategorías:', error);
      }
    });
  }

  onCategoriaChange() {
    this.subcategoriaSeleccionada = '';
    if (this.categoriaSeleccionada) {
      this.subcategoriasFiltradas = this.subcategorias.filter(
        sub => {
          const subCategoria = typeof sub.categoria === 'string'
            ? sub.categoria
            : sub.categoria._id;
          return subCategoria === this.categoriaSeleccionada;
        }
      );
    } else {
      this.subcategoriasFiltradas = this.subcategorias;
    }
    this.filtrarProductos();
  }

  cargarProductos() {
    this.isLoading = true;

    // Construir filtros para enviar al backend
    const filtros: any = {};
    if (this.categoriaSeleccionada) {
      filtros.categoria = this.categoriaSeleccionada;
    }
    if (this.subcategoriaSeleccionada) {
      filtros.subcategoria = this.subcategoriaSeleccionada;
    }
    if (this.busqueda) {
      filtros.busqueda = this.busqueda;
    }

    this.productoService.getProductosDisponibles(this.currentPage, this.pageSize, filtros).subscribe({
      next: (response) => {
        this.productos = response.productos;
        this.productosFiltrados = response.productos; // Ya vienen filtrados del backend
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.currentPage = response.pagination.page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filtrarProductos() {
    // Resetear a la página 1 cuando se aplican filtros
    this.currentPage = 1;
    // Cargar productos desde el backend con los filtros
    this.cargarProductos();
  }

  limpiarFiltros() {
    this.categoriaSeleccionada = '';
    this.subcategoriaSeleccionada = '';
    this.busqueda = '';
    this.subcategoriasFiltradas = this.subcategorias;
    this.filtrarProductos();
  }

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto, 1);
  }

  // Métodos de paginación
  cambiarPagina(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cargarProductos();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get paginasArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Métodos auxiliares para obtener nombres de categoría y subcategoría
  getCategoriaNombre(categoria: string | Categoria | undefined): string {
    if (!categoria) return '';
    return typeof categoria === 'string' ? categoria : categoria.nombre;
  }

  getSubcategoriaNombre(subcategoria: string | Subcategoria | undefined): string {
    if (!subcategoria) return '';
    return typeof subcategoria === 'string' ? subcategoria : subcategoria.nombre;
  }
}

