import { useEffect, useState, type FormEvent } from 'react';
import { api, ErrorApi } from '../api';
import type { Categoria } from '../tipos';

const vacia = { id: 0, nombre: '', descripcion: '' };

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formulario, setFormulario] = useState(vacia);
  const [error, setError] = useState('');

  function cargar() {
    api<Categoria[]>('/api/admin/categorias')
      .then((lista) => {
        setCategorias(lista);
        setError('');
      })
      .catch((causa: Error) => setError(causa.message));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    const cuerpo = JSON.stringify({ nombre: formulario.nombre, descripcion: formulario.descripcion });
    try {
      if (formulario.id) {
        await api(`/api/admin/categorias/${formulario.id}`, { method: 'PUT', body: cuerpo });
      } else {
        await api('/api/admin/categorias', { method: 'POST', body: cuerpo });
      }
      setFormulario(vacia);
      cargar();
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo guardar la categoría.');
    }
  }

  async function eliminar(id: number) {
    if (!window.confirm('¿Eliminar esta categoría?')) {
      return;
    }
    try {
      await api(`/api/admin/categorias/${id}`, { method: 'DELETE' });
      cargar();
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo eliminar la categoría.');
    }
  }

  return (
    <section>
      <div className="encabezado">
        <div>
          <p className="sobre">Administración</p>
          <h1>Categorías</h1>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <form className="tarjeta formulario" onSubmit={(evento) => void guardar(evento)}>
        <h2>{formulario.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <label>
          Nombre
          <input
            value={formulario.nombre}
            onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
            required
          />
        </label>
        <label>
          Descripción
          <input
            value={formulario.descripcion}
            onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
          />
        </label>
        <div className="acciones">
          <button type="submit">Guardar</button>
          {formulario.id > 0 && (
            <button type="button" className="secundario" onClick={() => setFormulario(vacia)}>Cancelar</button>
          )}
        </div>
      </form>
      <div className="lista">
        {categorias.map((categoria) => (
          <article key={categoria.id} className="tarjeta fila">
            <div>
              <h2>{categoria.nombre}</h2>
              <p>{categoria.descripcion || 'Sin descripción'}</p>
            </div>
            <button type="button" className="secundario" onClick={() => setFormulario({
              id: categoria.id,
              nombre: categoria.nombre,
              descripcion: categoria.descripcion ?? '',
            })}
            >
              Editar
            </button>
            <button type="button" className="secundario" onClick={() => void eliminar(categoria.id)}>Eliminar</button>
          </article>
        ))}
      </div>
    </section>
  );
}
