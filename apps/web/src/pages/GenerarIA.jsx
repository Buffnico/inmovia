import { useEffect, useMemo, useState } from 'react'
import { getModelos, instanciarPortada } from '../lib/api'

export default function GenerarIA() {
  const [modelos, setModelos] = useState([])
  const [modeloId, setModeloId] = useState('')
  const [formato, setFormato] = useState('square')
  const [direccion, setDireccion] = useState('Av. Alsina 770, Banfield')
  const [precio, setPrecio] = useState('USD 120.000')
  const [ambientes, setAmbientes] = useState('3')
  const [superficie, setSuperficie] = useState('85')
  const [urls, setUrls] = useState('')
  const fotosArray = useMemo(() => urls.split('\n').map(s=>s.trim()).filter(Boolean), [urls])
  const [principalIndex, setPrincipalIndex] = useState(0)
  const [generando, setGenerando] = useState(false)
  const [resultadoUrl, setResultadoUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getModelos().then(d => {
      const list = d.modelos || []
      setModelos(list)
      if (list.length && !modeloId) setModeloId(list[0].id)
    }).catch(()=> setModelos([]))
  }, [])

  useEffect(() => { if (principalIndex >= fotosArray.length) setPrincipalIndex(0) }, [fotosArray, principalIndex])

  const onGenerar = async () => {
    setError(''); setResultadoUrl(''); setGenerando(true)
    try {
      const payload = { modeloId, formato, direccion, precio, ambientes, superficie, fotos: fotosArray, principalIndex }
      const data = await instanciarPortada(payload)
      setResultadoUrl(data.url || '')
    } catch (err) { setError(err.message || 'Error al generar') }
    finally { setGenerando(false) }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Datos + Fotos</h2>
        <div className="form">
          <label>Modelo
            <select value={modeloId} onChange={(e)=> setModeloId(e.target.value)}>
              {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </label>
          <label>Formato
            <select value={formato} onChange={(e)=> setFormato(e.target.value)}>
              <option value="square">Cuadrado 1080×1080</option>
              <option value="portrait">Vertical 1080×1350</option>
              <option value="landscape">Horizontal 1920×1080</option>
            </select>
          </label>
          <label>Dirección*<input value={direccion} onChange={(e)=> setDireccion(e.target.value)} required /></label>
          <label>Precio*<input value={precio} onChange={(e)=> setPrecio(e.target.value)} required /></label>
          <label>Ambientes<input value={ambientes} onChange={(e)=> setAmbientes(e.target.value)} /></label>
          <label>Superficie (m²)<input value={superficie} onChange={(e)=> setSuperficie(e.target.value)} /></label>
          <label>URLs de fotos (una por línea)
            <textarea rows={4} value={urls} onChange={(e)=> setUrls(e.target.value)} placeholder="https://.../foto1.jpg
https://.../foto2.jpg" />
          </label>
          <label>Índice de foto principal (0 = primera)
            <input type="number" min={0} max={Math.max(0, fotosArray.length-1)} value={principalIndex} onChange={(e)=> setPrincipalIndex(parseInt(e.target.value || '0', 10))} />
          </label>
          <button className="btn" type="button" onClick={onGenerar} disabled={generando || !modeloId}>
            {generando ? 'Generando...' : 'Generar arte con IA (OCR)'}
          </button>
          {error && <div className="alert error">⚠️ {error}</div>}
        </div>
      </section>

      <section className="card">
        <h2>Resultado</h2>
        {!resultadoUrl && !generando && !error && <p className="muted">Completá los datos y generá la pieza.</p>}
        {resultadoUrl && (
          <>
            <div style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow:'hidden' }}>
              <img src={resultadoUrl} alt="resultado" style={{ width:'100%', height:'auto', display:'block' }} />
            </div>
            <div style={{ marginTop: 8, display:'flex', gap:8 }}>
              <a className="btn" href={resultadoUrl} download>Descargar PNG</a>
              <button className="btn" type="button" onClick={() => navigator.clipboard.writeText(window.location.origin + resultadoUrl)}>
                Copiar enlace
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
