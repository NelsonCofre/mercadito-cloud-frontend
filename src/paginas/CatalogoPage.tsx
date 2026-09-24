import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dinero, ErrorApi } from '../api';
import type { Categoria, Producto } from '../tipos';

export function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api<Categoria[]>('/api/catalogo/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (busqueda.trim()) {
      params.set('q', busqueda.trim());
    }
    if (categoriaId) {
      params.set('categoriaId', categoriaId);
    }
    const consulta = params.size ? `?${params.toString()}` : '';
    api<Producto[]>(`/api/catalogo/productos${consulta}`)
      .then((lista) => {
        setProductos(lista);
        setError('');
      })
      .catch((causa: Error) => setError(causa.message));
  }, [busqueda, categoriaId]);

  async function agregar(producto: Producto) {
    setAviso('');
    setError('');
    try {
      await api('/api/carrito/items', {
        method: 'POST',
        body: JSON.stringify({ productoId: producto.id, cantidad: 1 }),
      });
      setAviso(`${producto.nombre} se agregó al carrito.`);
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo agregar el producto.');
    }
  }

  return (
    <section>
      <div className="encabezado">
        <div>
          <p className="sobre">Catálogo</p>
          <h1>Productos disponibles</h1>
        </div>
        <div className="filtros">
          <input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar"
            aria-label="Buscar productos"
          />
          <select value={categoriaId} onChange={(evento) => setCategoriaId(evento.target.value)} aria-label="Categoría">
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {aviso && <p className="ok">{aviso}</p>}
      {productos.length === 0 && !error && <p>No hay productos para mostrar.</p>}
      <div className="grilla">
        {productos.map((producto) => (
          <article key={producto.id} className="tarjeta producto">
            <p className="sobre">{producto.categoriaNombre}</p>
            <h2>{producto.nombre}</h2>
            <p>{producto.descripcion || 'Sin descripción'}</p>
            <strong>{dinero(producto.precio)}</strong>
            <div className="acciones">
              <Link to={`/productos/${producto.id}`}>Ver</Link>
              <button type="button" onClick={() => void agregar(producto)} disabled={producto.stock < 1}>
                Agregar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
