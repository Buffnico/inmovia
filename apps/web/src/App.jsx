import { useEffect, useState } from 'react'
import {
  ping,
  getModelos,
  postPreview,
  uploadModelo,
  deleteModelo,
  instanciarPortada,
} from './lib/api'
import './index.css'
import './themes.css'

export default function App() {
  // Tema visual
  const [theme, setTheme] = useState('inmovia')

  // Estado API y modelos
  const [apiOk, setApiOk] = useState(false)
  const [modelos, setModelos] = useState([])

  // Formulario de portada (para preview)
  const [form, setForm] = useState({
    modelo: 'clasico',
    direccion: 'Av. Siempreviva 123',
    precio: 'USD 120.000',
    ambientes: '3',
    superficie: '85',
    imagen: ''
  })

  // UI preview
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  // Aplicar tema al <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Chequeo inicial + carga de modelos
  useEffect(() => {
    ping().then(() => setApiOk(true)).catch(() => setApiOk(false))
    getModelos()
      .then(data => {
        const lista = Array.isArray(data?.modelos) ? data.modelos : []
        setModelos(lista.length ? lista : [{ id: 'clasico', nombre: 'Clásico' }])
        if (lista.length && !lista.find(m => m.id === form.modelo)) {
          setForm(f => ({ ...f, modelo: lista[0].id }))
        }
      })
      .catch(() => setModelos([{ id: 'clasico', nombre: 'Clásico' }]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setPreview(null)
    try {
      const data = await postPreview(form)
      setPreview(data?.preview ?? null)
    } catch (err) {
      setError(err?.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const opcionesModelo = modelos.length ? modelos : [{ id: 'clasico', nombre: 'Clásico' }]

  return (
    <div className="container">
      <header className="hero">
        <h1>Inmovia — Generador de Portadas</h1>
        <p className="subtitle">
          {apiOk ? 'API conectada ✅' : 'API desconectada ❌ (¿corriendo en :3001?)'}
        </p>

        {/* Selector de tema */}
        <div className="form" style={{ maxWidth: 360, margin: '8px auto 0' }}>
          <label>
            Tema visual
            <select value={theme} onChange={e => setTheme(e.target.value)}>
              <option value="inmovia">Inmovia (oscuro)</option>
              <option value="dark-neon">Dark Neón</option>
              <option value="green">Verde inmobiliario</option>
              <option value="light">Claro</option>
            </select>
          </label>
        </div>
      </header>

      {/* Form + Preview (no IA) */}
      <main className="grid">
        <section className="card">
          <h2>Datos de la propiedad</h2>
          <form onSubmit={onSubmit} className="form">
            <label>
              Modelo de portada
              <select name="modelo" value={form.modelo} onChange={onChange}>
                {opcionesModelo.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre ?? m.id}</option>
                ))}
              </select>
            </label>

            <label>
              Dirección*
              <input name="direccion" value={form.direccion} onChange={onChange} required />
            </label>

            <label>
              Precio*
              <input name="precio" value={form.precio} onChange={onChange} required />
            </label>

            <label>
              Ambientes
              <input name="ambientes" value={form.ambientes} onChange={onChange} />
            </label>

            <label>
              Superficie (m²)
              <input name="superficie" value={form.superficie} onChange={onChange} />
            </label>

            <label>
              URL de imagen (opcional)
              <input name="imagen" value={form.imagen} onChange={onChange} placeholder="https://... o /images/casa.jpg" />
            </label>

            <button type="submit" className="btn" disabled={loading || !apiOk}>
              {loading ? 'Generando...' : 'Generar portada (preview)'}
            </button>

            {error && <div className="alert error">⚠️ {error}</div>}
          </form>
        </section>

        <section className="card preview">
          <h2>Previsualización</h2>
          {!preview && !loading && !error && (
            <p className="muted">Elegí un modelo, completá los datos y presioná <strong>Generar portada</strong>.</p>
          )}
          {preview && <PreviewSwitcher data={preview} />}
        </section>
      </main>

      {/* Admin de modelos y generación con IA (OCR + slots de fotos) */}
      <section className="card" style={{ marginTop: 16 }}>
        <h2>Administrador de modelos (Owner)</h2>
        <ModelosAdmin />
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Generar para redes con IA (OCR + fotos)</h2>
        <GenerarRedesIA currentForm={form} />
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Inmovia</span>
      </footer>
    </div>
  )
}

/* ==================== PREVIEW ==================== */

function PreviewSwitcher({ data }) {
  const { modelo } = data
  if (modelo === 'minimal') return <PreviewMinimal data={data} />
  if (modelo === 'banner')  return <PreviewBanner data={data} />
  return <PreviewClasico data={data} />
}

function PreviewClasico({ data }) {
  const { titulo, precio, ambientes, superficie, imagenUrl, tieneImagen } = data
  return (
    <div className="cover">
      <div className="cover-glow" />
      <div className="cover-content">
        {imagenUrl ? (
          <div className="cover-media">
            <img
              className="cover-img"
              src={imagenUrl}
              alt={titulo}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        ) : null}
        <h3 className="cover-title">{titulo}</h3>
        <div className="cover-badges">
          {precio && <span className="badge">{precio}</span>}
          {ambientes && <span className="badge">{ambientes} amb</span>}
          {superficie && <span className="badge">{superficie} m²</span>}
          <span className={`badge ${tieneImagen ? 'ok' : 'warn'}`}>
            {tieneImagen ? 'Con imagen' : 'Sin imagen'}
          </span>
        </div>
        <p className="cover-note">Modelo Clásico — imagen superior, badges y glow.</p>
      </div>
    </div>
  )
}

function PreviewMinimal({ data }) {
  const { titulo, precio, ambientes, superficie, imagenUrl } = data
  return (
    <div className="cover-minimal">
      {imagenUrl ? (
        <div className="cover-media">
          <img
            className="cover-img"
            src={imagenUrl}
            alt={titulo}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      ) : null}
      <div className="cover-minimal-inner">
        <div className="minimal-title">{titulo}</div>
        <div className="minimal-meta">
          {precio && <span>{precio}</span>}
          {ambientes && <span> • {ambientes} amb</span>}
          {superficie && <span> • {superficie} m²</span>}
        </div>
      </div>
    </div>
  )
}

function PreviewBanner({ data }) {
  const { titulo, precio, ambientes, superficie, imagenUrl } = data
  return (
    <div className="cover-banner">
      <div className="banner-top">
        <div className="banner-brand">INMOVIA</div>
        <div className="banner-price">{precio}</div>
      </div>
      {imagenUrl ? (
        <div className="cover-media">
          <img
            className="cover-img"
            src={imagenUrl}
            alt={titulo}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      ) : null}
      <div className="banner-body">
        <div className="banner-title">{titulo}</div>
        <div className="banner-badges">
          {ambientes && <span className="badge">{ambientes} amb</span>}
          {superficie && <span className="badge">{superficie} m²</span>}
        </div>
      </div>
    </div>
  )
}

/* ==================== OWNER: ADMIN MODELOS ==================== */

function ModelosAdmin() {
  const [modelos, setModelos] = useState([])
  const [file, setFile] = useState(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      const data = await getModelos()
      setModelos(data.modelos || [])
    } catch {
      setModelos([])
    }
  }

  useEffect(() => { cargar() }, [])

  const onUpload = async (e) => {
    e.preventDefault()
    setError('')
    if (!file || !nombre.trim()) {
      setError('Faltan archivo y/o nombre')
      return
    }
    setSubiendo(true)
    try {
      await uploadModelo({ file, nombre: nombre.trim(), descripcion: descripcion.trim() })
      setFile(null); setNombre(''); setDescripcion('')
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al subir')
    } finally {
      setSubiendo(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('¿Eliminar este modelo?')) return
    try {
      await deleteModelo(id)
      await cargar()
    } catch (err) {
      alert(err.message || 'No se pudo eliminar')
    }
  }

  return (
    <div className="form">
      <form onSubmit={onUpload} className="form" style={{ maxWidth: 520 }}>
        <label>
          Archivo de ejemplo (imagen)
          <input type="file" accept="image/*" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
        </label>
        <label>
          Nombre del modelo*
          <input value={nombre} onChange={(e)=> setNombre(e.target.value)} placeholder="Ej: Moderno Azul" required />
        </label>
        <label>
          Descripción (opcional)
          <input value={descripcion} onChange={(e)=> setDescripcion(e.target.value)} placeholder="Ej: fondo con franja azul" />
        </label>
        <button className="btn" type="submit" disabled={subiendo}>
          {subiendo ? 'Subiendo...' : 'Subir modelo'}
        </button>
        {error && <div className="alert error">⚠️ {error}</div>}
      </form>

      <div style={{ marginTop: 12 }}>
        <h3>Modelos actuales</h3>
        {!modelos.length && <p className="muted">No hay modelos aún.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {modelos.map(m => (
            <div key={m.id} className="card">
              <div style={{ aspectRatio: '1.6/1', overflow: 'hidden', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={m.url} alt={m.nombre} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700 }}>{m.nombre}</div>
                <div className="muted" style={{ fontSize: 13 }}>{m.descripcion || m.id}</div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop: 8 }}>
                <button className="btn" type="button" onClick={()=> navigator.clipboard.writeText(m.id)}>Copiar ID</button>
                <button
                  className="btn"
                  type="button"
                  onClick={()=> onDelete(m.id)}
                  style={{ background:'linear-gradient(90deg,#f87171,#fb7185)' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ==================== OWNER: GENERAR PARA REDES (IA OCR + FOTOS) ==================== */

function GenerarRedesIA({ currentForm }) {
  const [formato, setFormato] = useState('square') // square | portrait | landscape
  const [modeloId, setModeloId] = useState('')
  const [modelos, setModelos] = useState([])
  const [generando, setGenerando] = useState(false)
  const [resultadoUrl, setResultadoUrl] = useState('')
  const [error, setError] = useState('')
  const [urls, setUrls] = useState('') // una por línea
  const [principalIndex, setPrincipalIndex] = useState(0)

  useEffect(() => {
    getModelos()
      .then(data => {
        const list = data.modelos || []
        setModelos(list)
        if (list.length && !modeloId) setModeloId(list[0].id)
      })
      .catch(()=> setModelos([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fotosArray = urls
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  useEffect(() => {
    if (principalIndex >= fotosArray.length) setPrincipalIndex(0)
  }, [urls]) // eslint-disable-line

  const onGenerar = async () => {
    setError(''); setResultadoUrl(''); setGenerando(true)
    try {
      const payload = {
        modeloId,
        formato,
        direccion: currentForm.direccion,
        precio: currentForm.precio,
        ambientes: currentForm.ambientes,
        superficie: currentForm.superficie,
        fotos: fotosArray,
        principalIndex: Number.isFinite(principalIndex) ? principalIndex : 0
      }
      const data = await instanciarPortada(payload)
      setResultadoUrl(data.url || '')
    } catch (err) {
      setError(err.message || 'Error al generar')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="form">
      <div style={{ display: 'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
        <label>
          Modelo
          <select value={modeloId} onChange={(e)=> setModeloId(e.target.value)}>
            {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </label>
        <label>
          Formato
          <select value={formato} onChange={(e)=> setFormato(e.target.value)}>
            <option value="square">Cuadrado 1080×1080</option>
            <option value="portrait">Vertical 1080×1350</option>
            <option value="landscape">Horizontal 1920×1080</option>
          </select>
        </label>
      </div>

      <label>
        URLs de fotos (una por línea)
        <textarea
          rows={4}
          value={urls}
          onChange={(e)=> setUrls(e.target.value)}
          placeholder="https://.../foto1.jpg
https://.../foto2.jpg" />
      </label>

      <label>
        Índice de foto principal (0 = primera)
        <input
          type="number"
          min={0}
          max={Math.max(0, fotosArray.length - 1)}
          value={principalIndex}
          onChange={(e)=> setPrincipalIndex(parseInt(e.target.value || '0', 10))}
        />
      </label>

      <button className="btn" type="button" onClick={onGenerar} disabled={generando || !modeloId}>
        {generando ? 'Generando...' : 'Generar arte con IA (OCR)'}
      </button>
      {error && <div className="alert error">⚠️ {error}</div>}

      {resultadoUrl && (
        <div style={{ marginTop: 12 }}>
          <div className="muted" style={{ marginBottom: 6 }}>Resultado</div>
          <div style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow:'hidden' }}>
            <img src={resultadoUrl} alt="resultado" style={{ width:'100%', height:'auto', display:'block' }} />
          </div>
          <div style={{ marginTop: 8, display:'flex', gap:8 }}>
            <a className="btn" href={resultadoUrl} download>Descargar PNG</a>
            <button className="btn" type="button" onClick={() => navigator.clipboard.writeText(window.location.origin + resultadoUrl)}>
              Copiar enlace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
