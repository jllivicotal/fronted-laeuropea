export interface Categoria {
  _id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subcategoria {
  _id: string;
  nombre: string;
  categoria: string | Categoria;
  descripcion?: string;
  imagen?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
