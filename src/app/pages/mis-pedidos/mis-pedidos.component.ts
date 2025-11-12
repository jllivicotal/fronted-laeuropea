import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../services/orden.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css'
})
export class MisPedidosComponent implements OnInit {
  private ordenService = inject(OrdenService);
  private authService = inject(AuthService);

  pedidos: any[] = [];
  loading = false;
  error: string | null = null;

  // Para el modal de detalle
  mostrarModalDetalle = false;
  pedidoSeleccionado: any = null;

  // Filtros
  filtroEstado: string = '';
  estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'APROBADA', label: 'Aprobada' },
    { value: 'RECHAZADA', label: 'Rechazada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.error = null;

    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      this.error = 'Debe iniciar sesión para ver sus pedidos';
      this.loading = false;
      return;
    }

    // Construir filtros
    const filtros: any = {};
    if (this.filtroEstado) {
      filtros.estado = this.filtroEstado;
    }

    this.ordenService.getOrdenes(filtros).subscribe({
      next: (ordenes) => {
        console.log('Órdenes recibidas:', ordenes);
        console.log('Usuario actual:', usuario);

        // El servicio ya extrae response.data, así que 'ordenes' es directamente el array
        const ordenesArray = Array.isArray(ordenes) ? ordenes : [];

        // Filtrar solo las órdenes del usuario actual (por email)
        this.pedidos = ordenesArray.filter(
          (orden: any) => {
            console.log('Comparando:', orden.cliente?.email, '===', usuario.email);
            return orden.cliente?.email === usuario.email;
          }
        );
        console.log('Órdenes filtradas para el usuario:', this.pedidos);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.error = 'Error al cargar los pedidos. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  aplicarFiltro(): void {
    this.cargarPedidos();
  }

  verDetalle(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.pedidoSeleccionado = null;
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'APROBADA': 'bg-green-100 text-green-800 border-green-300',
      'RECHAZADA': 'bg-red-100 text-red-800 border-red-300',
      'CANCELADA': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return clases[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'PENDIENTE': '🕒',
      'APROBADA': '✅',
      'RECHAZADA': '❌',
      'CANCELADA': '🚫'
    };
    return iconos[estado] || '📦';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNombreCiudad(ciudad: any): string {
    if (typeof ciudad === 'string') return ciudad;
    return ciudad?.nombre || 'N/A';
  }
}
