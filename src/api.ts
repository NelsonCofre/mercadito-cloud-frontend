import type { Sesion } from './tipos';

const CLAVE = 'mercadito-sesion';

export function leerSesionGuardada(): Sesion | null {
  const texto = sessionStorage.getItem(CLAVE);
  if (!texto) {
    return null;
  }
  try {
    return JSON.parse(texto) as Sesion;
  } catch {
    sessionStorage.removeItem(CLAVE);
    return null;
  }
}

export function guardarSesion(sesion: Sesion | null) {
  if (!sesion) {
    sessionStorage.removeItem(CLAVE);
    return;
  }
  sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export class ErrorApi extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const headers = new Headers(opciones.headers);
  const sesion = leerSesionGuardada();
  if (sesion?.token) {
    headers.set('Authorization', `Bearer ${sesion.token}`);
  }
  if (sesion?.usuarioId) {
    headers.set('X-Usuario-Id', sesion.usuarioId);
  }
  if (opciones.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${import.meta.env.VITE_API_URL}${ruta}`, {
      ...opciones,
      headers,
    });
  } catch {
    throw new ErrorApi('No hay conexión con la API. Revisa que el BFF esté en marcha.');
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) as { mensaje?: string; detalles?: string[] } : null;

  if (!respuesta.ok) {
    const detalles = datos?.detalles?.length ? `: ${datos.detalles.join(', ')}` : '';
    throw new ErrorApi((datos?.mensaje ?? 'No se pudo completar la operación') + detalles);
  }

  return datos as T;
}

export function dinero(valor: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor);
}
