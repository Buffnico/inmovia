import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPDFfromJPGs } from "../lib/pdf";

/** ========= Tipos ========= */
export type Point = { x: number; y: number };

export type Page = {
  id: string;
  name: string;
  file?: File;
  imageBitmap?: ImageBitmap;
  canvas?: HTMLCanvasElement;
  w: number;
  h: number;
  crop?: [Point, Point, Point, Point];
  params: {
    shadows: number;   // 0..10
    contrast: number;  // 0..10
    binarize: number;  // 0..10 (0 = off)
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

/** Renderiza en canvas: recorte (opcional) + filtros simples */
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
  let sx = 0, sy = 0, sw = srcW, sh = srcH;

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
  const cFactor = (contrast / 10) * 0.6;     // 0..0.6

  for (let i = 0; i < data.length; i += 4) {
    // quitar sombras (leve gamma)
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

/** Convierte una página a JPG (Blob) aplicando recorte confirmado */
async function pageToJPGBlob(page: Page, quality = 0.92): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderProcessedToCanvas(page, canvas, true);
  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b as Blob), "image/jpeg", quality)
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
  /** idx es el índice *visual* (ordenado) */
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("edit");
  const [showOverlay, setShowOverlay] = useState(true);
  const [autoPreview, setAutoPreview] = useState(true);

  // sliders baseline
  const [shadows, setShadows] = useState(5);
  const [contrast, setContrast] = useState(5);
  const [binarize, setBinarize] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null); // contenedor con scroll
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /** ============ ORDEN POR NÚMERO DE PÁGINA ============ */
  const sortedIdx = useMemo(() => {
    // sin número → al final, estable por índice original
    return pages
      .map((p, i) => ({
        i,
        n: p.pageNumber ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => (a.n - b.n) || (a.i - b.i))
      .map(o => o.i);
  }, [pages]);

  const viewCount = sortedIdx.length;
  const realIndex = sortedIdx[idx] ?? 0;     // índice real en `pages`
  const page = pages[realIndex];             // página actual según el orden visual

  /** Utils dibujo (usa el índice real) */
  function clearCanvas(c?: HTMLCanvasElement | null) {
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  }

  /** Dibuja según estado actual (decide recorte internamente) */
  function drawCurrent(force?: "crop" | "raw") {
    const p = page;
    const c = canvasRef.current;
    if (!p || !c) return;
    const applyCrop =
      force === "crop"
        ? true
        : force === "raw"
        ? false
        : !!p.confirmedCrop || mode === "preview";

    clearCanvas(c);
    renderProcessedToCanvas(p, c, applyCrop);
  }

  function drawCurrentRaf(force?: "crop" | "raw") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => drawCurrent(force));
    });
  }

  /** Carga inicial (si vienen archivos) */
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
    // mover selección al final (última imagen agregada) en el orden visual
    const nextSorted = arr
      .map((p, i) => ({ i, n: p.pageNumber ?? Number.MAX_SAFE_INTEGER }))
      .sort((a, b) => (a.n - b.n) || (a.i - b.i))
      .map(o => o.i);
    const real = arr.length - 1;
    const newViewIdx = Math.max(0, nextSorted.indexOf(real));
    setIdx(newViewIdx);

    setMode("edit");
    setShowOverlay(true);
    setTimeout(() => drawCurrentRaf("raw"), 0);
  }

  /** Sincroniza sliders a la página actual (índice real) */
  useEffect(() => {
    if (!page) return;
    if (
      page.params.shadows !== shadows ||
      page.params.contrast !== contrast ||
      page.params.binarize !== binarize
    ) {
      setPages(prev => {
        const arr = [...prev];
        arr[realIndex] = { ...page, params: { shadows, contrast, binarize } };
        return arr;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadows, contrast, binarize, realIndex]);

  /** Auto-preview (usa estado actual para decidir crop/raw) */
  useEffect(() => {
    if (!autoPreview) return;
    drawCurrentRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, realIndex, autoPreview, mode]);

  /** Al cambiar de página visual: limpiar, scrollear, setear modo y redibujar */
  useEffect(() => {
    if (!isOpen) return;
    clearCanvas(canvasRef.current);
    if (wrapRef.current) wrapRef.current.scrollTo({ top: 0, left: 0 });
    const nextConfirmed = !!page?.confirmedCrop;
    setMode(nextConfirmed ? "preview" : "edit");
    setShowOverlay(!nextConfirmed);
    drawCurrentRaf(nextConfirmed ? "crop" : "raw");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, isOpen, realIndex]);

  /** Coords (drag vértices) */
  function stageToImageCoords(e: React.MouseEvent): Point | null {
    if (!page) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clamp(e.clientX - rect.left, 0, rect.width);
    const py = clamp(e.clientY - rect.top, 0, rect.height);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: px * scaleX, y: py * scaleY };
  }

  /** Drag vértices */
  const dragRef = useRef<{ dragging: boolean; pointIndex: number }>({
    dragging: false,
    pointIndex: -1,
  });

  function onDown(e: React.MouseEvent) {
    if (!showOverlay || mode !== "edit" || !page) return;
    const pos = stageToImageCoords(e);
    if (!pos) return;
    const cropNow = getCrop(page);

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
    if (!dragRef.current.dragging || !page) return;
    const pos = stageToImageCoords(e);
    if (!pos) return;
    const base = getCrop(page);
    const crop = [...base] as [Point, Point, Point, Point];
    crop[dragRef.current.pointIndex] = { x: pos.x, y: pos.y };

    setPages(prev => {
      const arr = [...prev];
      arr[realIndex] = { ...page, crop };
      return arr;
    });

    if (autoPreview) drawCurrent();
  }
  function onUp() {
    dragRef.current = { dragging: false, pointIndex: -1 };
  }

  /** Confirmar recorte (oculta vértices y dibuja con crop) */
  function onConfirmCrop() {
    if (!page) return;
    setPages(prev => {
      const arr = [...prev];
      arr[realIndex] = { ...page, crop: getCrop(page), confirmedCrop: true };
      return arr;
    });
    setShowOverlay(false);
    setMode("preview");
    clearCanvas(canvasRef.current);
    setTimeout(() => drawCurrentRaf("crop"), 0);
  }

  /** Volver a editar recorte */
  function onEditCrop() {
    if (!page) return;
    setPages(prev => {
      const arr = [...prev];
      arr[realIndex] = { ...page, confirmedCrop: false };
      return arr;
    });
    setShowOverlay(true);
    setMode("edit");
    clearCanvas(canvasRef.current);
    setTimeout(() => drawCurrentRaf("raw"), 0);
  }

  /** Reset a original (quita crop y filtros) */
  function onResetPage() {
    if (!page) return;
    setPages(prev => {
      const arr = [...prev];
      arr[realIndex] = {
        ...page,
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
    setMode("edit");
    clearCanvas(canvasRef.current);
    setTimeout(() => drawCurrentRaf("raw"), 0);
  }

  /** Export JPG página */
  async function onExportJPG() {
    if (!page) return;
    const blob = await pageToJPGBlob(page, 0.92);
    downloadBlob(blob, `${page.name || `pagina-${idx + 1}`}.jpg`);
  }

  /** Export PDF (todas) en orden visual */
  async function onExportAllPDF() {
    if (pages.length === 0) return;
    const images: Uint8Array[] = [];
    for (const i of sortedIdx) {
      const p = pages[i];
      const blob = await pageToJPGBlob(p, 0.92);
      const ab = await blob.arrayBuffer();
      images.push(new Uint8Array(ab));
    }
    const pdfBytes = await createPDFfromJPGs(images, { a4: true, marginPt: 18 });
    downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "documento.pdf");
  }

  /** Navegación por el orden visual */
  function go(delta: -1 | 1) {
    setIdx((i) => clamp(i + delta, 0, viewCount - 1));
    // El useEffect([idx]) limpia/redibuja/overlay
  }

  /** set pageNumber por página (re-ubica la selección según el nuevo orden) */
  function setPageNumberForCurrent(n: number) {
    if (!page) return;
    setPages(prev => {
      const arr = [...prev];
      const pn = Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
      arr[realIndex] = { ...page, pageNumber: pn };

      // recalcular orden con el array actualizado
      const nextSorted = arr
        .map((p, i) => ({ i, n: p.pageNumber ?? Number.MAX_SAFE_INTEGER }))
        .sort((a, b) => (a.n - b.n) || (a.i - b.i))
        .map(o => o.i);

      // ubicar el índice visual del ítem editado
      const newViewIdx = Math.max(0, nextSorted.indexOf(realIndex));
      setIdx(newViewIdx);

      return arr;
    });
  }

  /** Render inicial al abrir */
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => drawCurrentRaf("raw"), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // dimensiones para overlay 1:1 y scroll correcto (según la página actual)
  const cw = (page && (canvasRef.current?.width || page.w)) || 0;
  const ch = (page && (canvasRef.current?.height || page.h)) || 0;

  return (
    <div className="modal-overlay">
      <div className={`modal ${className ?? ""}`}>
        {/* ====== Header ====== */}
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

        {/* ====== Body ====== */}
        <div className="modal-body scanner-page">
          {/* Panel izquierdo: sliders + acciones */}
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

            <div className="btn-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => drawCurrentRaf("raw")}>
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

          {/* Panel derecho: canvas + overlay + barra inferior */}
          <div
            className="stage"
            ref={stageRef}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
          >
            <div className="canvas-wrap scanner-modal" ref={wrapRef}>
              <div
                className="canvas-inner"
                style={{ width: `${cw}px`, height: `${ch}px` }}
              >
                {/* canvas con key por página real para evitar “imagen congelada” */}
                <canvas ref={canvasRef} key={page?.id || "empty"} />

                {/* Overlay solo en modo edición */}
                {page && showOverlay && mode === "edit" && page.crop && cw > 0 && ch > 0 && (
                  <svg
                    className="overlay"
                    viewBox={`0 0 ${cw} ${ch}`}
                    preserveAspectRatio="none"
                  >
                    <polygon
                      className="poly"
                      points={getCrop(page).map((p) => `${p.x},${p.y}`).join(" ")}
                    />
                    {getCrop(page).map((p, i) => (
                      <circle key={i} className="handle" cx={p.x} cy={p.y} r={10} />
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Barra inferior */}
            <div className="bottom-bar">
              <div className="nav" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn"
                  onClick={() => go(-1)}
                  disabled={idx === 0}
                  title="Anterior"
                >
                  ◀
                </button>
                <span className="page-indicator">
                  Página {idx + 1} / {viewCount || 1}
                </span>
                <button
                  className="btn"
                  onClick={() => go(1)}
                  disabled={idx >= viewCount - 1}
                  title="Siguiente"
                >
                  ▶
                </button>
              </div>

              <div className="page-number" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

              <div className="export" style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={onExportJPG} disabled={!page}>
                  Exportar JPG (página)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onExportAllPDF}
                  disabled={viewCount === 0}
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
