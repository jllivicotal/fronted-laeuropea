import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CarritoService } from '../../services/carrito.service';
import { OrdenService } from '../../services/orden.service';
import { AuthService } from '../../services/auth.service';
import { CiudadService } from '../../services/ciudad.service';
import { CarritoItem } from '../../models/carrito.interface';
import { OrdenCreate } from '../../models/orden.interface';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private ordenService = inject(OrdenService);
  private authService = inject(AuthService);
  private ciudadService = inject(CiudadService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  items: CarritoItem[] = [];
  total = 0;
  loading = false;
  error: string | null = null;
  mostrarCheckout = false;
  imagenPorDefecto = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect width="150" height="150" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="%236b7280"%3E🥩 Sin Imagen%3C/text%3E%3C/svg%3E';
  ciudades: any[] = [];
  loadingCiudades = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  productoAEliminar: CarritoItem | null = null;

  // Modal de éxito de orden
  mostrarModalExito = false;
  ordenCreada: any = null;

  checkoutForm: FormGroup;

  constructor() {
    this.checkoutForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      ciudad: ['', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCarrito();
    this.cargarCiudades();
  }

  cargarCiudades(): void {
    this.loadingCiudades = true;
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades) => {
        this.ciudades = ciudades;
        this.loadingCiudades = false;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
        this.loadingCiudades = false;
      }
    });
  }

  cargarCarrito(): void {
    this.carritoService.carrito$.subscribe(items => {
      this.items = items;
      this.total = this.carritoService.getTotal();
    });
  }

  actualizarCantidad(productoId: string, cantidad: number): void {
    if (cantidad > 0) {
      this.carritoService.actualizarCantidad(productoId, cantidad);
    }
  }

  incrementarCantidad(item: CarritoItem): void {
    if (item.cantidad < item.producto.stock) {
      this.carritoService.actualizarCantidad(item.producto._id, item.cantidad + 1);
    }
  }

  decrementarCantidad(item: CarritoItem): void {
    if (item.cantidad > 1) {
      this.carritoService.actualizarCantidad(item.producto._id, item.cantidad - 1);
    }
  }

  abrirModalEliminar(item: CarritoItem): void {
    this.productoAEliminar = item;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.productoAEliminar = null;
  }

  confirmarEliminar(): void {
    if (this.productoAEliminar) {
      this.carritoService.eliminarProducto(this.productoAEliminar.producto._id);
      this.cerrarModalEliminar();
    }
  }

  eliminarItem(productoId: string): void {
    this.carritoService.eliminarProducto(productoId);
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.carritoService.limpiarCarrito();
      this.mostrarCheckout = false;
    }
  }

  continuarComprando(): void {
    this.router.navigate(['/productos']);
  }

  irACheckout(): void {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrito' } });
      return;
    }

    // Autocompletar el formulario con la información del usuario
    this.checkoutForm.patchValue({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      ciudad: usuario.ciudad || ''
    });

    this.mostrarCheckout = true;
  }

  cancelarCheckout(): void {
    this.mostrarCheckout = false;
    this.checkoutForm.reset();
  }

  procesarOrden(): void {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.items.length === 0) {
      this.error = 'El carrito está vacío';
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.checkoutForm.value;
    const ordenData: OrdenCreate = {
      ciudad: formValue.ciudad,
      productos: this.items.map(item => ({
        productoId: item.producto._id,
        cantidad: item.cantidad
      })),
      cliente: {
        nombre: formValue.nombre,
        email: formValue.email,
        telefono: formValue.telefono,
        direccion: formValue.direccion
      },
      observacion: formValue.notas || undefined
    };

    this.ordenService.createOrden(ordenData).subscribe({
      next: (response: any) => {
        // Guardar información de la orden
        this.ordenCreada = response;

        // Limpiar el carrito
        this.carritoService.limpiarCarrito();

        // Resetear formulario y ocultar checkout
        this.checkoutForm.reset();
        this.mostrarCheckout = false;

        // Mostrar modal de éxito
        this.mostrarModalExito = true;
      },
      error: (err: any) => {
        console.error('Error al crear orden:', err);
        this.error = err.error?.message || err.message || 'Error al procesar la orden. Por favor, intenta nuevamente.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getSubtotal(item: CarritoItem): number {
    return item.producto.precio * item.cantidad;
  }

  get nombreInvalid(): boolean {
    const control = this.checkoutForm.get('nombre');
    return !!(control && control.invalid && control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.checkoutForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get telefonoInvalid(): boolean {
    const control = this.checkoutForm.get('telefono');
    return !!(control && control.invalid && control.touched);
  }

  get direccionInvalid(): boolean {
    const control = this.checkoutForm.get('direccion');
    return !!(control && control.invalid && control.touched);
  }

  get ciudadInvalid(): boolean {
    const control = this.checkoutForm.get('ciudad');
    return !!(control && control.invalid && control.touched);
  }

  get codigoPostalInvalid(): boolean {
    const control = this.checkoutForm.get('codigoPostal');
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Cerrar modal de éxito y continuar comprando
   */
  cerrarModalExito(): void {
    this.mostrarModalExito = false;
    this.ordenCreada = null;
    this.router.navigate(['/productos']);
  }

  /**
   * Manejar error de carga de imagen
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Evitar loop infinito
    if (!img.src.includes('text=Sin+Imagen')) {
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect width="150" height="150" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="%236b7280"%3E🥩%3C/text%3E%3C/svg%3E';
    }
  }
}
