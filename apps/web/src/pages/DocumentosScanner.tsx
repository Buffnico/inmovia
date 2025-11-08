// apps/web/src/pages/DocumentosScanner.tsx
import React, { useEffect, useState } from "react";
import ScannerModal from "../scanner/components/ScannerModal";

export default function DocumentosScanner() {
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => setIsOpen(true), []);

  return (
    <div className="container app-main">
      <div className="glass-panel">
        <div className="dash-header" style={{ alignItems: "center" }}>
          <h1 className="brand-title" style={{ marginBottom: 0 }}>Escáner</h1>
          <p className="brand-sub">Procesamiento local. Tus archivos no se suben hasta confirmar.</p>
        </div>

        {!isOpen && (
          <button className="btn btn-primary" onClick={() => setIsOpen(true)} style={{ marginBottom: 16 }}>
            Abrir escáner
          </button>
        )}

        {/* Usa la clase que ya tenés en tu CSS */}
        <div className="scanner-page">
          <div className="scanner-stage">
            <ScannerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
