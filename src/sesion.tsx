import { useMemo, useState, type ReactNode } from 'react';
import { guardarSesion, leerSesionGuardada } from './api';
import { cognitoConfigurado, urlCierreCognito } from './cognito';
import { ContextoSesion } from './sesion-estado';
import type { Rol, Sesion } from './tipos';

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => leerSesionGuardada());

  const valor = useMemo(() => ({
    sesion,
    entrarLocal: (rol: Rol, nombre: string) => {
      const nueva: Sesion = {
        usuarioId: `local-${rol.toLowerCase()}`,
        nombre: nombre.trim() || rol,
        rol,
        token: null,
      };
      guardarSesion(nueva);
      setSesion(nueva);
    },
    establecer: (nueva: Sesion) => {
      guardarSesion(nueva);
      setSesion(nueva);
    },
    cerrar: () => {
      const teniaToken = Boolean(leerSesionGuardada()?.token);
      guardarSesion(null);
      setSesion(null);
      if (teniaToken && cognitoConfigurado()) {
        window.location.assign(urlCierreCognito());
      }
    },
  }), [sesion]);

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
