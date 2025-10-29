import { useState } from 'react'

export default function AssistantFab() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from:'ai', text:'Hola 👋 Soy tu asistente Inmovia. ¿Qué necesitas hacer?' },
  ])
  const [input, setInput] = useState('Quiero generar una portada para Instagram')

  const send = () => {
    if (!input.trim()) return
    setMessages(m => [...m, { from:'me', text: input.trim() }, { from:'ai', text:'Entendido. Puedo usar tu modelo y los datos del cliente para generar una imagen lista para redes. ¿Dirección y precio?' }])
    setInput('')
  }

  return (
    <>
      <button
        aria-label="Asistente IA"
        onClick={()=> setOpen(true)}
        style={{
          position:'fixed', right:20, bottom:20, zIndex:50, width:56, height:56, borderRadius:999,
          border:'1px solid rgba(255,255,255,0.1)', background:'linear-gradient(90deg, var(--brand), var(--brand-2))',
          color:'#0a0a0a', fontWeight:800, boxShadow:'0 10px 25px rgba(0,0,0,0.25)'
        }}
      >IA</button>

      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:60 }} onClick={()=> setOpen(false)}>
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              position:'absolute', right:0, top:0, height:'100%', width:380, background:'var(--panel)',
              borderLeft:'1px solid rgba(255,255,255,0.08)', display:'grid', gridTemplateRows:'auto 1fr auto'
            }}
          >
            <div style={{ padding:12, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <strong>Asistente Inmovia</strong>
              <div className="muted" style={{ fontSize:12 }}>Modo rápido • ideas, comandos y accesos</div>
            </div>
            <div style={{ padding:12, overflow:'auto', display:'grid', gap:8 }}>
              {messages.map((m, i)=>(
                <div key={i} style={{
                  justifySelf: m.from==='me'?'end':'start',
                  background: m.from==='me'?'linear-gradient(90deg, var(--brand), var(--brand-2))':'rgba(255,255,255,0.06)',
                  color: m.from==='me'?'#0a0a0a':'var(--text)',
                  padding:'10px 12px', borderRadius:12, maxWidth:'85%'
                }}>{m.text}</div>
              ))}
            </div>
            <div style={{ padding:12, display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe un mensaje..." />
              <button className="btn" onClick={send}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
