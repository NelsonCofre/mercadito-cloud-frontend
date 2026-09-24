export type Rol = 'ADMIN' | 'VENDEDOR' | 'CLIENTE';

export type Sesion = {
  usuarioId: string;
  nombre: string;
  rol: Rol;
  token: string | null;
};

export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoriaId: number;
  categoriaNombre: string;
  activo: boolean;
};

export type CarritoItem = {
  id: number;
  productoId: number;
  nombre: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type Carrito = {
  id: number;
  usuarioId: string;
  items: CarritoItem[];
  total: number;
};

export type ProductoFormulario = {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  categoriaId: string;
  activo: boolean;
};
