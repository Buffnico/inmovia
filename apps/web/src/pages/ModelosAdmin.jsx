import { useEffect, useState } from 'react'
import { getModelos, uploadModelo, deleteModelo } from '../lib/api'
import { useAuth } from '../auth.jsx'

export default function ModelosAdmin() {
  const { role } = useAuth();
  const [modelos, setModelos] = useState([])
  const [file, setFile] = useState(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const cargar = async () => {
    try { const d = await getModelos(); setModelos(d.modelos || []) }
    catch { setModelos([]) }
  }
  useEffect(()=> { cargar() }, [])

  if (role !== 'owner') {
    return <section className="card"><h2>Acceso restringido</h2><p className="muted">Solo Owner puede gestionar modelos.</p></section>
  }

  const onUpload = async (e) => {
    e.preventDefault()
    setError('')
    if (!file || !nombre.trim()) { setError('Faltan archivo y/o nombre'); return }
    setSubiendo(true)
    try {
      await uploadModelo({ file, nombre: nombre.trim(), descripcion: descripcion.trim() })
      setFile(null); setNombre(''); setDescripcion('')
      await cargar()
    } catch (err) { setError(err.message || 'Error al subir') }
    finally { setSubiendo(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este modelo?')) return
    try { await deleteModelo(id); await cargar() }
    catch (err) { alert(err.message || 'No se pudo eliminar') }
  }

  return (
    <div className="form">
      <form onSubmit={onUpload} className="form" style={{ maxWidth: 520 }}>
        <label>Archivo de ejemplo (imagen)
          <input type="file" accept="image/*" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
        </label>
        <label>Nombre del modelo*
          <input value={nombre} onChange={(e)=> setNombre(e.target.value)} placeholder="Ej: Moderno Azul" required />
        </label>
        <label>Descripción (opcional)
          <input value={descripcion} onChange={(e)=> setDescripcion(e.target.value)} placeholder="Ej: franja superior azul" />
        </label>
        <button className="btn" type="submit" disabled={subiendo}>{subiendo ? 'Subiendo...' : 'Subir modelo'}</button>
        {error && <div className="alert error">⚠️ {error}</div>}
      </form>

      <div style={{ marginTop: 12 }}>
        <h3>Modelos actuales</h3>
        {!modelos.length && <p className="muted">No hay modelos aún.</p>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
          {modelos.map(m => (
            <div key={m.id} className="card">
              <div style={{ aspectRatio:'1.6/1', overflow:'hidden', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)' }}>
                <img src={m.url} alt={m.nombre} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight:700 }}>{m.nombre}</div>
                <div className="muted" style={{ fontSize:13 }}>{m.descripcion || m.id}</div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop: 8 }}>
                <button className="btn" type="button" onClick={()=> navigator.clipboard.writeText(m.id)}>Copiar ID</button>
                <button className="btn" type="button" onClick={()=> onDelete(m.id)} style={{ background:'linear-gradient(90deg,#f87171,#fb7185)' }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
