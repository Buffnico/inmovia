import { useEffect, useState } from 'react'
import { ping, getModelos } from '../lib/api'

export default function Dashboard() {
  const [status, setStatus] = useState(null)
  const [modelos, setModelos] = useState([])

  useEffect(() => {
    ping().then(setStatus).catch(()=> setStatus(null))
    getModelos().then(d => setModelos(d.modelos || [])).catch(()=> setModelos([]))
  }, [])

  return (
    <div className="grid">
      <section className="card">
        <h2>Estado del sistema</h2>
        <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(status, null, 2)}</pre>
      </section>
      <section className="card">
        <h2>Modelos recientes</h2>
        {!modelos.length && <p className="muted">Aún no hay modelos.</p>}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
          {modelos.map(m => (
            <div key={m.id} className="card">
              <div style={{ aspectRatio:'1.6/1', overflow:'hidden', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)' }}>
                <img src={m.url} alt={m.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ marginTop:8 }}>
                <div style={{ fontWeight:700 }}>{m.nombre}</div>
                <div className="muted" style={{ fontSize:13 }}>{m.descripcion || m.id}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
