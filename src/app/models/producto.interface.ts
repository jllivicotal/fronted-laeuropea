import { Categoria, Subcategoria } from './categoria.interface';

export interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string | Categoria;
  subcategoria?: string | Subcategoria;
  imagenes: string[];
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  subcategoria?: string;
  imagenes?: string[];
  activo?: boolean;
}
