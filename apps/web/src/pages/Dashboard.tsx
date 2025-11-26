import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

// --- MOCK DATA ---
const KPI_DATA = [
  { id: 1, label: "Propiedades activas", value: 42, icon: "🏠" },
  { id: 2, label: "Documentos generados", value: 15, icon: "📄" },
  { id: 3, label: "Próximas visitas", value: 8, icon: "📅" },
  { id: 4, label: "Clientes activos", value: 124, icon: "👥" },
];

const AGENDA_DATA = [
  { id: 1, time: "10:00", title: "Visita: Depto 3 amb", subtitle: "con Juan Pérez" },
  { id: 2, time: "14:30", title: "Firma Reserva", subtitle: "Casa en Banfield" },
  { id: 3, time: "16:00", title: "Llamado seguimiento", subtitle: "Cliente nuevo" },
];

const FEATURED_PROPS = [
  {
    id: "p1",
    titulo: "Depto 3 amb premium",
    direccion: "Lomas de Zamora",
    precio: "USD 120.000",
    operacion: "Venta",
    estado: "Disponible",
    img: null, // Placeholder
  },
  {
    id: "p2",
    titulo: "Casa 4 amb con jardín",
    direccion: "Banfield",
    precio: "USD 240.000",
    operacion: "Venta",
    estado: "Reservada",
    img: null,
  },
  {
    id: "p3",
    titulo: "Local comercial céntrico",
    direccion: "Lanús Oeste",
    precio: "$ 350.000",
    operacion: "Alquiler",
    estado: "Disponible",
    img: null,
  },
];

const TOOLS = [
  { to: "/propiedades", icon: "🏠", label: "Propiedades", desc: "Gestionar inventario" },
  { to: "/clientes", icon: "👥", label: "Contactos", desc: "Base de clientes" },
  { to: "/documentos", icon: "📄", label: "Documentos", desc: "Generar contratos" },
  { to: "/agenda", icon: "📅", label: "Agenda", desc: "Citas y eventos" },
  { to: "/scanner", icon: "📱", label: "Scanner", desc: "Digitalizar DNI" }, // Mock route if not exists
  { to: "/redes", icon: "📢", label: "Redes", desc: "Publicaciones" },
  { to: "/ivot", icon: "🤖", label: "Ivo-t", desc: "Asistente IA" },
];

const ROADMAP = [
  { status: "Pronto", text: "Inmovia Edu: Módulos de capacitación" },
  { status: "En Dev", text: "Integración avanzada con Instagram" },
  { status: "Futuro", text: "Estadísticas de rendimiento de agentes" },
];

const Dashboard: React.FC = () => {
  return (
    <div className="page dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Hola, Nicolás 👋</h1>
          <p className="dashboard-subtitle">Aquí tenés el resumen de tu inmobiliaria hoy.</p>
        </header>

        {/* 1. Resumen General (KPIs) */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Resumen General</h2>
          </div>
          <div className="kpi-grid">
            {KPI_DATA.map((kpi) => (
              <div key={kpi.id} className="kpi-card">
                <div>
                  <div className="kpi-icon-wrapper">{kpi.icon}</div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-label">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid: Agenda + Featured */}
        <div className="dashboard-main-grid">

          {/* Left Col: Featured Properties & Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 3. Propiedades Destacadas */}
            <section>
              <div className="section-header">
                <h2 className="section-title">Propiedades Destacadas / Recientes</h2>
                <Link to="/propiedades" className="btn btn-ghost btn-sm">Ver todas →</Link>
              </div>
              <div className="featured-grid">
                {FEATURED_PROPS.map((p) => (
                  <div key={p.id} className="property-card-mini">
                    <div className="prop-img-placeholder">
                      <span className="prop-badge">{p.operacion}</span>
                      📷
                    </div>
                    <div className="prop-info">
                      <div className="prop-price">{p.precio}</div>
                      <div className="prop-address">{p.titulo}</div>
                      <div className="prop-meta">
                        <span>{p.direccion}</span>
                        <span>•</span>
                        <span style={{ color: p.estado === 'Disponible' ? '#16a34a' : '#ca8a04' }}>
                          {p.estado}
                        </span>
                      </div>
                      <Link to={`/propiedades/${p.id}`} className="btn btn-sm btn-outline-primary w-100 mt-2">
                        Ver propiedad
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Accesos Rápidos */}
            <section>
              <div className="section-header">
                <h2 className="section-title">Herramientas Rápidas</h2>
              </div>
              <div className="tools-grid">
                {TOOLS.map((t) => (
                  <Link key={t.label} to={t.to} className="tool-card">
                    <div className="tool-icon">{t.icon}</div>
                    <div className="tool-name">{t.label}</div>
                    <div className="tool-desc">{t.desc}</div>
                  </Link>
                ))}
              </div>
            </section>

          </div>

          {/* Right Col: Agenda & Roadmap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 2. Hoy en la oficina */}
            <section className="today-panel">
              <div className="section-header">
                <h2 className="section-title">Hoy en la oficina</h2>
                <Link to="/agenda" className="btn btn-ghost btn-sm">Agenda →</Link>
              </div>

              <div className="agenda-list">
                {AGENDA_DATA.map((item) => (
                  <div key={item.id} className="agenda-item">
                    <div className="agenda-time">{item.time}</div>
                    <div className="agenda-details">
                      <h4>{item.title}</h4>
                      <p>{item.subtitle}</p>
                    </div>
                  </div>
                ))}

                {/* Placeholder for reminders */}
                <div className="alert alert-info" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  🎂 <strong>Cumpleaños:</strong> Hoy cumple años María (Cliente).
                </div>
              </div>
            </section>

            {/* 5. Futuro Inmovia */}
            <section className="roadmap-panel">
              <div className="section-header">
                <h2 className="section-title">Futuro Inmovia</h2>
              </div>
              <div className="roadmap-list">
                {ROADMAP.map((r, i) => (
                  <div key={i} className="roadmap-item">
                    <span className="roadmap-status">{r.status}</span>
                    <span className="roadmap-text">{r.text}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
