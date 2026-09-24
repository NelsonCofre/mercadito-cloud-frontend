import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { redirigirACognito, sesionDesdeCodigo } from '../cognito';
import { inicioDe, useSesion } from '../sesion-estado';

export function CallbackPage() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const { establecer } = useSesion();
  const establecerRef = useRef(establecer);
  establecerRef.current = establecer;
  const codigo = parametros.get('code');
  const errorCognito = parametros.get('error_description') ?? parametros.get('error');
  const [errorRemoto, setErrorRemoto] = useState('');
  const error = errorCognito ?? (codigo ? errorRemoto : 'Cognito no devolvió un código de acceso.');

  useEffect(() => {
    if (!codigo || errorCognito) {
      return;
    }
    let vigente = true;
    sesionDesdeCodigo(codigo)
      .then((sesion) => {
        if (!vigente) {
          return;
        }
        establecerRef.current(sesion);
        navegar(inicioDe(sesion.rol), { replace: true });
      })
      .catch((causa: Error) => {
        if (vigente) {
          setErrorRemoto(causa.message);
        }
      });
    return () => {
      vigente = false;
    };
  }, [codigo, errorCognito, navegar]);

  return (
    <section className="acceso">
      <div className="tarjeta acceso-tarjeta">
        <h1>Conectando con Cognito</h1>
        {error ? (
          <>
            <p className="error">{error}</p>
            <button type="button" onClick={() => void redirigirACognito()}>Iniciar sesión</button>
          </>
        ) : (
          <p>Espera un momento.</p>
        )}
      </div>
    </section>
  );
}
