import { useState } from 'react'

const SAMPLE_THREADS = [
  { id:'t1', title:'Juan Pérez — Consulta alquiler', last:'¿Sigue disponible?', unread:2 },
  { id:'t2', title:'María López — Venta PH', last:'¿Puedo agendar visita?', unread:0 },
  { id:'t3', title:'Carlos — Casa Banfield', last:'Gracias!', unread:0 },
]

const INIT_CHAT = [
  { from:'client', text:'Hola, ¿sigue disponible el depto 3 amb de Banfield?' },
  { from:'agent', text:'¡Hola! Sí, está disponible. ¿Querés coordinar visita?' },
  { from:'client', text:'Podría mañana 18hs.' },
]

export default function AgentsChat() {
  const [threads] = useState(SAMPLE_THREADS)
  const [messages, setMessages] = useState(INIT_CHAT)
  const [input, setInput] = useState('')
  const [hybrid, setHybrid] = useState(true)
  const [suggestion, setSuggestion] = useState('Podemos mañana a las 18 hs. Necesitaría tu DNI y un teléfono de contacto.')

  const send = () => {
    if (!input.trim()) return
    setMessages(m => [...m, { from:'agent', text: input.trim() }])
    setInput('')
  }

  const acceptSuggestion = () => {
    setMessages(m => [...m, { from:'agent', text: suggestion }])
    setSuggestion('')
  }

  return (
    <div className="card" style={{ padding:0 }}>
      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', minHeight:480 }}>
        {/* lista de conversaciones */}
        <aside style={{ borderRight:'1px solid rgba(255,255,255,0.08)', padding:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <strong>Conversaciones</strong>
            <label style={{ fontSize:12 }}><input type="checkbox" checked={hybrid} onChange={e=> setHybrid(e.target.checked)} /> Modo híbrido</label>
          </div>
          <div style={{ marginTop:8, display:'grid', gap:8 }}>
            {threads.map(t => (
              <div key={t.id} className="card" style={{ padding:10 }}>
                <div style={{ fontWeight:700 }}>{t.title}</div>
                <div className="muted" style={{ fontSize:13, display:'flex', justifyContent:'space-between' }}>
                  <span>{t.last}</span>
                  {t.unread ? <span className="badge" style={{ padding:'2px 8px' }}>{t.unread}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* chat */}
        <section style={{ display:'grid', gridTemplateRows:'auto 1fr auto' }}>
          <div style={{ padding:12, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <strong>Juan Pérez</strong>
            <div className="muted" style={{ fontSize:12 }}>Depto 3 amb — Banfield</div>
          </div>

          <div style={{ padding:12, display:'grid', gap:8, overflow:'auto' }}>
            {messages.map((m,i)=>(
              <div key={i} style={{
                justifySelf: m.from==='agent'?'end':'start',
                background: m.from==='agent'?'linear-gradient(90deg, var(--brand), var(--brand-2))':'rgba(255,255,255,0.06)',
                color: m.from==='agent'?'#0a0a0a':'var(--text)',
                padding:'10px 12px', borderRadius:12, maxWidth:'70%'
              }}>{m.text}</div>
            ))}
            {hybrid && suggestion && (
              <div className="card" style={{ padding:10, border:'1px dashed rgba(255,255,255,0.2)' }}>
                <div className="muted" style={{ fontSize:12, marginBottom:6 }}>Sugerencia IA</div>
                <div>{suggestion}</div>
                <div style={{ marginTop:8, display:'flex', gap:8 }}>
                  <button className="btn" onClick={acceptSuggestion}>Usar</button>
                  <button className="btn" onClick={()=> setSuggestion('')}>Descartar</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:12, display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
            <input value={input} onChange={e=> setInput(e.target.value)} placeholder="Escribe tu mensaje..." />
            <button className="btn" onClick={send}>Enviar</button>
          </div>
        </section>
      </div>
    </div>
  )
}
