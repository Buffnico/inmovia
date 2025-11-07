import React, { useState } from "react";
import ScannerModal from "../scanner/components/ScannerModal"; // 👈 IMPORT CORRECTO

const ScannerModalTyped = ScannerModal as unknown as React.ComponentType<{
  isOpen: boolean;
  onClose: () => void;
  initialFiles: File[];
}>;

export default function DocumentosScanner() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handlePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length) {
      setFiles(list);
      setOpen(true);
    }
  };

  return (
    <div className="container scanner-page" style={{ padding: "24px 0" }}>
      <div className="glass-panel">
        <h1 style={{ marginTop: 0 }}>Escáner</h1>
        <p className="muted" style={{ margin: "6px 0 14px" }}>
          Procesamiento local. Tus archivos no se suben hasta confirmar.
        </p>

        {/* 🔽🔽🔽 Dejá aquí TODO tu UI existente del escáner tal cual lo tenías 🔽🔽🔽 */}
        {/* Ejemplo: */}
        {/* {tuBloqueDeControles} */}
        {/* {tuCanvasStageConOverlay} */}
        {/* {tusBotones: Vista previa / Confirmar / Exportar PDF/JPG} */}
        {/* 🔼🔼🔼 ----------------------------------------------------------- 🔼🔼🔼 */}

      </div>
    </div>
  );
}
