import React, { useEffect, useRef, useState } from "react";
import { createPDFfromJPGs } from "../lib/pdf";

/** ========= Tipos ========= */
export type Point = { x: number; y: number };

export type Page = {
  id: string;
  name: string;
  file?: File;
  imageBitmap?: ImageBitmap;
  w: number;
  h: number;
  crop?: [Point, Point, Point, Point]; // 4 puntos, horario
  params: {
    shadows: number; // 0..10
    contrast: number; // 0..10
    binarize: number; // 0..10 (0 = off)
  };
  confirmedCrop?: boolean;
  pageNumber?: number;
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

/** Si no hay crop, devolvemos un rectángulo margen 20px */
function getCrop(p: Page): [Point, Point, Point, Point] {
  const W = p.w ?? 100;
  const H = p.h ?? 100;
  const fallback: [Point, Point, Point, Point] = [
    { x: 20, y: 20 },
    { x: W - 20, y: 20 },
    { x: W - 20, y: H - 20 },
    { x: 20, y: H - 20 },
  ];
  return (p.crop ?? fallback) as [Point, Point, Point, Point];
}

/** Renderiza (recorte por bbox + filtros) al canvas destino */
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

  // bbox simple del polígono
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

  const { shadows, contrast, binarize } = page.params;
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  const shFactor = 1 + (shadows / 10) * 0.6; // 1..1.6
  const cFactor = (contrast / 10) * 0.6; // 0..0.6

  for (let i = 0; i < data.length; i += 4) {
    // quitar sombras (gamma simple)
    data[i] = clamp(data[i] * shFactor, 0, 255);
    data[i + 1] = clamp(data[i + 1] * shFactor, 0, 255);
    data[i + 2] = clamp(data[i + 2] * shFactor, 0, 255);

    // contraste lineal
    for (let k = 0; k < 3; k++) {
      const v = data[i + k] / 255;
      const centered = (v - 0.5) * (1 + cFactor) + 0.5;
      data[i + k] = clamp(Math.round(centered * 255), 0, 255);
    }

    // binarización opcional
    if (binarize > 0) {
      const thr = 128 - Math.round((binarize / 10) * 40);
      const g = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const bw = g >= thr ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = bw;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/** Convierte página a JPG Blob (con el recorte confirmado) */
async function pageToJPGBlob(page: Page, quality = 0.92): Promise<Blob> {
  const tmp = document.createElement("canvas");
  renderProcessedToCanvas(page, tmp, true);
  const blob = await new Promise<Blob>((res) =>
    tmp.toBlob((b) => res(b as Blob), "image/jpeg", quality)
  );
  return blob;
}

/** ========= Componente ========= */
type Mode = "edit" | "preview";

const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  initialFiles = [],
  className,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [idx, setIdx] = useState(0);

  const [mode, setMode] = useState<Mode>("edit"); // ← clave para overlay/edición
  const [showOverlay, setShowOverlay] = useState(true);
  const [autoPreview, setAutoPreview] = useState(true);

  const [shadows, setShadows] = useState(5);
  const [contrast, setContrast] = useState(5);
  const [binarize, setBinarize] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /** Carga inicial (si llegan archivos) */
  useEffect(() => {
    if (!isOpen) return;
    if (!initialFiles || initialFiles.length === 0) return;

    (async () => {
      const newPages: Page[] = [];
      for (const f of initialFiles) {
        const bm = await toImageBitmap(f);
        newPages.push({
          id: crypto.randomUUID(),
          name: f.name,
          file: f,
          imageBitmap: bm,
          w: bm.width,
          h: bm.height,
          params: { shadows, contrast, binarize },
        });
      }
      setPages(newPages);
      setIdx(0);
      setMode("edit");
      setShowOverlay(true);
      setTimeout(() => drawPreview(), 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /** Agregar imágenes nuevas */
  async function addFiles(fs: FileList | null) {
    if (!fs || fs.length === 0) return;
    const arr: Page[] = [...pages];
    for (const f of Array.from(fs)) {
      const bm = await toImageBitmap(f);
      arr.push({
        id: crypto.randomUUID(),
        name: f.name,
        file: f,
        imageBitmap: bm,
        w: bm.width,
        h: bm.height,
        params: { shadows, contrast, binarize },
      });
    }
    setPages(arr);
    setIdx(arr.length - 1);
    setMode("edit");
    setShowOverlay(true);
    setTimeout(() => drawPreview(), 0);
  }

  /** Mantener sliders en la página actual */
  useEffect(() => {
    if (!pages[idx]) return;
    const p = pages[idx];
    if (
      p.params.shadows !== shadows ||
      p.params.contrast !== contrast ||
      p.params.binarize !== binarize
    ) {
      const arr = [...pages];
      arr[idx] = { ...p, params: { shadows, contrast, binarize } };
      setPages(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadows, contrast, binarize, idx]);

  /** Re-render preview cuando cambian entradas
   *  — si la página está confirmada, aplicamos el recorte en la vista. */
  useEffect(() => {
    if (!autoPreview) return;
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, idx, autoPreview, mode]);

  /** Dibuja preview; por defecto respeta confirmedCrop */
  function drawPreview(forceApplyCrop?: boolean) {
    const p = pages[idx];
    const canvas = canvasRef.current;
    if (!p || !canvas) return;
    const apply = forceApplyCrop ?? !!p.confirmedCrop;
    renderProcessedToCanvas(p, canvas, apply);
  }

  /** Coordenadas en espacio de imagen */
  function stageToImageCoords(e: React.MouseEvent): Point | null {
    const p = pages[idx];
    const canvas = canvasRef.current;
    if (!p || !canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clamp(e.clientX - rect.left, 0, rect.width);
    const py = clamp(e.clientY - rect.top, 0, rect.height);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: px * scaleX, y: py * scaleY };
  }

  /** Drag vértices (sólo en edit) */
  const dragRef = useRef<{ dragging: boolean; pointIndex: number }>({
    dragging: false,
    pointIndex: -1,
  });

  function onDown(e: React.MouseEvent) {
    if (!showOverlay || mode !== "edit") return;
    const p = pages[idx];
    if (!p) return;
    const pos = stageToImageCoords(e);
    if (!pos) return;
    const cropNow = getCrop(p);

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

  /** Confirmar recorte -> aplica al instante, cambia a preview y oculta overlay */
  function onConfirmCrop() {
    setPages((prev) => {
      const p = prev[idx];
      const arr = [...prev];
      arr[idx] = { ...p, crop: getCrop(p), confirmedCrop: true };
      return arr;
    });
    setMode("preview");
    setShowOverlay(false);
    drawPreview(true); // ← render con recorte confirmado EN LA VISTA
  }

  /** Editar recorte (vuelve a mostrar vértices) */
  function onEditCrop() {
    setPages((prev) => {
      const p = prev[idx];
      const arr = [...prev];
      arr[idx] = { ...p, confirmedCrop: false };
      return arr;
    });
    setMode("edit");
    setShowOverlay(true);
    drawPreview(false);
  }

  /** Resetear página */
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
    setMode("edit");
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

  /** Orden por Nº de página (para export y UI) */
  function getSortedIndices(): number[] {
    return pages
      .map((p, i) => ({ i, n: p.pageNumber ?? Number.POSITIVE_INFINITY }))
      .sort((a, b) => a.n - b.n || a.i - b.i)
      .map((x) => x.i);
  }

  /** Export PDF (todas) */
  async function onExportAllPDF() {
    if (!pages.length) return;
    const order = getSortedIndices();
    const images: Uint8Array[] = [];
    for (const i of order) {
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
    setMode("edit");
    setShowOverlay(true);
    setTimeout(() => drawPreview(), 0); // respeta confirmedCrop en la nueva página
  }

  /** Setear N° de página y reordenar visualmente */
  function setPageNumberForCurrent(n: number) {
    setPages((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], pageNumber: n || undefined };
      // ordenamos para UI
      return arr
        .map((p, i) => ({ p, i }))
        .sort((a, b) => {
          const an = a.p.pageNumber ?? Number.POSITIVE_INFINITY;
          const bn = b.p.pageNumber ?? Number.POSITIVE_INFINITY;
          return an - bn || a.i - b.i;
        })
        .map((x) => x.p);
    });
  }

  /** Dibujo inicial al abrir */
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => drawPreview(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const page = pages[idx];
  const cropToDraw = page ? getCrop(page) : undefined;
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal ${className ?? ""}`}>
        {/* ===== Header ===== */}
        <div className="modal-head">
          <strong style={{ fontSize: 18 }}>Escáner</strong>

          <label className="btn btn-primary" htmlFor="scanner-file" style={{ marginLeft: 12 }}>
            Agregar imagen
          </label>
          <input
            id="scanner-file"
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(e.target.files)}
          />

          <label className="chk" style={{ marginLeft: "auto" }}>
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

        {/* ===== Body ===== */}
        <div className="modal-body">
          {/* Sliders */}
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
              <button className="btn" onClick={() => drawPreview()}>
                Vista previa
              </button>

              {page?.confirmedCrop ? (
                <button className="btn" onClick={onEditCrop}>
                  Editar recorte
                </button>
              ) : (
                <button className="btn btn-primary" onClick={onConfirmCrop}>
                  Confirmar recorte
                </button>
              )}

              <button className="btn" onClick={onResetPage}>
                Restablecer original
              </button>
            </div>
          </div>

          {/* Canvas + overlay scrolleable */}
          <div
            className="stage"
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
          >
            <div className="canvas-wrap scanner-modal">
              <div
                className="canvas-inner"
                style={{
                  width: (canvasRef.current?.width || page?.w || 0) + "px",
                  height: (canvasRef.current?.height || page?.h || 0) + "px",
                }}
              >
                <canvas ref={canvasRef} />
                {page && showOverlay && cropToDraw && mode === "edit" && (
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
                      <circle key={i} className="handle" cx={p.x} cy={p.y} r={10} />
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Barra inferior */}
            <div className="bottom-bar">
              <div className="nav">
                <button className="btn" onClick={() => go(-1)} disabled={idx === 0} title="Anterior">
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
                <button className="btn btn-primary" onClick={onExportAllPDF} disabled={!pages.length}>
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
