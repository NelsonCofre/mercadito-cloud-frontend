import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api, dinero, ErrorApi } from '../api';
import { useSesion } from '../sesion-estado';
import type { Carrito } from '../tipos';

type CarritoUi = {
  abrir: (carrito?: Carrito, productoId?: number) => void;
  actualizar: () => void;
};

const Contexto = createContext<CarritoUi | null>(null);

export function useCarritoUi() {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('El carrito flotante no está disponible.');
  }
  return valor;
}

export function CarritoFlotanteProvider({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [destacadoId, setDestacadoId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const esCliente = sesion?.rol === 'CLIENTE';

  async function cargar() {
    try {
      setCarrito(await api<Carrito>('/api/carrito'));
      setError('');
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo cargar el carrito.');
    }
  }

  useEffect(() => {
    if (esCliente) {
      void cargar();
    }
  }, [esCliente]);

  const valor = useMemo<CarritoUi>(() => ({
    abrir: (siguiente, productoId) => {
      if (siguiente) {
        setCarrito(siguiente);
        setError('');
      } else {
        void cargar();
      }
      setDestacadoId(productoId ?? null);
      setAbierto(true);
    },
    actualizar: () => {
      void cargar();
    },
  }), []);

  async function cambiarCantidad(productoId: number, cantidad: number) {
    try {
      setCarrito(await api<Carrito>(`/api/carrito/items/${productoId}`, {
        method: 'PUT',
        body: JSON.stringify({ cantidad }),
      }));
      setError('');
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo actualizar la cantidad.');
    }
  }

  async function quitar(productoId: number) {
    try {
      setCarrito(await api<Carrito>(`/api/carrito/items/${productoId}`, { method: 'DELETE' }));
      setError('');
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo quitar el producto.');
    }
  }

  const unidades = carrito?.items.reduce((total, item) => total + item.cantidad, 0) ?? 0;

  return (
    <Contexto.Provider value={valor}>
      {children}
      {esCliente && (
        <>
          <button type="button" className="fab-carrito" aria-label="Abrir carrito" onClick={() => valor.abrir()}>
            <IconoCarrito />
            {unidades > 0 && <span className="fab-cuenta">{unidades}</span>}
          </button>
          {abierto && (
            <>
              <button type="button" className="velo" aria-label="Cerrar carrito" onClick={() => setAbierto(false)} />
              <aside className="panel-carrito" aria-live="polite">
                <div className="panel-cabeza">
                  <div>
                    <p className="sobre">Compra</p>
                    <h2>Tu carrito</h2>
                  </div>
                  <button type="button" className="secundario" onClick={() => setAbierto(false)}>Cerrar</button>
                </div>
                {error && <p className="error">{error}</p>}
                {!carrito && !error && <p>Cargando carrito...</p>}
                {carrito && carrito.items.length === 0 && <p className="tarjeta vacio">El carrito está vacío.</p>}
                {carrito && carrito.items.length > 0 && (
                  <ul className="panel-lista">
                    {carrito.items.map((item) => (
                      <li key={item.id} className={item.productoId === destacadoId ? 'item-nuevo' : undefined}>
                        <div>
                          <strong>{item.nombre || `Producto ${item.productoId}`}</strong>
                          <p className="suave">{dinero(item.precioUnitario)} c/u</p>
                        </div>
                        <label className="cantidad">
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
                      </li>
                    ))}
                  </ul>
                )}
                {carrito && carrito.items.length > 0 && (
                  <div className="panel-pie">
                    <strong>Total {dinero(carrito.total)}</strong>
                    <Link className="boton" to="/pago" onClick={() => setAbierto(false)}>Comprar</Link>
                  </div>
                )}
              </aside>
            </>
          )}
        </>
      )}
    </Contexto.Provider>
  );
}

function IconoCarrito() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" />
      <path
        d="M3 4h2.2l2.1 11h11.2l1.8-7H7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
