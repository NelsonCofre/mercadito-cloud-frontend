import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SelectorVista, tono, useVista } from '../componentes/SelectorVista';
import { api, dinero, ErrorApi } from '../api';
import type { Producto } from '../tipos';

export function ProductosGestionPage({ modo }: { modo: 'admin' | 'vendedor' }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState('');
  const [vista, setVista] = useVista('mercadito-vista-gestion', 'lista');
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
        <div className="encabezado-acciones">
          <SelectorVista vista={vista} onChange={setVista} />
          {modo === 'admin' && <Link className="boton" to="/admin/productos/nuevo">Nuevo producto</Link>}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {productos.length === 0 && !error && <p className="tarjeta vacio">No hay productos para mostrar.</p>}
      <div className={vista === 'tarjetas' ? 'grilla' : 'lista'}>
        {productos.map((producto) => (
          vista === 'tarjetas' ? (
            <article key={producto.id} className={`tarjeta producto${producto.activo ? '' : ' producto-inactivo'}`}>
              <div className="producto-banda" style={{ background: tono(producto.categoriaNombre) }}>
                {producto.categoriaNombre}
              </div>
              <div className="producto-cuerpo">
                <h2>{producto.nombre}</h2>
                <p className="suave recorte">{producto.descripcion || 'Sin descripción'}</p>
                <p className="suave">Stock {producto.stock}</p>
                {!producto.activo && <span className="etiqueta">Inactivo</span>}
                <div className="producto-pie">
                  <strong className="precio">{dinero(producto.precio)}</strong>
                  {acciones(producto)}
                </div>
              </div>
            </article>
          ) : (
            <article key={producto.id} className="tarjeta fila-admin" style={{ borderLeftColor: tono(producto.categoriaNombre) }}>
              <div>
                <h2>{producto.nombre}</h2>
                <p className="suave recorte">{producto.descripcion || 'Sin descripción'}</p>
                <p className="suave">{producto.categoriaNombre} · Stock {producto.stock}</p>
                {!producto.activo && <span className="etiqueta">Inactivo</span>}
              </div>
              <strong className="precio">{dinero(producto.precio)}</strong>
              {acciones(producto)}
            </article>
          )
        ))}
      </div>
    </section>
  );

  function acciones(producto: Producto) {
    return (
      <div className="acciones">
        <Link className="boton boton-linea" to={`${base}/${producto.id}/editar`}>Editar</Link>
        {modo === 'admin' && producto.activo && (
          <button type="button" className="secundario" onClick={() => void desactivar(producto.id)}>Desactivar</button>
        )}
      </div>
    );
  }
}
