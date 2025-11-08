// apps/web/src/pages/Documentos.tsx  (REEMPLAZAR COMPLETO)
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ScannerModal from "../scanner/components/ScannerModal";

export default function Documentos() {
  const { pathname } = useLocation(); // con HashRouter será "/documentos" o "/documentos/escaner"
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    // si estamos en /documentos/escaner, abrir modal
    if (pathname.endsWith("/documentos/escaner")) {
      setScanOpen(true);
    }
  }, [pathname]);

  return (
    <div className="container app-main">
      <div className="glass-panel">
        <div className="dash-header">
          <h1 className="brand-title">Documentos</h1>
          <p className="brand-sub">Gestioná y generá documentos de tu oficina.</p>
        </div>

        <section className="cards-row">
          <a className="stat-card" href="#/documentos/nuevo">
            <div className="stat-head">Crear nuevo documento</div>
            <div className="stat-sub">Reservas, refuerzos, recibos, portadas, contratos…</div>
          </a>

          <a className="stat-card" href="#/documentos/cargar">
            <div className="stat-head">Cargar documento</div>
            <div className="stat-sub">Subí PDF/JPG/PNG desde tu PC.</div>
          </a>

          <button
            type="button"
            className="stat-card"
            style={{ textAlign: "left" }}
            onClick={() => setScanOpen(true)}
          >
            <div className="stat-head">Escanear</div>
            <div className="stat-sub">Recorte, mejoras, multipágina y PDF/JPG.</div>
          </button>

          <a className="stat-card" href="#/documentos/portada">
            <div className="stat-head">Crear imagen para redes</div>
            <div className="stat-sub">Plantillas con datos + fotos.</div>
          </a>
        </section>
      </div>

      {/* ===== Modal flotante “vidrioso” sobre Documentos ===== */}
      {scanOpen && (
        <>
          <div className="scanner-overlay" onClick={() => setScanOpen(false)} />
          <div className="scanner-float">
            <div className="scanner-card" onClick={(e) => e.stopPropagation()}>
              {/* tu UI de escáner, envuelta con clases de tema azul */}
              <div className="scanner-page">
                <div className="scanner-stage">
                  <ScannerModal isOpen={true} onClose={() => setScanOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
