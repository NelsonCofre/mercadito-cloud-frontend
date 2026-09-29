import { useState } from 'react';

export type Vista = 'lista' | 'tarjetas';

export function useVista(clave: string, inicial: Vista) {
  const [vista, setVista] = useState<Vista>(() => {
    const guardada = localStorage.getItem(clave);
    return guardada === 'lista' || guardada === 'tarjetas' ? guardada : inicial;
  });

  function cambiar(siguiente: Vista) {
    localStorage.setItem(clave, siguiente);
    setVista(siguiente);
  }

  return [vista, cambiar] as const;
}

export function SelectorVista({ vista, onChange }: { vista: Vista; onChange: (vista: Vista) => void }) {
  return (
    <div className="selector-vista" role="group" aria-label="Cómo ver los productos">
      <button
        type="button"
        aria-pressed={vista === 'lista'}
        className={vista === 'lista' ? undefined : 'secundario'}
        onClick={() => onChange('lista')}
      >
        Lista
      </button>
      <button
        type="button"
        aria-pressed={vista === 'tarjetas'}
        className={vista === 'tarjetas' ? undefined : 'secundario'}
        onClick={() => onChange('tarjetas')}
      >
        Tarjetas
      </button>
    </div>
  );
}

export function tono(nombre: string) {
  const paleta = ['#1d4ed8', '#0f766e', '#b45309', '#6d28d9', '#be123c'];
  const suma = [...nombre].reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return paleta[suma % paleta.length];
}
