// apps/web/src/pages/Documentos.tsx
import React from "react";

export default function Documentos() {
  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <div className="glass-panel" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Documentos</h1>
        <p className="muted" style={{ margin: "6px 0 0" }}>
          Gestioná y generá documentos de tu oficina.
        </p>
      </div>

      <section
        className="cards"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
      >
        {/* Crear nuevo documento */}
        <a
          href="#/documentos/nuevo"
          className="card"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(180deg, rgba(31,140,255,.25), rgba(31,140,255,.10))",
                border: "1px solid rgba(55,168,255,.28)",
                boxShadow: "0 6px 18px rgba(31,140,255,.18)",
              }}
            >
              📄
            </span>
            <div>
              <div style={{ fontWeight: 700 }}>Crear nuevo documento</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Reservas, refuerzos, recibos, portadas, contratos…
              </div>
            </div>
          </div>
        </a>

        {/* Cargar documento */}
        <a
          href="#/documentos/cargar"
          className="card"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(180deg, rgba(31,140,255,.25), rgba(31,140,255,.10))",
                border: "1px solid rgba(55,168,255,.28)",
                boxShadow: "0 6px 18px rgba(31,140,255,.18)",
              }}
            >
              ⬆️
            </span>
            <div>
              <div style={{ fontWeight: 700 }}>Cargar documento</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Subí PDF/JPG/PNG desde tu PC.
              </div>
            </div>
          </div>
        </a>

        {/* Escanear con cámara */}
        <a
          href="#/documentos/escaner"
          className="card"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(180deg, rgba(31,140,255,.25), rgba(31,140,255,.10))",
                border: "1px solid rgba(55,168,255,.28)",
                boxShadow: "0 6px 18px rgba(31,140,255,.18)",
              }}
            >
              📷
            </span>
            <div>
              <div style={{ fontWeight: 700, color: "#8ec5ff" }}>Escanear</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Recorte, mejoras, multipágina y PDF/JPG.
              </div>
            </div>
          </div>
        </a>

        {/* Crear imagen para redes */}
        <a
          href="#/documentos/portadas"
          className="card"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(180deg, rgba(31,140,255,.25), rgba(31,140,255,.10))",
                border: "1px solid rgba(55,168,255,.28)",
                boxShadow: "0 6px 18px rgba(31,140,255,.18)",
              }}
            >
              🖼️
            </span>
            <div>
              <div style={{ fontWeight: 700 }}>Crear imagen para redes</div>
              <div className="muted" style={{ marginTop: 4 }}>
                Plantillas con datos + fotos.
              </div>
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}
