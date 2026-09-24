import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dinero, ErrorApi } from '../api';
import type { Producto } from '../tipos';

export function ProductosGestionPage({ modo }: { modo: 'admin' | 'vendedor' }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState('');
  const base = modo === 'admin' ? '/admin/productos' : '/vendedor/productos';

  function cargar() {
    api<Producto[]>('/api/admin/productos')
      .then((lista) => {
        setProductos(lista);
        setError('');
      })
      .catch((causa: Error) => setError(causa.message));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function desactivar(id: number) {
    if (!window.confirm('¿Desactivar este producto?')) {
      return;
    }
    try {
      await api(`/api/admin/productos/${id}`, { method: 'DELETE' });
      cargar();
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo desactivar el producto.');
    }
  }

  return (
    <section>
      <div className="encabezado">
        <div>
          <p className="sobre">{modo === 'admin' ? 'Administración' : 'Vendedor'}</p>
          <h1>Productos</h1>
        </div>
        {modo === 'admin' && <Link className="boton" to="/admin/productos/nuevo">Nuevo producto</Link>}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="lista">
        {productos.map((producto) => (
          <article key={producto.id} className="tarjeta fila">
            <div>
              <h2>{producto.nombre}</h2>
              <p>{producto.categoriaNombre} · Stock {producto.stock}</p>
              {!producto.activo && <span className="etiqueta">Inactivo</span>}
            </div>
            <strong>{dinero(producto.precio)}</strong>
            <Link to={`${base}/${producto.id}/editar`}>Editar</Link>
            {modo === 'admin' && producto.activo && (
              <button type="button" className="secundario" onClick={() => void desactivar(producto.id)}>Desactivar</button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
