import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCarritoUi } from '../componentes/CarritoFlotante';
import { api, dinero, ErrorApi } from '../api';
import type { Carrito, CarritoItem } from '../tipos';

export function PagoPage() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<string[]>([]);
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);
  const { actualizar } = useCarritoUi();

  useEffect(() => {
    api<Carrito>('/api/carrito')
      .then(setCarrito)
      .catch((causa: Error) => setError(causa.message));
  }, []);

  async function simular(evento: FormEvent) {
    evento.preventDefault();
    setError('');
    const fallas = validarPago(nombre, numero, vencimiento, cvv);
    setErrores(fallas);
    if (fallas.length > 0) {
      return;
    }
    if (!carrito) {
      return;
    }
    const detalle: Comprobante = {
      numero: `MC-${Date.now().toString().slice(-8)}`,
      fecha: new Date().toLocaleString('es-CL'),
      nombre: nombre.trim(),
      ultimos4: numero.replace(/\s/g, '').slice(-4),
      items: carrito.items,
      total: carrito.total,
    };
    try {
      await api('/api/carrito', { method: 'DELETE' });
      setComprobante(detalle);
      actualizar();
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo vaciar el carrito.');
    }
  }

  if (comprobante) {
    return (
      <section className="comprobante tarjeta">
        <p className="sobre">Pago aprobado</p>
        <h1>Comprobante</h1>
        <p className="suave">Nº {comprobante.numero} · {comprobante.fecha}</p>
        <p>Titular: {comprobante.nombre}</p>
        <p className="suave">Tarjeta terminada en {comprobante.ultimos4}. El número completo no se guardó.</p>
        <ul className="resumen">
          {comprobante.items.map((item) => (
            <li key={item.id}>
              <span>{item.nombre || `Producto ${item.productoId}`} × {item.cantidad}</span>
              <strong>{dinero(item.subtotal)}</strong>
            </li>
          ))}
        </ul>
        <p className="precio">Total {dinero(comprobante.total)}</p>
        <p className="suave">Compra simulada. No quedó un pedido ni se almacenaron los datos de la tarjeta.</p>
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
    <section>
      <div className="encabezado">
        <div>
          <p className="sobre">Compra</p>
          <h1>Pago simulado</h1>
        </div>
        <strong className="precio">{dinero(carrito.total)}</strong>
      </div>
      <div className="pago-layout">
      <aside className="tarjeta resumen">
        <h2>Tu pedido</h2>
        <ul>
          {carrito.items.map((item) => (
            <li key={item.id}>
              <span>{item.nombre || `Producto ${item.productoId}`} × {item.cantidad}</span>
              <strong>{dinero(item.subtotal)}</strong>
            </li>
          ))}
        </ul>
        <p className="suave">Los datos de la tarjeta no se guardan y no queda un pedido.</p>
      </aside>
      <form className="tarjeta formulario" onSubmit={(evento) => void simular(evento)}>
        <p className="sobre">Simulación</p>
        <h2>Datos de la tarjeta</h2>
        <p className="suave">Estos datos son ficticios y no se guardan.</p>
        {error && <p className="error">{error}</p>}
        {errores.length > 0 && (
          <div className="error" role="alert">
            {errores.map((mensaje) => <p key={mensaje}>{mensaje}</p>)}
          </div>
        )}
        <label>
          Nombre en la tarjeta
          <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} autoComplete="off" />
        </label>
        <label>
          Número
          <input
            value={numero}
            onChange={(evento) => setNumero(formatearNumero(evento.target.value))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
          />
        </label>
        <div className="dos">
          <label>
            Vencimiento
            <input
              value={vencimiento}
              onChange={(evento) => setVencimiento(formatearVencimiento(evento.target.value))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="12/28"
              maxLength={5}
            />
          </label>
          <label>
            CVV
            <input
              value={cvv}
              onChange={(evento) => setCvv(evento.target.value.replace(/\D/g, '').slice(0, 3))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="123"
              maxLength={3}
            />
          </label>
        </div>
        <button type="submit">Simular pago por {dinero(carrito.total)}</button>
      </form>
      </div>
    </section>
  );
}

type Comprobante = {
  numero: string;
  fecha: string;
  nombre: string;
  ultimos4: string;
  items: CarritoItem[];
  total: number;
};

function validarPago(nombre: string, numero: string, vencimiento: string, cvv: string) {
  const mensajes: string[] = [];
  const limpio = nombre.trim();
  if (limpio.length < 3) {
    mensajes.push('El nombre debe tener al menos 3 caracteres.');
  } else if (!/^[\p{L}\s'.-]+$/u.test(limpio)) {
    mensajes.push('El nombre solo puede contener letras.');
  }

  const digitos = numero.replace(/\s/g, '');
  if (!/^\d+$/.test(digitos)) {
    mensajes.push('El número de tarjeta solo puede contener dígitos.');
  } else if (digitos.length !== 16) {
    mensajes.push(`El número de tarjeta debe tener 16 dígitos. Ahora tiene ${digitos.length}.`);
  }

  const coincidencia = /^(\d{2})\/(\d{2})$/.exec(vencimiento.trim());
  if (!coincidencia) {
    mensajes.push('El vencimiento debe tener el formato MM/AA.');
  } else {
    const mes = Number(coincidencia[1]);
    const anio = 2000 + Number(coincidencia[2]);
    if (mes < 1 || mes > 12) {
      mensajes.push('El mes de vencimiento debe estar entre 01 y 12.');
    } else {
      const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
      if (finDeMes < new Date()) {
        mensajes.push('La tarjeta está vencida.');
      }
    }
  }

  if (!/^\d{3}$/.test(cvv)) {
    mensajes.push('El CVV debe tener 3 dígitos.');
  }

  return mensajes;
}

function formatearNumero(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 16);
  return digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatearVencimiento(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 4);
  if (digitos.length <= 2) {
    return digitos;
  }
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}
