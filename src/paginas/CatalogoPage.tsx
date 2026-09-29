import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarritoUi } from '../componentes/CarritoFlotante';
import { SelectorVista, tono, useVista } from '../componentes/SelectorVista';
import { api, dinero, ErrorApi } from '../api';
import type { Carrito, Categoria, Producto } from '../tipos';

export function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [error, setError] = useState('');
  const [agregandoId, setAgregandoId] = useState<number | null>(null);
  const [vista, setVista] = useVista('mercadito-vista-catalogo', 'tarjetas');
  const { abrir } = useCarritoUi();

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
    setError('');
    setAgregandoId(producto.id);
    try {
      const actualizado = await api<Carrito>('/api/carrito/items', {
        method: 'POST',
        body: JSON.stringify({ productoId: producto.id, cantidad: 1 }),
      });
      abrir(actualizado, producto.id);
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo agregar el producto.');
    } finally {
      setAgregandoId(null);
    }
  }

  return (
    <section>
      <div className="encabezado">
        <div>
          <p className="sobre">Catálogo</p>
          <h1>Productos disponibles</h1>
        </div>
        <div className="encabezado-acciones">
          <SelectorVista vista={vista} onChange={setVista} />
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
      </div>
      {error && <p className="error">{error}</p>}
      {productos.length === 0 && !error && <p className="tarjeta vacio">No hay productos para mostrar.</p>}
      <div className={vista === 'tarjetas' ? 'grilla' : 'lista'}>
        {productos.map((producto) => (
          vista === 'tarjetas' ? (
            <article key={producto.id} className="tarjeta producto">
              <div className="producto-banda" style={{ background: tono(producto.categoriaNombre) }}>
                {producto.categoriaNombre}
              </div>
              <div className="producto-cuerpo">
                <h2>{producto.nombre}</h2>
                <p className="suave recorte">{producto.descripcion || 'Sin descripción'}</p>
                <p className="suave">Stock {producto.stock}</p>
                <div className="producto-pie">
                  <strong className="precio">{dinero(producto.precio)}</strong>
                  {acciones(producto)}
                </div>
              </div>
            </article>
          ) : (
            <article key={producto.id} className="tarjeta fila-catalogo" style={{ borderLeftColor: tono(producto.categoriaNombre) }}>
              <div>
                <h2>{producto.nombre}</h2>
                <p className="suave recorte">{producto.descripcion || 'Sin descripción'}</p>
                <p className="suave">{producto.categoriaNombre} · Stock {producto.stock}</p>
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
        <Link className="boton boton-linea" to={`/productos/${producto.id}`}>Ver</Link>
        <button type="button" onClick={() => void agregar(producto)} disabled={producto.stock < 1 || agregandoId === producto.id}>
          {agregandoId === producto.id ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
    );
  }
}
