import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import AssistantFab from '../shared/AssistantFab.jsx'

export default function AppLayout() {
  const { role } = useAuth();

  return (
    <div className="app-shell" style={{ display:'grid', gridTemplateColumns:'260px 1fr', minHeight:'calc(100vh - 0px)' }}>
      <aside className="card" style={{ borderRadius:0 }}>
        <div style={{ padding:16, display:'grid', gap:8 }}>
          <div style={{ fontWeight:800, letterSpacing:.4 }}>INMOVIA</div>
          <div className="muted" style={{ fontSize:12 }}>Rol: <b>{role}</b></div>
          <nav style={{ display:'grid', gap:6, marginTop:12 }}>
            <NavItem to="/app">Dashboard</NavItem>
            <div className="muted" style={{ fontSize:12, marginTop:8 }}>Operación</div>
            <NavItem to="/app/agents">Chat de agentes</NavItem>
            <NavItem to="/app/portadas/preview">Portadas (preview)</NavItem>
            <NavItem to="/app/portadas/generar">Portadas (IA)</NavItem>
            {role === 'owner' && (
              <>
                <div className="muted" style={{ fontSize:12, marginTop:8 }}>Owner</div>
                <NavItem to="/app/portadas/modelos">Modelos de portada</NavItem>
              </>
            )}
            <div className="muted" style={{ fontSize:12, marginTop:8 }}>Sistema</div>
            <NavItem to="/app/settings">Settings</NavItem>
          </nav>
        </div>
      </aside>

      <section>
        <header className="hero" style={{ paddingTop:24 }}>
          <h1>Panel Inmovia</h1>
          <p className="subtitle">Vista general y herramientas de trabajo diario.</p>
        </header>
        <main className="container" style={{ paddingTop:0 }}>
          <Outlet />
        </main>
        <AssistantFab />
      </section>
    </div>
  )
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => isActive ? 'btn' : 'navlink'}
      style={{ textDecoration:'none', padding:'10px 12px', borderRadius:10 }}
    >
      {children}
    </NavLink>
  )
}
