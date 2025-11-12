export interface Cliente {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface OrdenDetalle {
  _id?: string;
  producto: string | any; // ID del producto o objeto producto poblado
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Orden {
  _id: string;
  numeroOrden: string;
  ciudad: string | any; // ID de ciudad o objeto ciudad poblado
  cliente: Cliente;
  fechaOrden: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';
  aprobada: boolean;
  observacion?: string;
  total: number;
  fechaAprobacion?: string;
  detalles?: OrdenDetalle[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdenCreate {
  ciudad: string;
  cliente: Cliente;
  productos: {
    productoId: string;
    cantidad: number;
  }[];
  observacion?: string;
}

export interface OrdenResponse {
  orden: Orden;
  detalles: OrdenDetalle[];
}
