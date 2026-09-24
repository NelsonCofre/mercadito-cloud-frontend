import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ErrorApi } from '../api';
import type { Categoria, Producto } from '../tipos';

export function ProductoFormPage({ modo }: { modo: 'crear' | 'editar' | 'vendedor' }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Categoria[]>('/api/admin/categorias')
      .then(setCategorias)
      .catch((causa: Error) => setError(causa.message));
  }, []);

  useEffect(() => {
    if (modo === 'crear' || !id) {
      return;
    }
    api<Producto>(`/api/admin/productos/${id}`)
      .then((producto) => {
        setNombre(producto.nombre);
        setDescripcion(producto.descripcion ?? '');
        setPrecio(String(producto.precio));
        setStock(String(producto.stock));
        setCategoriaId(String(producto.categoriaId));
        setActivo(producto.activo);
      })
      .catch((causa: Error) => setError(causa.message));
  }, [id, modo]);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    setError('');
    const cuerpo: Record<string, unknown> = {
      nombre,
      descripcion,
      precio: Number(precio),
      stock: Number(stock),
      categoriaId: Number(categoriaId),
    };
    if (modo !== 'vendedor') {
      cuerpo.activo = activo;
    }
    try {
      if (modo === 'crear') {
        await api('/api/admin/productos', { method: 'POST', body: JSON.stringify(cuerpo) });
        navegar('/admin/productos');
        return;
      }
      await api(`/api/admin/productos/${id}`, { method: 'PUT', body: JSON.stringify(cuerpo) });
      navegar(modo === 'vendedor' ? '/vendedor/productos' : '/admin/productos');
    } catch (causa) {
      setError(causa instanceof ErrorApi ? causa.message : 'No se pudo guardar el producto.');
    }
  }

  const volver = modo === 'vendedor' ? '/vendedor/productos' : '/admin/productos';

  return (
    <form className="tarjeta formulario" onSubmit={(evento) => void guardar(evento)}>
      <Link to={volver}>Volver</Link>
      <h1>{modo === 'crear' ? 'Nuevo producto' : 'Editar producto'}</h1>
      {error && <p className="error">{error}</p>}
      <label>
        Nombre
        <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} required />
      </label>
      <label>
        Descripción
        <textarea value={descripcion} onChange={(evento) => setDescripcion(evento.target.value)} rows={3} />
      </label>
      <div className="dos">
        <label>
          Precio
          <input type="number" min="1" step="1" value={precio} onChange={(evento) => setPrecio(evento.target.value)} required />
        </label>
        <label>
          Stock
          <input type="number" min="0" step="1" value={stock} onChange={(evento) => setStock(evento.target.value)} required />
        </label>
      </div>
      <label>
        Categoría
        <select value={categoriaId} onChange={(evento) => setCategoriaId(evento.target.value)} required>
          <option value="">Selecciona</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
          ))}
        </select>
      </label>
      {modo !== 'vendedor' && (
        <label className="check">
          <input type="checkbox" checked={activo} onChange={(evento) => setActivo(evento.target.checked)} />
          Activo en el catálogo
        </label>
      )}
      <button type="submit">Guardar</button>
    </form>
  );
}
