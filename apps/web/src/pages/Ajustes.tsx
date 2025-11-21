import React from "react";

const Ajustes: React.FC = () => {
  return (
    <div className="page">
      <div className="glass-panel">
        <header className="page-header">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">
            Ajustes de la cuenta, oficina y módulos de Inmovia Office.
          </p>
        </header>

        <div className="cards">
          <section className="card">
            <h2 className="card-title">Perfil del Owner / Admin</h2>
            <p className="card-text">
              Acá vas a poder configurar tus datos, idioma, zona horaria
              y preferencias generales.
            </p>
          </section>

          <section className="card">
            <h2 className="card-title">Módulos habilitados</h2>
            <p className="card-text">
              En esta sección el Owner va a poder activar o desactivar
              herramientas como Ivo-t, WhatsApp, Scanner, Documentos, etc.
            </p>
          </section>

          <section className="card">
            <h2 className="card-title">Integraciones</h2>
            <p className="card-text">
              Más adelante desde acá se van a conectar Google Calendar,
              portales inmobiliarios y otras integraciones externas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;
