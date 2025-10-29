import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { setRole } = useAuth();
  const nav = useNavigate();

  const loginAs = (r) => {
    setRole(r);
    nav('/app', { replace:true });
  }

  return (
    <section className="card" style={{ maxWidth: 520, margin:'24px auto' }}>
      <h2>Iniciar sesión</h2>
      <p className="muted">Seleccioná un rol para visualizar el panel. (Simulación)</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <button className="btn" onClick={()=> loginAs('owner')}>Entrar como Owner</button>
        <button className="btn" onClick={()=> loginAs('agent')}>Entrar como Agente</button>
        <button className="btn" onClick={()=> loginAs('admin')}>Entrar como Admin</button>
        <button className="btn" onClick={()=> loginAs('guest')}>Continuar como invitado</button>
      </div>
    </section>
  )
}
