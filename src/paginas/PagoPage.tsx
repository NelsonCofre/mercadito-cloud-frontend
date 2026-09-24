import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, dinero, ErrorApi } from '../api';
import type { Carrito } from '../tipos';

export function PagoPage() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [aprobado, setAprobado] = useState(false);

  useEffect(() => {
    api<Carrito>('/api/carrito')
      .then(setCarrito)
      .catch((causa: Error) => setError(causa.message));
  }, []);

  async function simular(evento: FormEvent) {
    evento.preventDefault();
    setError('');
    if (numero.replace(/\s/g, '').length < 12 || cvv.length < 3 || !nombre.trim() || !vencimiento.trim()) {
      setError('Completa los datos de demostración para simular el pago.');
      return;
    }
    try {
      await api('/api/carrito', { method: 'DELETE' });
      setAprobado(true);
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo vaciar el carrito.');
    }
  }

  if (aprobado) {
    return (
      <section className="tarjeta detalle">
        <p className="sobre">Resultado</p>
        <h1>Pago aprobado</h1>
        <p>La compra simulada terminó y el carrito quedó vacío. No se guardó ningún pedido ni dato de tarjeta.</p>
        <Link className="boton" to="/catalogo">Volver al catálogo</Link>
      </section>
    );
  }

  if (!carrito && error) {
    return <p className="error">{error}</p>;
  }
  if (!carrito) {
    return <p>Cargando pago...</p>;
  }
  if (carrito.items.length === 0) {
    return (
      <section>
        <h1>No hay productos para pagar</h1>
        <Link to="/catalogo">Ir al catálogo</Link>
      </section>
    );
  }

  return (
    <section className="pago">
      <form className="tarjeta formulario" onSubmit={(evento) => void simular(evento)}>
        <p className="sobre">Simulación</p>
        <h1>Pago</h1>
        <p>Estos datos son ficticios y no se guardan.</p>
        {error && <p className="error">{error}</p>}
        <label>
          Nombre en la tarjeta
          <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
        </label>
        <label>
          Número
          <input value={numero} onChange={(evento) => setNumero(evento.target.value)} inputMode="numeric" placeholder="4242 4242 4242 4242" />
        </label>
        <div className="dos">
          <label>
            Vencimiento
            <input value={vencimiento} onChange={(evento) => setVencimiento(evento.target.value)} placeholder="12/28" />
          </label>
          <label>
            CVV
            <input value={cvv} onChange={(evento) => setCvv(evento.target.value)} inputMode="numeric" />
          </label>
        </div>
        <button type="submit">Simular pago por {dinero(carrito.total)}</button>
      </form>
    </section>
  );
}
