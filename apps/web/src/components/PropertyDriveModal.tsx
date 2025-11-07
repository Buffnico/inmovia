// src/scanner/components/ScannerModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** 🔷 Props públicas del modal (lo que usa DocumentosScanner) */
export type ScannerModalProps = {
  /** Control externo de visibilidad (modal flotante) */
  isOpen: boolean;
  /** Cerrar modal (vuelve a /documentos) */
  onClose: () => void;
  /** Archivos iniciales al abrir (si venimos de “Cargar documento”) */
  initialFiles?: File[];
  /** Opcional: clase extra para ajustar layout si hiciera falta */
  className?: string;
};

/** 🔷 Tipos internos mínimos para páginas del escáner */
type ScanPage = {
  id: string;
  /** imagen “original” fuente (Blob) */
  src: Blob;
  /** preview actual (Blob) después de filtros; si no hay, se usa src */
  preview?: Blob;
  /** otros metadatos que ya uses… */
};

function blobFromFile(f: File): Blob {
  // Simplemente devolvemos el File (es un Blob válido)
  return f;
}

/** Util: convierte Blob a URL segura y la libera al desmontar */
function useObjectUrl(blob?: Blob) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : ""), [blob]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

/** 📌 Reemplazá TODO el contenido antiguo del componente por esta firma.
 *  Mantené tu UI, overlay, sliders, exportaciones, etc., ADENTRO.
 */
const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  initialFiles,
  className,
}) => {
  // ⬇️ Estado base (sustituí por tu store/Zustand si ya lo tenías)
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [current, setCurrent] = useState(0);

  // ⬇️ Al abrir con archivos, los cargamos UNA sola vez.
  useEffect(() => {
    if (!isOpen) return;
    if (!initialFiles || !initialFiles.length) return;
    // Evitar recargas múltiples: si ya hay páginas no hacemos nada.
    if (pages.length > 0) return;

    const loaded: ScanPage[] = initialFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      src: blobFromFile(f),
    }));
    setPages(loaded);
    setCurrent(0);
  }, [isOpen, initialFiles, pages.length]);

  // ⬇️ URLs para pintar canvas/img (usa tu canvas + overlay)
  const currentBlob = pages[current]?.preview || pages[current]?.src;
  const currentUrl = useObjectUrl(currentBlob);

  // ⬇️ Cerrar si no está abierto
  if (!isOpen) return null;

  return (
    <div className={`modal-root ${className ?? ""}`}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content glass">
        <div className="modal-header">
          <h2>Escáner</h2>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>

        <div className="modal-body scanner-grid">
          {/* 🔻 Panel izquierdo: controles (poné tus sliders / botones) */}
          <aside className="scanner-sidebar">
            {/* … tus sliders de quitar sombras, contraste, binarización, etc. */}
            {/* … botón Vista previa / Aplicar mejoras / Confirmar recorte */}
          </aside>

          {/* 🔻 Panel derecho: lienzo + overlay de vértices */}
          <section className="scanner-stage">
            {/* Si usás canvas + overlay, reemplazá <img/> por tus canvases */}
            {currentUrl ? (
              <img
                src={currentUrl}
                alt="preview"
                className="scanner-image"
                draggable={false}
              />
            ) : (
              <div className="muted">Cargá una imagen para comenzar…</div>
            )}

            {/* Navegación multipágina */}
            {pages.length > 1 && (
              <div className="pager">
                <button
                  className="btn"
                  onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  ◀
                </button>
                <span>{current + 1} / {pages.length}</span>
                <button
                  className="btn"
                  onClick={() => setCurrent(c => Math.min(pages.length - 1, c + 1))}
                  disabled={current === pages.length - 1}
                >
                  ▶
                </button>
              </div>
            )}
          </section>
        </div>

        {/* 🔻 Footer de acciones (export JPG/PDF A4, restablecer) */}
        <div className="modal-footer">
          <button className="btn">Exportar JPG (página)</button>
          <button className="btn">Exportar PDF (todas)</button>
          <button className="btn btn-ghost">Restablecer original</button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
