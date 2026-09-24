import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, dinero, ErrorApi } from '../api';
import type { Producto } from '../tipos';

export function ProductoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

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
      await api('/api/carrito/items', {
        method: 'POST',
        body: JSON.stringify({ productoId: producto.id, cantidad }),
      });
      setAviso('Producto agregado al carrito.');
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
      <p>{producto.descripcion || 'Sin descripción'}</p>
      <p>Stock: {producto.stock}</p>
      <strong>{dinero(producto.precio)}</strong>
      {error && <p className="error">{error}</p>}
      {aviso && <p className="ok">{aviso}</p>}
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
