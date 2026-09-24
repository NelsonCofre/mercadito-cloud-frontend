import { Link, Navigate, Outlet } from 'react-router-dom';
import { inicioDe, useSesion } from '../sesion-estado';
import type { Rol } from '../tipos';

export function RutaPrivada({ roles }: { roles: Rol[] }) {
  const { sesion } = useSesion();
  if (!sesion) {
    return <Navigate to="/" replace />;
  }
  if (!roles.includes(sesion.rol)) {
    return <Navigate to={inicioDe(sesion.rol)} replace />;
  }
  return <Outlet />;
}

export function Layout() {
  const { sesion, cerrar } = useSesion();
  if (!sesion) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app">
      <header className="barra">
        <Link to={inicioDe(sesion.rol)} className="marca">Mercadito Cloud</Link>
        <nav>
          {sesion.rol === 'CLIENTE' && (
            <>
              <Link to="/catalogo">Catálogo</Link>
              <Link to="/carrito">Carrito</Link>
            </>
          )}
          {sesion.rol === 'VENDEDOR' && <Link to="/vendedor/productos">Productos</Link>}
          {sesion.rol === 'ADMIN' && (
            <>
              <Link to="/admin/productos">Productos</Link>
              <Link to="/admin/categorias">Categorías</Link>
            </>
          )}
        </nav>
        <div className="sesion">
          <span>{sesion.nombre}</span>
          <small>{etiqueta(sesion.rol)}</small>
          <button type="button" className="secundario" onClick={cerrar}>Salir</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function etiqueta(rol: Rol) {
  if (rol === 'ADMIN') {
    return 'Administrador';
  }
  if (rol === 'VENDEDOR') {
    return 'Vendedor';
  }
  return 'Cliente';
}
