import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <section className="card">
        <h2>404</h2>
        <p className="muted">No encontramos esa página.</p>
        <Link className="btn" to="/">Volver al inicio</Link>
      </section>
    </div>
  )
}
