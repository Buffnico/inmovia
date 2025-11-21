// apps/web/src/pages/Redes.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Redes() {
  return (
    <div className="app-main">
      <div className="glass-panel">
        {/* Marca fija arriba-izquierda: vuelve al Dashboard */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <Link
            to="/dashboard"
            className="brand"
            style={{ textDecoration: "none", color: "inherit" }}
            title="Ir al Dashboard"
          >
            <span className="brand-badge" />
            Inmovia Office
          </Link>
        </div>

        <div className="dash-header">
          <h1 className="brand-title">Redes</h1>
          <p className="brand-sub">
            Gestioná publicaciones en Instagram y portadas para redes con ayuda de Ivo-t.
          </p>
        </div>

        {/* Acciones principales de Redes */}
        <div className="cards-row" style={{ marginBottom: 16 }}>
          {/* 1) Generar publicación en Instagram */}
          <div className="stat-card">
            <div className="stat-head">Instagram</div>
            <div className="stat-value" style={{ fontSize: 24 }}>
              Generar publicación
            </div>
            <p className="muted" style={{ marginTop: 6 }}>
              Elegí una propiedad, generá el texto con Ivo-t y enviá la publicación a Instagram
              (integración con Meta API, próximamente).
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Link className="btn" to="/propiedades">
                Elegir propiedad
              </Link>
              <button
                className="btn btn-primary"
                onClick={() =>
                  alert("Próximamente: flujo completo de publicación en Instagram con Meta API.")
                }
              >
                Generar publicación
              </button>
            </div>
          </div>

          {/* 2) Generar portada con el editor que ya teníamos */}
          <div className="stat-card">
            <div className="stat-head">Portadas</div>
            <div className="stat-value" style={{ fontSize: 24 }}>
              Generar portada para redes
            </div>
            <p className="muted" style={{ marginTop: 6 }}>
              Diseñá una portada 1080×1080 estilo Inmovia para Instagram y otras redes.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Link className="btn btn-primary" to="/redes/portada">
                Abrir editor
              </Link>
            </div>
          </div>
        </div>

        {/* Placeholder de historial / planificación futura */}
        <div className="panel">
          <strong>Historial de publicaciones (próximamente)</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Acá vas a ver las publicaciones recientes enviadas a Instagram y las portadas
            generadas por la oficina.
          </p>
        </div>

        <div className="footer-muted" style={{ marginTop: 12 }}>
          Próximamente: integración con Instagram Graph API y automatización de textos con Ivo-t.
        </div>
      </div>
    </div>
  );
}
