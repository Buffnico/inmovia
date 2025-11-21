import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="page">
      <div className="glass-panel">
        <header className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Resumen de la oficina y accesos rápidos.
          </p>
        </header>

        <div className="cards dashboard-grid">
          <section className="card">
            <h2 className="card-title">Documentos generados</h2>
            <p className="kpi-number">132</p>
            <p className="card-text">En los últimos 30 días</p>
          </section>

          <section className="card">
            <h2 className="card-title">Propiedades activas</h2>
            <p className="kpi-number">24</p>
            <p className="card-text">En publicación en portales</p>
          </section>

          <section className="card">
            <h2 className="card-title">Próximas visitas</h2>
            <p className="kpi-number">5</p>
            <p className="card-text">
              Sincronizadas con Agenda &amp; recordatorios.
            </p>
          </section>

          <section className="card">
            <h2 className="card-title">Atajos rápidos</h2>
            <ul className="card-list">
              <li>➜ Crear nuevo documento</li>
              <li>➜ Cargar nueva propiedad</li>
              <li>➜ Revisar agenda de hoy</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
