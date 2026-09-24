import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { cognitoConfigurado, redirigirACognito } from '../cognito';
import { inicioDe, useSesion } from '../sesion-estado';
import type { Rol } from '../tipos';

export function LoginPage() {
  const { sesion, entrarLocal } = useSesion();
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<Rol>('CLIENTE');
  const cognitoListo = cognitoConfigurado();

  if (sesion) {
    return <Navigate to={inicioDe(sesion.rol)} replace />;
  }

  function entrar(evento: FormEvent) {
    evento.preventDefault();
    entrarLocal(rol, nombre);
  }

  function iniciarSesion() {
    void redirigirACognito();
  }

  return (
    <div className="home">
      <header className="home-barra">
        <a className="marca" href="#inicio">Mercadito Cloud</a>
        {cognitoListo ? (
          <button type="button" onClick={iniciarSesion}>Iniciar sesión</button>
        ) : (
          <a className="boton" href="#acceso">Iniciar sesión</a>
        )}
      </header>

      <main id="inicio" className="home-cuerpo">
        <section className="hero">
          <p className="sobre">Plataforma comercial</p>
          <h1>El catálogo, el carrito y la administración en un solo acceso.</h1>
          <p className="hero-texto">
            Cada cuenta entra con su rol. El cliente compra, el vendedor actualiza productos
            y el administrador organiza el almacén.
          </p>
          {cognitoListo ? (
            <button type="button" className="boton-grande" onClick={iniciarSesion}>Iniciar sesión</button>
          ) : (
            <a className="boton boton-grande" href="#acceso">Iniciar sesión</a>
          )}
        </section>

        <section className="home-pasos" aria-label="Qué puedes hacer">
          <article className="tarjeta">
            <p className="sobre">Cliente</p>
            <h2>Catálogo y carrito</h2>
            <p>Mira los productos activos, arma tu carrito y simula el pago.</p>
          </article>
          <article className="tarjeta">
            <p className="sobre">Vendedor</p>
            <h2>Productos a la vista</h2>
            <p>Revisa el catálogo interno y actualiza los datos de cada producto.</p>
          </article>
          <article className="tarjeta">
            <p className="sobre">Administrador</p>
            <h2>El almacén completo</h2>
            <p>Crea productos, organiza categorías y decide qué sigue a la venta.</p>
          </article>
        </section>

        {!cognitoListo && (
          <section id="acceso" className="tarjeta acceso-local">
            <h2>Iniciar sesión</h2>
            <p className="aviso">Cognito aún no está configurado. Este acceso local solo sirve para probar las pantallas.</p>
            <form onSubmit={entrar} className="formulario">
              <label>
                Nombre
                <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} placeholder="Ana" />
              </label>
              <label>
                Rol
                <select value={rol} onChange={(evento) => setRol(evento.target.value as Rol)}>
                  <option value="CLIENTE">Cliente</option>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
              <button type="submit">Entrar</button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
