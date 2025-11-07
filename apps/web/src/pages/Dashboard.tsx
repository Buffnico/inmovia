// apps/web/src/pages/Dashboard.tsx
import React from "react";
import Sidebar from "../components/Sidebar"; // 👈 sin extensión

type StatCardProps = {
  title: string;
  value?: number | string;
  children?: React.ReactNode;
};

function StatCard({ title, value, children }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-head">{title}</div>
      {value !== undefined && <div className="stat-value">{value}</div>}
      {children}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="app-shell">
      {/* ✅ Sidebar original */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="app-main">
        <section className="glass-panel">
          <div className="dash-header">
            <h1 className="brand-title">Dashboard</h1>
            <p className="brand-sub">Resumen de la oficina y accesos rápidos</p>
          </div>

          {/* KPIs */}
          <div className="cards-row" style={{ marginBottom: 18 }}>
            <StatCard title="Documentos generados" value={132}>
              <div className="donut">
                <svg viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="gradBlue" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#58b0ff" />
                      <stop offset="100%" stopColor="#2166ff" />
                    </linearGradient>
                  </defs>
                  <circle className="bg" cx="18" cy="18" r="15.915" />
                  <circle className="fg" cx="18" cy="18" r="15.915" strokeDasharray="72, 100" />
                  <text x="18" y="21" textAnchor="middle">72%</text>
                </svg>
              </div>
            </StatCard>

            <StatCard title="Escaneos IA realizados" value={58}>
              <div className="mini-bars">
                <span></span><span></span><span></span><span></span>
              </div>
            </StatCard>

            <StatCard title="Módulos Edu activos" value={2}>
              <div className="mini-bars">
                <span style={{ height: 18 }}></span>
                <span style={{ height: 26 }}></span>
                <span style={{ height: 34 }}></span>
                <span style={{ height: 30 }}></span>
              </div>
            </StatCard>
          </div>

          {/* Accesos rápidos / módulos */}
          <section className="cards">
            <a href="#/documentos" className="card" style={{ textDecoration: "none", display: "block" }}>
              <h3 style={{ margin: 0 }}>Documentos</h3>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                Genera, carga y gestiona documentos (reservas, refuerzos, etc.).
              </p>
            </a>

            <a href="#/documentos/escaner" className="card" style={{ textDecoration: "none", display: "block" }}>
              <h3 style={{ margin: 0 }}>Escáner</h3>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                Escaneo multipágina con mejoras y exportación a PDF/JPG.
              </p>
            </a>

            <a href="#/propiedades" className="card" style={{ textDecoration: "none", display: "block" }}>
              <h3 style={{ margin: 0 }}>Propiedades</h3>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                Gestión de propiedades, cartel colocado y seguimiento.
              </p>
            </a>

            {/* 👉 Tarjeta de Inmovia Edu */}
            <a href="#/edu" className="card" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h3 style={{ margin: 0 }}>Inmovia Edu</h3>
                <span style={{
                  fontSize: "12px", padding: "4px 8px", borderRadius: "999px",
                  border: "1px solid rgba(55,168,255,.22)", background: "rgba(55,168,255,.10)"
                }}>
                  Sección paga
                </span>
              </div>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                Capacitación para agentes con módulos creados por tu oficina + IA para estudiar.
              </p>
            </a>
          </section>
        </section>
      </main>
    </div>
  );
}
