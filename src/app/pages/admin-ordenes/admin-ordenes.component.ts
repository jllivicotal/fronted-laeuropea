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

  // Modales de confirmación
  mostrarModalConfirmacionAprobar = false;
  mostrarModalConfirmacionRechazar = false;
  mostrarModalAdvertencia = false;
  mensajeAdvertencia = '';

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
    console.log('📋 Abriendo detalle de orden:', orden._id);
    this.ordenSeleccionada = orden;
    this.mostrarModal = true;
    this.loadingModal = true;
    this.motivoRechazo = '';
    this.observacionAprobacion = '';

    this.ordenService.getOrdenById(orden._id).subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del backend:', response);

        // El backend devuelve la orden completa con detalles integrados
        if (response && response.detalles && Array.isArray(response.detalles)) {
          // Caso: { ...ordenData, detalles: [...] }
          this.detallesOrden = response.detalles;
          // Actualizar la orden seleccionada con todos los datos
          this.ordenSeleccionada = { ...orden, ...response };
        } else if (response.orden && response.detalles) {
          // Caso: { orden: {...}, detalles: [...] }
          this.detallesOrden = response.detalles;
          this.ordenSeleccionada = response.orden;
        } else if (Array.isArray(response)) {
          // Caso: directamente un array de detalles
          this.detallesOrden = response;
        } else {
          // Si no hay detalles, inicializar array vacío
          console.warn('⚠️ No se encontraron detalles en la respuesta');
          this.detallesOrden = [];
        }

        console.log('✅ Detalles cargados:', this.detallesOrden.length, 'items');
        this.loadingModal = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar detalles:', err);
        this.error = 'Error al cargar los detalles de la orden';
        this.detallesOrden = [];
        this.loadingModal = false;
        // No cerrar el modal, mostrar el error dentro
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.ordenSeleccionada = null;
    this.detallesOrden = [];
    this.motivoRechazo = '';
    this.observacionAprobacion = '';
    this.error = null; // Limpiar error al cerrar modal
  }

  // Mostrar modal de confirmación para aprobar
  mostrarConfirmacionAprobar(): void {
    if (!this.ordenSeleccionada) return;
    this.mostrarModalConfirmacionAprobar = true;
  }

  // Cancelar aprobación
  cancelarAprobacion(): void {
    this.mostrarModalConfirmacionAprobar = false;
  }

  // Confirmar aprobación
  confirmarAprobacion(): void {
    this.mostrarModalConfirmacionAprobar = false;
    this.aprobarOrden();
  }

  aprobarOrden(): void {
    if (!this.ordenSeleccionada) return;

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

  // Mostrar modal de confirmación para rechazar
  mostrarConfirmacionRechazar(): void {
    if (!this.ordenSeleccionada) return;

    if (!this.motivoRechazo.trim()) {
      this.mensajeAdvertencia = 'Por favor ingresa un motivo de rechazo antes de continuar.';
      this.mostrarModalAdvertencia = true;
      return;
    }

    this.mostrarModalConfirmacionRechazar = true;
  }

  // Cancelar rechazo
  cancelarRechazo(): void {
    this.mostrarModalConfirmacionRechazar = false;
  }

  // Confirmar rechazo
  confirmarRechazo(): void {
    this.mostrarModalConfirmacionRechazar = false;
    this.rechazarOrden();
  }

  // Cerrar modal de advertencia
  cerrarModalAdvertencia(): void {
    this.mostrarModalAdvertencia = false;
    this.mensajeAdvertencia = '';
  }

  rechazarOrden(): void {
    if (!this.ordenSeleccionada) return;

    if (!this.motivoRechazo.trim()) {
      this.mensajeAdvertencia = 'Por favor ingresa un motivo de rechazo antes de continuar.';
      this.mostrarModalAdvertencia = true;
      return;
    }

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
