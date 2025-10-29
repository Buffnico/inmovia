import { useState, useEffect } from 'react'
import { postPreview, getModelos } from '../lib/api'

export default function PortadasPreview() {
  const [modelos, setModelos] = useState([])
  const [form, setForm] = useState({
    modelo: 'clasico',
    direccion: 'Av. Siempreviva 123',
    precio: 'USD 120.000',
    ambientes: '3',
    superficie: '85',
    imagen: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => { getModelos().then(d => setModelos(d.modelos || [])).catch(()=> setModelos([])) }, [])

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setPreview(null)
    try { const data = await postPreview(form); setPreview(data?.preview ?? null) }
    catch (err) { setError(err.message || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Preview simple</h2>
        <form onSubmit={onSubmit} className="form">
          <label>Modelo
            <select name="modelo" value={form.modelo} onChange={onChange}>
              {(modelos.length ? modelos : [{id:'clasico', nombre:'Clásico'}]).map(m =>
                <option key={m.id} value={m.id}>{m.nombre ?? m.id}</option>
              )}
            </select>
          </label>
          <label>Dirección*<input name="direccion" value={form.direccion} onChange={onChange} required /></label>
          <label>Precio*<input name="precio" value={form.precio} onChange={onChange} required /></label>
          <label>Ambientes<input name="ambientes" value={form.ambientes} onChange={onChange} /></label>
          <label>Superficie (m²)<input name="superficie" value={form.superficie} onChange={onChange} /></label>
          <label>URL de imagen<input name="imagen" value={form.imagen} onChange={onChange} placeholder="https://... o /images/casa.jpg" /></label>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Generando...' : 'Generar'}</button>
          {error && <div className="alert error">⚠️ {error}</div>}
        </form>
      </section>

      <section className="card preview">
        <h2>Resultado</h2>
        {!preview && !loading && !error && <p className="muted">Completa el formulario y genera.</p>}
        {preview && <PreviewCard data={preview} />}
      </section>
    </div>
  )
}

function PreviewCard({ data }) {
  const { titulo, precio, ambientes, superficie, imagenUrl, tieneImagen } = data
  return (
    <div className="cover">
      <div className="cover-glow" />
      <div className="cover-content">
        {imagenUrl && (
          <div className="cover-media">
            <img className="cover-img" src={imagenUrl} alt={titulo} onError={(e)=>{ e.currentTarget.style.display='none' }} />
          </div>
        )}
        <h3 className="cover-title">{titulo}</h3>
        <div className="cover-badges">
          {precio && <span className="badge">{precio}</span>}
          {ambientes && <span className="badge">{ambientes} amb</span>}
          {superficie && <span className="badge">{superficie} m²</span>}
          <span className={`badge ${tieneImagen ? 'ok' : 'warn'}`}>{tieneImagen ? 'Con imagen' : 'Sin imagen'}</span>
        </div>
      </div>
    </div>
  )
}
