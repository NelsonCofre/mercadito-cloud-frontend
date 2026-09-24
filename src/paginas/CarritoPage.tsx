import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dinero, ErrorApi } from '../api';
import type { Carrito } from '../tipos';

export function CarritoPage() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [error, setError] = useState('');

  function cargar() {
    api<Carrito>('/api/carrito')
      .then((datos) => {
        setCarrito(datos);
        setError('');
      })
      .catch((causa: Error) => setError(causa.message));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarCantidad(productoId: number, cantidad: number) {
    setError('');
    try {
      const datos = await api<Carrito>(`/api/carrito/items/${productoId}`, {
        method: 'PUT',
        body: JSON.stringify({ cantidad }),
      });
      setCarrito(datos);
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo actualizar la cantidad.');
    }
  }

  async function quitar(productoId: number) {
    setError('');
    try {
      setCarrito(await api<Carrito>(`/api/carrito/items/${productoId}`, { method: 'DELETE' }));
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo quitar el producto.');
    }
  }

  if (error && !carrito) {
    return <p className="error">{error}</p>;
  }
  if (!carrito) {
    return <p>Cargando carrito...</p>;
  }

  return (
    <section>
      <div className="encabezado">
        <div>
          <p className="sobre">Compra</p>
          <h1>Tu carrito</h1>
        </div>
        <strong>{dinero(carrito.total)}</strong>
      </div>
      {error && <p className="error">{error}</p>}
      {carrito.items.length === 0 && <p>El carrito está vacío.</p>}
      <div className="lista">
        {carrito.items.map((item) => (
          <article key={item.id} className="tarjeta fila">
            <div>
              <h2>{item.nombre || `Producto ${item.productoId}`}</h2>
              <p>{dinero(item.precioUnitario)} c/u</p>
            </div>
            <label>
              Cantidad
              <input
                type="number"
                min={1}
                max={999}
                value={item.cantidad}
                onChange={(evento) => {
                  const cantidad = Number(evento.target.value);
                  if (cantidad >= 1) {
                    void cambiarCantidad(item.productoId, cantidad);
                  }
                }}
              />
            </label>
            <strong>{dinero(item.subtotal)}</strong>
            <button type="button" className="secundario" onClick={() => void quitar(item.productoId)}>Quitar</button>
          </article>
        ))}
      </div>
      {carrito.items.length > 0 && (
        <Link className="boton" to="/pago">Comprar</Link>
      )}
    </section>
  );
}
