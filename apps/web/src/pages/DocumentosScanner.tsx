import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScannerModal from "../scanner/components/ScannerModal";

export default function DocumentosScanner() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div className="app-main">
      <div className="glass-panel">
        <div className="dash-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="brand-title">Escáner</h1>
            <p className="brand-sub">Ventana flotante sobre Documentos.</p>
          </div>
          <button className="btn" onClick={() => navigate("/documentos")}>Volver a Documentos</button>
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
