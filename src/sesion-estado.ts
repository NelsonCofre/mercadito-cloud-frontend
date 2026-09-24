import { createContext, useContext } from 'react';
import type { Rol, Sesion } from './tipos';

type SesionContexto = {
  sesion: Sesion | null;
  entrarLocal: (rol: Rol, nombre: string) => void;
  establecer: (sesion: Sesion) => void;
  cerrar: () => void;
};

export const ContextoSesion = createContext<SesionContexto | null>(null);

export function useSesion() {
  const contexto = useContext(ContextoSesion);
  if (!contexto) {
    throw new Error('La sesión no está disponible');
  }
  return contexto;
}

export function inicioDe(rol: Rol) {
  if (rol === 'ADMIN') {
    return '/admin/productos';
  }
  if (rol === 'VENDEDOR') {
    return '/vendedor/productos';
  }
  return '/catalogo';
}
