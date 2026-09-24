import type { Rol, Sesion } from './tipos';

const VERIFICADOR = 'mercadito-pkce';

export function cognitoConfigurado() {
  return Boolean(
    import.meta.env.VITE_COGNITO_DOMAIN
    && import.meta.env.VITE_COGNITO_CLIENT_ID
    && import.meta.env.VITE_COGNITO_REDIRECT_URI,
  );
}

export async function redirigirACognito() {
  const verificador = textoAleatorio(64);
  sessionStorage.setItem(VERIFICADOR, verificador);
  const desafio = await desafioS256(verificador);
  const url = new URL(`https://${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', import.meta.env.VITE_COGNITO_CLIENT_ID);
  url.searchParams.set('redirect_uri', import.meta.env.VITE_COGNITO_REDIRECT_URI);
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', desafio);
  window.location.assign(url.toString());
}

const intercambios = new Map<string, Promise<Sesion>>();

export function sesionDesdeCodigo(codigo: string): Promise<Sesion> {
  const enCurso = intercambios.get(codigo);
  if (enCurso) {
    return enCurso;
  }
  const intercambio = completarIntercambio(codigo);
  intercambios.set(codigo, intercambio);
  intercambio.catch(() => {
    intercambios.delete(codigo);
  });
  return intercambio;
}

async function completarIntercambio(codigo: string): Promise<Sesion> {
  const verificador = sessionStorage.getItem(VERIFICADOR);
  if (!verificador) {
    throw new Error('La sesión de acceso expiró. Vuelve a iniciar sesión.');
  }

  const cuerpo = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    code: codigo,
    redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
    code_verifier: verificador,
  });

  const respuesta = await fetch(`https://${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: cuerpo,
  });

  if (!respuesta.ok) {
    throw new Error('Cognito no entregó la sesión.');
  }

  const tokens = await respuesta.json() as { id_token: string };
  sessionStorage.removeItem(VERIFICADOR);
  return sesionDesdeToken(tokens.id_token);
}

export function urlCierreCognito() {
  const url = new URL(`https://${import.meta.env.VITE_COGNITO_DOMAIN}/logout`);
  url.searchParams.set('client_id', import.meta.env.VITE_COGNITO_CLIENT_ID);
  url.searchParams.set('logout_uri', import.meta.env.VITE_COGNITO_LOGOUT_URI || import.meta.env.VITE_COGNITO_REDIRECT_URI);
  return url.toString();
}

function sesionDesdeToken(token: string): Sesion {
  const payload = decodificarJwt(token);
  const grupos = normalizarGrupos(payload['cognito:groups']);
  const rol = rolDesdeGrupos(grupos);
  const sub = String(payload.sub ?? '');
  if (!sub || !rol) {
    throw new Error('El usuario no tiene un rol de Mercadito Cloud.');
  }
  const nombre = String(payload.email ?? payload['cognito:username'] ?? sub);
  return { usuarioId: sub, nombre, rol, token };
}

function rolDesdeGrupos(grupos: string[]): Rol | null {
  if (grupos.includes('ADMIN')) {
    return 'ADMIN';
  }
  if (grupos.includes('VENDEDOR')) {
    return 'VENDEDOR';
  }
  if (grupos.includes('CLIENTE')) {
    return 'CLIENTE';
  }
  return null;
}

function normalizarGrupos(valor: unknown) {
  if (Array.isArray(valor)) {
    return valor.map(String);
  }
  if (typeof valor === 'string' && valor) {
    return [valor];
  }
  return [];
}

function decodificarJwt(token: string) {
  const parte = token.split('.')[1];
  if (!parte) {
    throw new Error('El token recibido no es válido.');
  }
  const json = atob(parte.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json) as Record<string, unknown>;
}

async function desafioS256(verificador: string) {
  const datos = new TextEncoder().encode(verificador);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function textoAleatorio(largo: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(largo));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .slice(0, largo);
}
