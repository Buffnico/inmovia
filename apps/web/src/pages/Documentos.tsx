import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ScannerModal from "../scanner/components/ScannerModal";

export default function Documentos() {
  // Estado del escáner
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);

  // File input para “Cargar documento”
  const fileRef = useRef<HTMLInputElement | null>(null);

  function openScanEmpty() {
    setInitialFiles([]);
    setIsScanOpen(true);
  }

  function onPickFiles() {
    fileRef.current?.click();
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = e.target.files;
    if (!fs || fs.length === 0) return;
    setInitialFiles(Array.from(fs));
    setIsScanOpen(true);
    e.currentTarget.value = "";
  }

  return (
    <div className="app-main">
      <div className="glass-panel">
        {/* === Marca fija arriba-izquierda: vuelve al Dashboard === */}
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
          <h1 className="brand-title">Documentos</h1>
          <p className="brand-sub">Cargá, escaneá y organizá tus documentos.</p>
        </div>

        {/* Acciones principales */}
        <div className="cards-row" style={{ marginBottom: 16 }}>
          {/* Crear documento (placeholder) */}
          <div className="stat-card">
            <div className="stat-head">Nuevo</div>
            <div className="stat-value" style={{ fontSize: 24 }}>Crear documento</div>
            <p className="muted" style={{ marginTop: 6 }}>
              Usá plantillas de la oficina (próximamente).
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary" onClick={() => alert("Próximamente: generador con plantillas")}>
                Crear
              </button>
            </div>
          </div>

          {/* Cargar documento: abre file picker y manda al escáner */}
          <div className="stat-card">
            <div className="stat-head">Importar</div>
            <div className="stat-value" style={{ fontSize: 24 }}>Cargar documento</div>
            <p className="muted" style={{ marginTop: 6 }}>
              Sube imágenes (JPG/PNG) y optimizalas con el escáner.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn" onClick={onPickFiles}>Elegir imágenes</button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFilesChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Escanear: abre modal vacío */}
          <div className="stat-card">
            <div className="stat-head">Escáner</div>
            <div className="stat-value" style={{ fontSize: 24 }}>Escanear</div>
            <p className="muted" style={{ marginTop: 6 }}>
              Abre el escáner en una ventana flotante.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary" onClick={openScanEmpty}>Abrir escáner</button>
              <Link className="btn" to="/documentos/escaner">Ir a /documentos/escaner</Link>
            </div>
          </div>
        </div>

        {/* Listado de recientes (placeholder estético) */}
        <div className="panel">
          <strong>Recientes</strong>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
              marginTop: 12,
            }}
          >
            {[1,2,3].map((i) => (
              <div key={i} className="card">
                <div style={{ fontWeight: 700 }}>Documento {i}</div>
                <div className="muted">A4 · 2 páginas · Hoy 11:2{i}</div>
                <div className="mini-bars"><span></span><span></span><span></span><span></span></div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn">Abrir</button>
                  <button className="btn">Compartir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-muted" style={{ marginTop: 12 }}>
          Próximamente: OCR, plantillas automáticas y firma digital.
        </div>
      </div>

      {/* ===== Modal del Escáner ===== */}
      <ScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        initialFiles={initialFiles}
      />
    </div>
  );
}
