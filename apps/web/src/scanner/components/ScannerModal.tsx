import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPDFfromJPGs } from "../lib/pdf";

/** ========= Tipos ========= */
export type Point = { x: number; y: number };

export type Page = {
  id: string;
  name: string;
  file?: File;
  /** Bitmap renderizado (preview o final) */
  imageBitmap?: ImageBitmap;
  /** Canvas interno para edición */
  canvas?: HTMLCanvasElement;
  /** Tamaño base */
  w: number;
  h: number;
  /** Recorte (si existe), SIEMPRE 4 puntos (en sentido horario) */
  crop?: [Point, Point, Point, Point];
  /** Filtros */
  params: {
    shadows: number; // 0..10
    contrast: number; // 0..10
    binarize: number; // 0..10 (0 = off)
  };
  /** Estado UI */
  confirmedCrop?: boolean;
  pageNumber?: number; // N° que el usuario asigna a esta hoja
};

export type ScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: File[];
  className?: string;
};

/** ========= Helpers ========= */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toImageBitmap(file: File): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      createImageBitmap(img)
        .then((bm) => {
          URL.revokeObjectURL(url);
          resolve(bm);
        })
        .catch(reject);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Descarga */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Garantiza siempre 4 puntos */
function getCrop(p: Page): [Point, Point, Point, Point] {
  const W = p.canvas?.width ?? p.w ?? 100;
  const H = p.canvas?.height ?? p.h ?? 100;
  const fallback: [Point, Point, Point, Point] = [
    { x: 20, y: 20 },
    { x: W - 20, y: 20 },
    { x: W - 20, y: H - 20 },
    { x: 20, y: H - 20 },
  ];
  return (p.crop ?? fallback) as [Point, Point, Point, Point];
}

/** Aplica recorte + filtros muy básicos (canvas 2D, sin OpenCV) */
function renderProcessedToCanvas(
  page: Page,
  targetCanvas: HTMLCanvasElement,
  applyCrop: boolean
) {
  const ctx = targetCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !page.imageBitmap) return;

  const srcW = page.imageBitmap.width;
  const srcH = page.imageBitmap.height;

  const crop = getCrop(page);

  // Si se aplica crop, calculamos el bbox del polígono (rect simple)
  let sx = 0,
    sy = 0,
    sw = srcW,
    sh = srcH;

  if (applyCrop) {
    const xs = crop.map((p) => p.x);
    const ys = crop.map((p) => p.y);
    const minX = clamp(Math.min(...xs), 0, srcW);
    const maxX = clamp(Math.max(...xs), 0, srcW);
    const minY = clamp(Math.min(...ys), 0, srcH);
    const maxY = clamp(Math.max(...ys), 0, srcH);
    sx = Math.floor(minX);
    sy = Math.floor(minY);
    sw = Math.max(1, Math.floor(maxX - minX));
    sh = Math.max(1, Math.floor(maxY - minY));
  }

  targetCanvas.width = sw;
  targetCanvas.height = sh;
  ctx.drawImage(page.imageBitmap, sx, sy, sw, sh, 0, 0, sw, sh);

  // Filtros simples
  const { shadows, contrast, binarize } = page.params;
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  // "Quitar sombras": subimos gamma / nivel mínimo
  const shFactor = 1 + (shadows / 10) * 0.6; // 1..1.6
  // Contraste (fórmula lineal)
  const cFactor = (contrast / 10) * 0.6; // 0..0.6

  for (let i = 0; i < data.length; i += 4) {
    // gamma-ish (muy simple)
    data[i] = clamp(data[i] * shFactor, 0, 255);
    data[i + 1] = clamp(data[i + 1] * shFactor, 0, 255);
    data[i + 2] = clamp(data[i + 2] * shFactor, 0, 255);

    // contraste
    for (let k = 0; k < 3; k++) {
      const v = data[i + k] / 255;
      const centered = (v - 0.5) * (1 + cFactor) + 0.5;
      data[i + k] = clamp(Math.round(centered * 255), 0, 255);
    }

    // binarización (0 = off)
    if (binarize > 0) {
      const thr = 128 - Math.round((binarize / 10) * 40); // 128..88
      const g = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const bw = g >= thr ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = bw;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/** Convierte una página a JPG (Blob) */
async function pageToJPGBlob(page: Page, quality = 0.9): Promise<Blob> {
  const canvas = document.createElement("canvas");
  // Al exportar, aplicamos el recorte confirmado
  renderProcessedToCanvas(page, canvas, true);
  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b as Blob), "image/jpeg", quality)
  );
  return blob;
}

/** ========= Componente ========= */
const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  initialFiles = [],
  className,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [idx, setIdx] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true); // vértices visibles hasta confirmar
  const [autoPreview, setAutoPreview] = useState(true);

  // sliders
  const [shadows, setShadows] = useState(5);
  const [contrast, setContrast] = useState(5);
  const [binarize, setBinarize] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /** Carga inicial de archivos */
  useEffect(() => {
    if (!isOpen) return;
    if (!initialFiles || initialFiles.length === 0) return;

    (async () => {
      const newPages: Page[] = [];
      for (const f of initialFiles) {
        const bm = await toImageBitmap(f);
        const p: Page = {
          id: crypto.randomUUID(),
          name: f.name,
          file: f,
          imageBitmap: bm,
          w: bm.width,
          h: bm.height,
          params: { shadows, contrast, binarize },
          pageNumber: undefined,
        };
        newPages.push(p);
      }
      setPages(newPages);
      setIdx(0);
      setShowOverlay(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /** Sincroniza sliders a la página actual */
  useEffect(() => {
    if (!pages[idx]) return;
    const p = pages[idx];
    if (
      p.params.shadows !== shadows ||
      p.params.contrast !== contrast ||
      p.params.binarize !== binarize
    ) {
      const arr = [...pages];
      arr[idx] = {
        ...p,
        params: { shadows, contrast, binarize },
      };
      setPages(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadows, contrast, binarize, idx]);

  /** Re-render preview */
  useEffect(() => {
    if (!autoPreview) return;
    drawPreview(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, idx, autoPreview]);

  function drawPreview(applyCrop: boolean) {
    const p = pages[idx];
    const canvas = canvasRef.current;
    if (!p || !canvas) return;
    renderProcessedToCanvas(p, canvas, applyCrop && !!p.confirmedCrop);
  }

  /** Eventos de drag de vértices */
  const dragRef = useRef<{ dragging: boolean; pointIndex: number }>({
    dragging: false,
    pointIndex: -1,
  });

  function stageToImageCoords(e: React.MouseEvent): Point | null {
    const p = pages[idx];
    const canvas = canvasRef.current;
    if (!p || !canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clamp(e.clientX - rect.left, 0, rect.width);
    const py = clamp(e.clientY - rect.top, 0, rect.height);
    // Transformación 1:1 (canvas ajusta su tamaño CSS al real)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: px * scaleX, y: py * scaleY };
  }

  function onDown(e: React.MouseEvent) {
    if (!showOverlay) return;
    const p = pages[idx];
    if (!p) return;
    const pos = stageToImageCoords(e);
    if (!pos) return;
    const cropNow = getCrop(p);

    // buscar vértice más cercano
    let best = { i: -1, d: Number.MAX_VALUE };
    cropNow.forEach((pt, i) => {
      const d = (pt.x - pos.x) ** 2 + (pt.y - pos.y) ** 2;
      if (d < best.d) best = { i, d };
    });

    if (best.i >= 0) {
      dragRef.current = { dragging: true, pointIndex: best.i };
    }
  }
  function onMove(e: React.MouseEvent) {
    if (!dragRef.current.dragging) return;
    const p = pages[idx];
    if (!p) return;
    const pos = stageToImageCoords(e);
    if (!pos) return;

    const base = getCrop(p);
    const crop = [...base] as [Point, Point, Point, Point];
    crop[dragRef.current.pointIndex] = { x: pos.x, y: pos.y };

    setPages((prev) => {
      const arr = [...prev];
      arr[idx] = { ...p, crop };
      return arr;
    });

    if (autoPreview) drawPreview(false);
  }
  function onUp() {
    dragRef.current = { dragging: false, pointIndex: -1 };
  }

  /** Confirmar recorte (oculta vértices) */
  function onConfirmCrop() {
    setPages((prev) => {
      const p = prev[idx];
      const arr = [...prev];
      arr[idx] = { ...p, crop: getCrop(p), confirmedCrop: true };
      return arr;
    });
    setShowOverlay(false);
    drawPreview(true);
  }

  /** Reset a original (quita crop y filtros) */
  function onResetPage() {
    setPages((prev) => {
      const p = prev[idx];
      const arr = [...prev];
      arr[idx] = {
        ...p,
        crop: undefined,
        confirmedCrop: false,
        params: { shadows: 5, contrast: 5, binarize: 0 },
      };
      return arr;
    });
    setShadows(5);
    setContrast(5);
    setBinarize(0);
    setShowOverlay(true);
    drawPreview(false);
  }

  /** Export JPG página */
  async function onExportJPG() {
    const p = pages[idx];
    if (!p) return;
    const blob = await pageToJPGBlob(p, 0.92);
    downloadBlob(blob, `${p.name || `pagina-${idx + 1}`}.jpg`);
  }

  /** Export PDF (todas) en A4 con margen estándar */
  async function onExportAllPDF() {
    if (pages.length === 0) return;
    // Convertimos cada página a JPG bytes
    const images: Uint8Array[] = [];
    for (let i = 0; i < pages.length; i++) {
      const blob = await pageToJPGBlob(pages[i], 0.92);
      const ab = await blob.arrayBuffer();
      images.push(new Uint8Array(ab));
    }
    const pdfBytes = await createPDFfromJPGs(images, { a4: true, marginPt: 18 });
    downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "documento.pdf");
  }

  /** Navegación */
  function go(prevNext: -1 | 1) {
    setIdx((i) => clamp(i + prevNext, 0, pages.length - 1));
    setShowOverlay(true);
  }

  /** set pageNumber por página */
  function setPageNumberForCurrent(n: number) {
    setPages((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], pageNumber: n };
      return arr;
    });
  }

  /** Render preview una vez abierto */
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => drawPreview(false), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const page = pages[idx];
  const cropToDraw = page ? getCrop(page) : undefined;

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay`}>
      <div className={`modal ${className ?? ""}`}>
        <div className="modal-head">
          <strong>Escáner</strong>
          <label className="chk">
            <input
              type="checkbox"
              checked={autoPreview}
              onChange={(e) => setAutoPreview(e.target.checked)}
            />
            Auto-preview
          </label>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="modal-body">
          {/* Panel izquierdo: sliders */}
          <div className="left">
            <div className="group">
              <label>Quitar sombras</label>
              <input
                type="range"
                min={0}
                max={10}
                value={shadows}
                onChange={(e) => setShadows(Number(e.target.value))}
              />
            </div>
            <div className="group">
              <label>Contraste</label>
              <input
                type="range"
                min={0}
                max={10}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
              />
            </div>
            <div className="group">
              <label>Binarización (0 = off)</label>
              <input
                type="range"
                min={0}
                max={10}
                value={binarize}
                onChange={(e) => setBinarize(Number(e.target.value))}
              />
            </div>

            <div className="btn-row">
              <button className="btn" onClick={() => drawPreview(false)}>
                Vista previa
              </button>
              <button className="btn btn-primary" onClick={onConfirmCrop}>
                Confirmar recorte
              </button>
              <button className="btn" onClick={onResetPage}>
                Restablecer original
              </button>
            </div>
          </div>

          {/* Panel derecho: canvas + overlay */}
          <div
            className="stage"
            ref={stageRef}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
          >
            <div className="canvas-wrap">
              <canvas ref={canvasRef} />
              {/* Overlay */}
              {page && showOverlay && cropToDraw && (
                <svg
                  className="overlay"
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${canvasRef.current?.width ?? page.w} ${
                    canvasRef.current?.height ?? page.h
                  }`}
                  preserveAspectRatio="none"
                >
                  <polygon
                    className="poly"
                    points={cropToDraw.map((p) => `${p.x},${p.y}`).join(" ")}
                  />
                  {cropToDraw.map((p, i) => (
                    <circle key={i} className="handle" cx={p.x} cy={p.y} r={18} />
                  ))}
                </svg>
              )}
            </div>

            {/* Barra inferior: navegación y export */}
            <div className="bottom-bar">
              <div className="nav">
                <button
                  className="btn"
                  onClick={() => go(-1)}
                  disabled={idx === 0}
                  title="Anterior"
                >
                  ◀
                </button>
                <span className="page-indicator">
                  Página {idx + 1} / {pages.length || 1}
                </span>
                <button
                  className="btn"
                  onClick={() => go(1)}
                  disabled={idx >= pages.length - 1}
                  title="Siguiente"
                >
                  ▶
                </button>
              </div>

              <div className="page-number">
                <label>N° de página</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={page?.pageNumber ?? ""}
                  onChange={(e) => setPageNumberForCurrent(Number(e.target.value))}
                  placeholder="—"
                />
              </div>

              <div className="export">
                <button className="btn" onClick={onExportJPG} disabled={!page}>
                  Exportar JPG (página)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onExportAllPDF}
                  disabled={pages.length === 0}
                >
                  Exportar PDF (todas)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="modal-foot">
          <small>Procesamiento local. Tus archivos no se suben hasta confirmar.</small>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;

/* ==================== Estilos mínimos (opcional) ====================

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index: 9999; }
.modal { width: min(1200px, 95vw); height: min(86vh, 900px); background:#0b1420; border-radius:16px; box-shadow: 0 10px 50px rgba(0,0,0,.6); display:flex; flex-direction:column; border:1px solid #0f213a; }
.modal-head, .modal-foot { padding:10px 16px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #0f213a; }
.modal-foot { border-top:1px solid #0f213a; border-bottom:none; justify-content:flex-end; }
.modal-body { flex:1; display:grid; grid-template-columns: 320px 1fr; gap:16px; padding:16px; }
.left .group { margin-bottom:14px; }
.left label { display:block; font-size:14px; margin-bottom:6px; color:#cfe2ff; }
.left input[type="range"] { width:100%; }
.btn-row { display:flex; gap:8px; flex-wrap:wrap; }
.stage { display:flex; flex-direction:column; height:100%; }
.canvas-wrap { position:relative; flex:1; overflow:auto; background:#09121d; border-radius:12px; border:1px solid #0f213a; }
.canvas-wrap canvas { display:block; margin:0 auto; background:#0b1420; }
.overlay { position:absolute; inset:0; pointer-events:none; }
.overlay .poly { fill: rgba(59,130,246,.08); stroke:#5ab0ff; stroke-width:3; }
.overlay .handle { fill:#00e0ff; opacity:.9; }
.bottom-bar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:8px; }
.page-indicator { color:#cfe2ff; }
.btn { background:#0d1b2a; color:#e6f0ff; padding:8px 12px; border-radius:10px; border:1px solid #17304f; }
.btn:hover { background:#122540; }
.btn-primary { background:linear-gradient(135deg,#1e74ff,#3aa3ff); border-color:#2a79ff; }
.btn-secondary { background:#16263c; border-color:#1d3355; }
.chk { display:flex; align-items:center; gap:6px; margin-left:auto; margin-right:auto; color:#cfe2ff; }
.page-number input { width:80px; padding:6px 8px; border-radius:10px; background:#0d1b2a; color:#e6f0ff; border:1px solid #17304f; }
*/
