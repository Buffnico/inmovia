import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <header className="landing-hero-section">

        {/* Card Flotante Principal */}
        <div className="landing-card">

          {/* Header Top: Logo + Acciones */}
          <div className="landing-header-top">
            <div className="brand-area">
              <div className="brand-logo-mark">IO</div>
              <div className="brand-text">
                <span className="brand-title">Inmovia Office</span>
                <span className="brand-subtitle">Plataforma Integral</span>
              </div>
            </div>
            <div className="header-actions">
              <Link to="/login" className="btn btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/dashboard" className="btn btn-primary">
                Registrarse
              </Link>
            </div>
          </div>

          {/* Contenido del Hero */}
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Tu oficina inmobiliaria, <span className="highlight-text">potenciada.</span>
              </h1>
              <p className="hero-subtitle">
                CRM, Agenda inteligente, Documentos automatizados y Asistente IA en una sola plataforma.
                Diseñado para dueños, brokers y agentes que quieren escalar.
              </p>
              <div className="hero-cta-group">
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Comenzar ahora
                </Link>
                <a href="#features" className="btn btn-ghost btn-lg">
                  Ver funcionalidades
                </a>
              </div>
            </div>

            {/* Visual Flotante */}
            <div className="hero-visual">
              <div className="glass-card-float card-1">
                <div className="float-icon">📅</div>
                <div className="float-text">
                  <strong>Agenda</strong>
                  <span>Sincronizada</span>
                </div>
              </div>
              <div className="glass-card-float card-2">
                <div className="float-icon">🤖</div>
                <div className="float-text">
                  <strong>Ivo-t</strong>
                  <span>Asistente IA</span>
                </div>
              </div>
              <div className="glass-card-float card-3">
                <div className="float-icon">📄</div>
                <div className="float-text">
                  <strong>Docs</strong>
                  <span>Auto-generados</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <h2 className="section-title">Todo lo que necesitás hoy</h2>
          <p className="section-subtitle">
            Módulos operativos listos para el día a día de tu inmobiliaria.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Agenda & Calendar</h3>
            <p>
              Sincronización total con Google Calendar. Recordatorios automáticos de cumpleaños,
              aniversarios de mudanza y seguimientos.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Ivo-t IA</h3>
            <p>
              Tu asistente virtual 24/7. Redacta descripciones, responde consultas y te ayuda
              a gestionar la operativa diaria.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Documentos</h3>
            <p>
              Generación automática de reservas y contratos. Plantillas personalizables
              y gestión centralizada de archivos.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Escáner Integrado</h3>
            <p>
              Escanea DNI y documentos directamente desde el móvil. Recorte inteligente
              y filtros profesionales.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Contactos</h3>
            <p>
              Base de datos unificada de clientes. Historial de interacciones y
              perfilado completo.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Propiedades</h3>
            <p>
              Gestión de inventario, estado de carteles y fichas completas de cada
              propiedad en cartera.
            </p>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section className="landing-section showcase-section">
        <div className="section-header">
          <h2 className="section-title">La plataforma en acción</h2>
          <p className="section-subtitle">
            Interfaz limpia, moderna y pensada para la velocidad.
          </p>
        </div>

        <div className="showcase-grid">
          <div className="showcase-item">
            <div className="showcase-header">
              <span className="badge">Scanner</span>
              <h4>Digitalización rápida</h4>
            </div>
            <div className="showcase-placeholder">
              <div className="placeholder-content">
                <span>📸 Captura de Scanner</span>
              </div>
            </div>
          </div>

          <div className="showcase-item">
            <div className="showcase-header">
              <span className="badge">Ivo-t</span>
              <h4>Inteligencia Artificial</h4>
            </div>
            <div className="showcase-placeholder">
              <div className="placeholder-content">
                <span>💬 Captura de Ivo-t</span>
              </div>
            </div>
          </div>

          <div className="showcase-item">
            <div className="showcase-header">
              <span className="badge">Agenda</span>
              <h4>Organización total</h4>
            </div>
            <div className="showcase-placeholder">
              <div className="placeholder-content">
                <span>📅 Captura de Agenda</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section className="landing-section roadmap-section">
        <div className="section-header">
          <h2 className="section-title">El futuro de Inmovia</h2>
          <p className="section-subtitle">
            Estamos construyendo las herramientas de mañana.
          </p>
        </div>

        <div className="roadmap-grid">
          <div className="roadmap-card">
            <div className="roadmap-tag">Próximamente</div>
            <h3>WhatsApp + IA</h3>
            <p>
              Respuestas sugeridas por IA, automatización híbrida y gestión de conversaciones
              directamente desde el CRM.
            </p>
          </div>

          <div className="roadmap-card">
            <div className="roadmap-tag">En desarrollo</div>
            <h3>Redes Sociales</h3>
            <p>
              Generación automática de posts y stories para Instagram/Facebook basados en
              tus propiedades.
            </p>
          </div>

          <div className="roadmap-card">
            <div className="roadmap-tag">Planeado</div>
            <h3>Inmovia Edu</h3>
            <p>
              Plataforma de capacitación integrada para onboarding de nuevos agentes y
              formación continua.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>Inmovia Office</strong>
            <span className="version">Beta v0.9</span>
          </div>
          <div className="footer-links">
            <span>© 2025 Inmovia Office</span>
            <span>Hecho con ❤️ para inmobiliarias</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
