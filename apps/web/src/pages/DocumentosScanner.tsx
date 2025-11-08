import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScannerModal from "../scanner/components/ScannerModal";

export default function DocumentosScanner() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div className="app-main">
      <div className="glass-panel">
        {/* Marca arriba-izquierda para volver al Dashboard */}
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

        <div className="dash-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="brand-title">Escáner</h1>
            <p className="brand-sub">Ventana flotante sobre Documentos.</p>
          </div>
          <Link className="btn" to="/documentos">Volver a Documentos</Link>
        </div>

        <div className="panel">
          <p className="muted">El escáner se abre en modo ventana. Si lo cerrás, permanecés en esta página.</p>
        </div>
      </div>

      <ScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialFiles={[]}
      />
    </div>
  );
}
