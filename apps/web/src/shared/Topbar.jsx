import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { ping } from '../lib/api'
import { useEffect, useState } from 'react'

export default function Topbar() {
  const { role, isLogged, setRole } = useAuth();
  const [apiOk, setApiOk] = useState(false)
  const nav = useNavigate()

  useEffect(()=>{ ping().then(()=>setApiOk(true)).catch(()=>setApiOk(false)) },[])

  return (
    <header style={{ position:'sticky', top:0, zIndex:10, backdropFilter:'blur(6px)' }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
        <Link to="/" style={{ textDecoration:'none', fontWeight:900, letterSpacing:.6 }}>
          <span style={{ padding:'6px 10px', borderRadius:10, background:'linear-gradient(90deg, var(--brand), var(--brand-2))', color:'#0a0a0a' }}>
            INMOVIA
          </span>
        </Link>

        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <span className="muted" style={{ fontSize:12 }}>{apiOk ? 'API ✅' : 'API ❌'}</span>
          {!isLogged ? (
            <button className="btn" onClick={()=> nav('/login')}>Iniciar sesión</button>
          ) : (
            <>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="owner">Owner</option>
                <option value="agent">Agente</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn" onClick={()=> { setRole('guest'); nav('/') }}>Salir</button>
              <button className="btn" onClick={()=> nav('/app')}>Entrar al panel</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
