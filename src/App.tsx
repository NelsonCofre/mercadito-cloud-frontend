import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout, RutaPrivada } from './componentes/Layout';
import { CallbackPage } from './paginas/CallbackPage';
import { CarritoPage } from './paginas/CarritoPage';
import { CatalogoPage } from './paginas/CatalogoPage';
import { CategoriasPage } from './paginas/CategoriasPage';
import { LoginPage } from './paginas/LoginPage';
import { PagoPage } from './paginas/PagoPage';
import { ProductoFormPage } from './paginas/ProductoFormPage';
import { ProductoPage } from './paginas/ProductoPage';
import { ProductosGestionPage } from './paginas/ProductosGestionPage';
import { inicioDe, useSesion } from './sesion-estado';

export default function App() {
  const { sesion } = useSesion();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route element={<Layout />}>
        <Route element={<RutaPrivada roles={['CLIENTE']} />}>
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/productos/:id" element={<ProductoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/pago" element={<PagoPage />} />
        </Route>
        <Route element={<RutaPrivada roles={['VENDEDOR']} />}>
          <Route path="/vendedor/productos" element={<ProductosGestionPage modo="vendedor" />} />
          <Route path="/vendedor/productos/:id/editar" element={<ProductoFormPage modo="vendedor" />} />
        </Route>
        <Route element={<RutaPrivada roles={['ADMIN']} />}>
          <Route path="/admin/productos" element={<ProductosGestionPage modo="admin" />} />
          <Route path="/admin/productos/nuevo" element={<ProductoFormPage modo="crear" />} />
          <Route path="/admin/productos/:id/editar" element={<ProductoFormPage modo="editar" />} />
          <Route path="/admin/categorias" element={<CategoriasPage />} />
        </Route>
        <Route path="*" element={<Navigate to={sesion ? inicioDe(sesion.rol) : '/'} replace />} />
      </Route>
    </Routes>
  );
}
