import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCarritoUi } from '../componentes/CarritoFlotante';
import { api, dinero, ErrorApi } from '../api';
import type { Carrito, Producto } from '../tipos';

export function ProductoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState('');
  const { abrir } = useCarritoUi();

  useEffect(() => {
    api<Producto>(`/api/catalogo/productos/${id}`)
      .then(setProducto)
      .catch((causa: Error) => setError(causa.message));
  }, [id]);

  async function agregar() {
    if (!producto) {
      return;
    }
    setError('');
    try {
      const actualizado = await api<Carrito>('/api/carrito/items', {
        method: 'POST',
        body: JSON.stringify({ productoId: producto.id, cantidad }),
      });
      abrir(actualizado, producto.id);
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo agregar el producto.');
    }
  }

  if (error && !producto) {
    return <p className="error">{error}</p>;
  }
  if (!producto) {
    return <p>Cargando producto...</p>;
  }

  return (
    <article className="tarjeta detalle">
      <Link to="/catalogo">Volver al catálogo</Link>
      <p className="sobre">{producto.categoriaNombre}</p>
      <h1>{producto.nombre}</h1>
      <p className="suave">{producto.descripcion || 'Sin descripción'}</p>
      <p className="suave">Stock: {producto.stock}</p>
      <strong className="precio">{dinero(producto.precio)}</strong>
      {error && <p className="error">{error}</p>}
      <div className="acciones">
        <label>
          Cantidad
          <input
            type="number"
            min={1}
            max={Math.max(producto.stock, 1)}
            value={cantidad}
            onChange={(evento) => setCantidad(Number(evento.target.value))}
          />
        </label>
        <button type="button" onClick={() => void agregar()} disabled={producto.stock < 1}>Agregar al carrito</button>
      </div>
    </article>
  );
}
