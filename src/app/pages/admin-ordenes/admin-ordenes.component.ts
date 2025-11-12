import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdenService } from '../../services/orden.service';
import { Orden, OrdenDetalle } from '../../models/orden.interface';

@Component({
  selector: 'app-admin-ordenes',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ordenes.component.html',
  styleUrl: './admin-ordenes.component.css'
})
export class AdminOrdenesComponent implements OnInit {
  private ordenService = inject(OrdenService);

  ordenes: Orden[] = [];
  ordenesFiltered: Orden[] = [];
  loading = false;
  error: string | null = null;

  // Filtros
  filtroEstado: string = 'TODOS';
  filtroBusqueda: string = '';

  // Modal
  ordenSeleccionada: Orden | null = null;
  detallesOrden: OrdenDetalle[] = [];
  mostrarModal = false;
  loadingModal = false;

  // Acciones
  motivoRechazo = '';
  observacionAprobacion = '';
  procesandoAccion = false;

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.loading = true;
    this.error = null;

    this.ordenService.getOrdenes().subscribe({
      next: (response: any) => {
        // Asegurarse de que siempre sea un array
        if (Array.isArray(response)) {
          this.ordenes = response;
        } else if (response.ordenes && Array.isArray(response.ordenes)) {
          this.ordenes = response.ordenes;
        } else {
          this.ordenes = [];
        }

        // Ordenar por fecha más reciente primero
        this.ordenes.sort((a, b) =>
          new Date(b.fechaOrden).getTime() - new Date(a.fechaOrden).getTime()
        );

        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar órdenes:', err);
        this.error = err.error?.message || 'Error al cargar las órdenes';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtered = [...this.ordenes];

    // Filtro por estado
    if (this.filtroEstado !== 'TODOS') {
      filtered = filtered.filter(orden => orden.estado === this.filtroEstado);
    }

    // Filtro por búsqueda (número de orden, cliente)
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtered = filtered.filter(orden =>
        orden.numeroOrden.toLowerCase().includes(busqueda) ||
        orden.cliente.nombre.toLowerCase().includes(busqueda) ||
        orden.cliente.email.toLowerCase().includes(busqueda)
      );
    }

    this.ordenesFiltered = filtered;
  }

  verDetalle(orden: Orden): void {
    this.ordenSeleccionada = orden;
    this.mostrarModal = true;
    this.loadingModal = true;
    this.motivoRechazo = '';
    this.observacionAprobacion = '';

    this.ordenService.getOrdenById(orden._id).subscribe({
      next: (response: any) => {
        // Manejar diferentes estructuras de respuesta
        if (response.detalles && Array.isArray(response.detalles)) {
          this.detallesOrden = response.detalles;
        } else if (Array.isArray(response)) {
          this.detallesOrden = response;
        } else {
          this.detallesOrden = [];
          console.warn('No se encontraron detalles en la respuesta:', response);
        }
        this.loadingModal = false;
      },
      error: (err: any) => {
        console.error('Error al cargar detalles:', err);
        this.error = 'Error al cargar los detalles de la orden';
        this.loadingModal = false;
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.ordenSeleccionada = null;
    this.detallesOrden = [];
    this.motivoRechazo = '';
    this.observacionAprobacion = '';
  }

  aprobarOrden(): void {
    if (!this.ordenSeleccionada) return;

    if (!confirm(`¿Estás seguro de aprobar la orden ${this.ordenSeleccionada.numeroOrden}? Se enviará un correo de confirmación al cliente.`)) return;

    this.procesandoAccion = true;

    this.ordenService.aprobarOrden(
      this.ordenSeleccionada._id,
      this.observacionAprobacion || undefined
    ).subscribe({
      next: (ordenActualizada: Orden) => {
        // Actualizar orden en la lista
        const index = this.ordenes.findIndex(o => o._id === ordenActualizada._id);
        if (index !== -1) {
          this.ordenes[index] = ordenActualizada;
        }
        this.aplicarFiltros();
        this.procesandoAccion = false;
        this.cerrarModal();

        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert(`✅ Orden ${ordenActualizada.numeroOrden} aprobada exitosamente.\n\n📧 Se ha enviado un correo de confirmación al cliente.`);
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al aprobar orden:', err);
        alert(`❌ Error al aprobar la orden: ${err.error?.message || 'Error desconocido'}`);
        this.procesandoAccion = false;
      }
    });
  }

  rechazarOrden(): void {
    if (!this.ordenSeleccionada) return;

    if (!this.motivoRechazo.trim()) {
      alert('⚠️ Por favor ingresa un motivo de rechazo');
      return;
    }

    if (!confirm(`¿Estás seguro de rechazar la orden ${this.ordenSeleccionada.numeroOrden}? Se enviará un correo al cliente con el motivo del rechazo.`)) return;

    this.procesandoAccion = true;

    this.ordenService.rechazarOrden(
      this.ordenSeleccionada._id,
      this.motivoRechazo
    ).subscribe({
      next: (ordenActualizada: Orden) => {
        // Actualizar orden en la lista
        const index = this.ordenes.findIndex(o => o._id === ordenActualizada._id);
        if (index !== -1) {
          this.ordenes[index] = ordenActualizada;
        }
        this.aplicarFiltros();
        this.procesandoAccion = false;
        this.cerrarModal();

        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert(`🚫 Orden ${ordenActualizada.numeroOrden} rechazada.\n\n📧 Se ha enviado un correo al cliente con el motivo del rechazo.`);
        }, 100);
      },
      error: (err: any) => {
        console.error('Error al rechazar orden:', err);
        alert(`❌ Error al rechazar la orden: ${err.error?.message || 'Error desconocido'}`);
        this.procesandoAccion = false;
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'APROBADA': 'bg-green-100 text-green-800',
      'RECHAZADA': 'bg-red-100 text-red-800',
      'CANCELADA': 'bg-gray-100 text-gray-800'
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'APROBADA': 'Aprobada',
      'RECHAZADA': 'Rechazada',
      'CANCELADA': 'Cancelada'
    };
    return textos[estado] || estado;
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get totalOrdenes(): number {
    return this.ordenes.length;
  }

  get ordenesPendientes(): number {
    return this.ordenes.filter(o => o.estado === 'PENDIENTE').length;
  }

  get ordenesAprobadas(): number {
    return this.ordenes.filter(o => o.estado === 'APROBADA').length;
  }

  get ordenesRechazadas(): number {
    return this.ordenes.filter(o => o.estado === 'RECHAZADA').length;
  }
}
