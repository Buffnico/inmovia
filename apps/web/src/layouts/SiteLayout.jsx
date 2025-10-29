import { Outlet, Link, useNavigate } from 'react-router-dom'
import Topbar from '../shared/Topbar.jsx'
import AssistantFab from '../shared/AssistantFab.jsx'

export default function SiteLayout() {
  return (
    <>
      <Topbar />
      <main className="container" style={{ paddingTop: 24 }}>
        <Outlet />
      </main>
      <AssistantFab />
      <footer className="footer" style={{ marginTop: 24 }}>
        <span>© {new Date().getFullYear()} Inmovia</span>
      </footer>
    </>
  )
}
