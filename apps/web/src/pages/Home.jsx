import { Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Home() {
  const { isLogged } = useAuth();
  return (
    <>
      <section className="hero" style={{ marginTop: 24 }}>
        <h1>Automatización inmobiliaria con IA</h1>
        <p className="subtitle">Portadas listas para redes, chat de agentes con IA, documentos DOCX/PDF y control total del Owner.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:12 }}>
          {isLogged
            ? <Link to="/app" className="btn">Entrar al panel</Link>
            : <Link to="/login" className="btn">Iniciar sesión</Link>}
          <a className="btn" href="#features">Ver funciones</a>
        </div>
      </section>

      <section id="features" className="grid">
        <div className="card">
          <h3>Portadas automáticas</h3>
          <p className="muted">Subí un modelo y la IA reemplaza textos y fotos, respetando el estilo. Exportá PNG listo para Instagram.</p>
          <Link className="btn" to="/app/portadas/generar">Probar IA</Link>
        </div>
        <div className="card">
          <h3>Chat de agentes</h3>
          <p className="muted">Modo híbrido: la IA sugiere respuestas y el humano aprueba. Centralizá conversaciones.</p>
          <Link className="btn" to="/app/agents">Abrir chat</Link>
        </div>
        <div className="card">
          <h3>Documentos</h3>
          <p className="muted">Cargá plantillas y generá DOCX/PDF con cláusulas recomendadas. (prototipo)</p>
          <Link className="btn" to="/app/settings">Ver ajustes</Link>
        </div>
        <div className="card">
          <h3>Control del Owner</h3>
          <p className="muted">Gestión de modelos, branding, usuarios y permisos. (visual listo, funciones en progreso)</p>
          <Link className="btn" to="/app/portadas/modelos">Modelos de portada</Link>
        </div>
      </section>
    </>
  )
}
