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
  onSaveToDocuments?: (file: File) => void;
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

  const shFactor = 1 + (shadows / 10) * 0.6;
  const cFactor = (contrast / 10) * 0.6;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * shFactor, 0, 255);
    data[i + 1] = clamp(data[i + 1] * shFactor, 0, 255);
    data[i + 2] = clamp(data[i + 2] * shFactor, 0, 255);

    for (let k = 0; k < 3; k++) {
      const v = data[i + k] / 255;
      const centered = (v - 0.5) * (1 + cFactor) + 0.5;
      data[i + k] = clamp(Math.round(centered * 255), 0, 255);
    }

    if (binarize > 0) {
      const thr = 128 - Math.round((binarize / 10) * 40);
      const g = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const bw = g >= thr ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = bw;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

async function pageToJPGBlob(page: Page, quality = 0.92): Promise<Blob> {
  const tmp = document.createElement("canvas");
  renderProcessedToCanvas(page, tmp, true);
  const blob = await new Promise<Blob>((res) =>
    tmp.toBlob((b) => res(b as Blob), "image/jpeg", quality)
  );
  return blob;
}

/** ========= Componente Unificado ========= */
type Mode = "edit" | "preview";

const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  initialFiles = [],
  className,
  onSaveToDocuments,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [idx, setIdx] = useState(0);

  const [mode, setMode] = useState<Mode>("edit");
  const [showOverlay, setShowOverlay] = useState(true);
  const [autoPreview, setAutoPreview] = useState(true);

  const [shadows, setShadows] = useState(5);
  const [contrast, setContrast] = useState(5);
  const [binarize, setBinarize] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Camera State ---
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Lógica idéntica al original ---
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
    // FIX: Switch to the last added page automatically
    setIdx(arr.length - 1);
    setMode("edit");
    setShowOverlay(true);
    // Effect [pages, idx] will trigger drawPreview
  }

  // --- Camera Functions ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara. Verificá los permisos.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });

      const bm = await toImageBitmap(file);
      const newPage: Page = {
        id: crypto.randomUUID(),
        name: file.name,
        file: file,
        imageBitmap: bm,
        w: bm.width,
        h: bm.height,
        params: { shadows: 5, contrast: 5, binarize: 0 },
      };

      setPages(prev => {
        const next = [...prev, newPage];
        // Update index to the new last page
        setIdx(next.length - 1);
        return next;
      });

      // Flash effect feedback
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.right = '0';
      flash.style.bottom = '0';
      flash.style.backgroundColor = 'white';
      flash.style.opacity = '0.8';
      flash.style.zIndex = '100';
      flash.style.transition = 'opacity 0.5s';
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => document.body.removeChild(flash), 500);
      }, 50);

    }, "image/jpeg", 0.95);
  };

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

  useEffect(() => {
    if (!autoPreview) return;
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, idx, autoPreview, mode]);

  function drawPreview(forceApplyCrop?: boolean) {
    const p = pages[idx];
    const canvas = canvasRef.current;
    if (!p || !canvas) return;
    const apply = forceApplyCrop ?? !!p.confirmedCrop;
    renderProcessedToCanvas(p, canvas, apply);
  }

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
  }
  function onUp() {
    dragRef.current = { dragging: false, pointIndex: -1 };
  }

  function onConfirmCrop() {
    setPages((prev) => {
      const p = prev[idx];
      const arr = [...prev];
      arr[idx] = { ...p, crop: getCrop(p), confirmedCrop: true };
      return arr;
    });
    setMode("preview");
    setShowOverlay(false);
    drawPreview(true);
  }

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

  async function onExportJPG() {
    const p = pages[idx];
    if (!p) return;
    const blob = await pageToJPGBlob(p, 0.92);
    downloadBlob(blob, `${p.name || `pagina-${idx + 1}`}.jpg`);
  }

  function getSortedIndices(): number[] {
    return pages
      .map((p, i) => ({ i, n: p.pageNumber ?? Number.POSITIVE_INFINITY }))
      .sort((a, b) => a.n - b.n || a.i - b.i)
      .map((x) => x.i);
  }

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

  async function handleSaveToDocuments() {
    if (!pages.length) return;
    if (!onSaveToDocuments) return;

    const order = getSortedIndices();
    const images: Uint8Array[] = [];
    for (const i of order) {
      const blob = await pageToJPGBlob(pages[i], 0.92);
      const ab = await blob.arrayBuffer();
      images.push(new Uint8Array(ab));
    }
    const pdfBytes = await createPDFfromJPGs(images, { a4: true, marginPt: 18 });

    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const timestamp = new Date();
    // Format: YYYY-MM-DD-HH-mm-ss
    const dateStr = timestamp.toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const defaultName = `Escaneo_${dateStr}.pdf`;
    const pdfFile = new File([pdfBlob], defaultName, { type: "application/pdf" });

    onSaveToDocuments(pdfFile);
  }

  function go(prevNext: -1 | 1) {
    const newIdx = clamp(idx + prevNext, 0, pages.length - 1);
    setIdx(newIdx);

    // Si la página ya tiene crop confirmado, vamos a preview directamente
    const targetPage = pages[newIdx];
    if (targetPage && targetPage.confirmedCrop) {
      setMode("preview");
      setShowOverlay(false);
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && targetPage) {
          renderProcessedToCanvas(targetPage, canvas, true);
        }
      }, 0);
    } else {
      setMode("edit");
      setShowOverlay(true);
    }
  }

  function setPageNumberForCurrent(n: number | undefined) {
    const currentId = pages[idx].id;

    // 1. Calculamos el nuevo array ordenado
    const newPages = [...pages];
    newPages[idx] = { ...newPages[idx], pageNumber: n };

    const sorted = newPages
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        const an = a.p.pageNumber ?? Number.POSITIVE_INFINITY;
        const bn = b.p.pageNumber ?? Number.POSITIVE_INFINITY;
        return an - bn || a.i - b.i;
      })
      .map((x) => x.p);

    // 2. Buscamos dónde quedó nuestra página
    const newIdx = sorted.findIndex(p => p.id === currentId);

    // 3. Actualizamos estado
    setPages(sorted);
    if (newIdx !== -1) {
      setIdx(newIdx);
    }
  }

  function onDeletePage() {
    if (pages.length === 0) return;
    setPages((prev) => {
      const newPages = prev.filter((_, i) => i !== idx);
      // Ajustar índice si es necesario
      if (idx >= newPages.length) {
        setIdx(Math.max(0, newPages.length - 1));
      }
      // Si nos quedamos sin páginas, volver a modo edit o resetear
      if (newPages.length === 0) {
        setMode("edit");
        setShowOverlay(true);
      } else {
        // Forzar redibujado de la nueva página actual
        setTimeout(() => drawPreview(), 0);
      }
      return newPages;
    });
  }

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => drawPreview(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const page = pages[idx];
  const cropToDraw = page ? getCrop(page) : undefined;

  // --- Helpers ---
  const isMobileDevice = () => {
    if (typeof navigator === "undefined") return false;
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  };

  const handleCameraClick = () => {
    if (isMobileDevice()) {
      cameraInputRef.current?.click();
    } else {
      startCamera();
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addFiles(files);
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay modern-scanner-overlay">
      <style>{`
        .modern-scanner-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .modern-scanner-modal {
          width: 100%;
          max-width: 1200px;
          height: 90vh;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }
        .ms-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          flex-shrink: 0;
        }
        .ms-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ms-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .ms-sidebar {
          width: 320px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          overflow-y: auto;
          flex-shrink: 0;
          z-index: 10;
        }
        
        /* Canvas Area: Scrollable container */
        .ms-canvas-area {
          flex: 1;
          background: #334155;
          position: relative;
          overflow: auto; /* Enable scroll */
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center; /* Center horizontally */
          justify-content: flex-start; 
        }

        .ms-control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ms-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          display: flex;
          justify-content: space-between;
        }
        .ms-range {
          width: 100%;
          height: 6px;
          background: #cbd5e1;
          border-radius: 3px;
          appearance: none;
          outline: none;
        }
        .ms-range::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: #2563eb;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .ms-btn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        /* Canvas Wrapper: Holds canvas + SVG */
        .ms-canvas-wrapper {
          position: relative;
          width: auto;
          height: auto;
          max-width: 100%; /* Fit within container width */
          margin: auto; /* Center if smaller than container */
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Ensure canvas is block to remove bottom gap */
        .ms-canvas-wrapper canvas {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .ms-footer {
          padding: 1rem 1.5rem;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          z-index: 10;
        }
        .ms-nav-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 99px;
        }
        .ms-page-info {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          font-size: 0.9rem;
        }
        .ms-nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #64748b;
          display: flex;
          align-items: center;
          padding: 0 0.5rem;
        }
        .ms-nav-btn:hover:not(:disabled) { color: #0f172a; }
        .ms-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .ms-poly { 
          fill: rgba(37, 99, 235, 0.15); 
          stroke: #2563eb; 
          stroke-width: 2; 
          vector-effect: non-scaling-stroke;
        }
        .ms-handle { 
          fill: white; 
          stroke: #2563eb; 
          stroke-width: 3; 
          cursor: grab; 
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          transition: r 0.2s;
        }
        .ms-handle:hover {
          r: 10;
          fill: #eff6ff;
        }
        .ms-handle-hitbox {
          fill: transparent;
          cursor: grab;
        }
        .ms-btn-add {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f1f5f9;
          color: #0f172a;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .ms-btn-add:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
        .ms-btn-add:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="modern-scanner-modal">
        {/* HEADER */}
        <div className="ms-header">
          <div className="ms-title">
            <span>📸</span> Inmovia Scanner
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* ÚNICO botón visible para subir archivos */}
            <button className="ms-btn-add" onClick={handleFileInputClick}>
              <span>+</span> Subir archivos
            </button>

            {/* Botón único de Cámara */}
            <button className="ms-btn-add" onClick={handleCameraClick}>
              <span>📷</span> Cámara
            </button>

            {/* Input oculto para subir archivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />

            {/* Input oculto para cámara nativa en móvil */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = ""; // Reset
              }}
            />

            <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 0.5rem' }}></div>

            <button className="btn-icon-close" onClick={() => { stopCamera(); onClose(); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* BODY */}
        <div className="ms-body">

          {/* Camera Overlay */}
          {showCamera && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: '#0f172a',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <video
                ref={videoRef}
                style={{ maxWidth: '100%', maxHeight: '80%', objectFit: 'contain' }}
                autoPlay
                playsInline
              />
              <div style={{ marginTop: 20, display: 'flex', gap: 20 }}>
                <button className="btn btn-secondary" onClick={stopCamera}>
                  Cancelar
                </button>
                <button className="btn btn-primary" style={{ transform: 'scale(1.2)', padding: '0.75rem 2rem' }} onClick={capturePhoto}>
                  ⚪ Capturar
                </button>
              </div>
              <div style={{ color: 'white', marginTop: 10, fontSize: '0.9rem' }}>
                {pages.length} páginas capturadas
              </div>
            </div>
          )}

          {/* SIDEBAR CONTROLS */}
          <div className="ms-sidebar">

            <div className="ms-control-group">
              <label className="ms-label">
                <span>Mejora de Imagen</span>
                <span style={{ fontWeight: 400, color: '#94a3b8' }}>{shadows}/10</span>
              </label>
              <input type="range" min={0} max={10} value={shadows} onChange={(e) => setShadows(Number(e.target.value))} className="ms-range" />
              <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Quitar sombras</small>
            </div>

            <div className="ms-control-group">
              <label className="ms-label">
                <span>Contraste</span>
                <span style={{ fontWeight: 400, color: '#94a3b8' }}>{contrast}/10</span>
              </label>
              <input type="range" min={0} max={10} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="ms-range" />
            </div>

            <div className="ms-control-group">
              <label className="ms-label">
                <span>Binarización (B/N)</span>
                <span style={{ fontWeight: 400, color: '#94a3b8' }}>{binarize === 0 ? 'Off' : binarize}</span>
              </label>
              <input type="range" min={0} max={10} value={binarize} onChange={(e) => setBinarize(Number(e.target.value))} className="ms-range" />
            </div>

            <hr style={{ borderColor: '#e2e8f0' }} />

            <div className="ms-btn-row">
              {page?.confirmedCrop ? (
                <button className="btn btn-secondary" onClick={onEditCrop}>✏️ Ajustar</button>
              ) : (
                <button className="btn btn-primary" onClick={onConfirmCrop}>✂️ Recortar</button>
              )}
              <button className="btn btn-secondary" onClick={onResetPage}>↺ Reset</button>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <label className="chk" style={{ fontSize: '0.85rem' }}>
                <input type="checkbox" checked={autoPreview} onChange={(e) => setAutoPreview(e.target.checked)} />
                Vista previa automática
              </label>
            </div>
          </div>

          {/* CANVAS AREA */}
          <div
            className={`ms-canvas-area ${mode === 'preview' ? 'mode-preview' : ''}`}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
          >
            <div className={`ms-canvas-wrapper ${mode === 'edit' ? 'mode-edit' : 'mode-preview'}`}>
              <canvas ref={canvasRef} />

              {/* Overlay SVG para recorte */}
              {page && showOverlay && cropToDraw && mode === "edit" && (
                <svg
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox={`0 0 ${page.w} ${page.h}`}
                  preserveAspectRatio="none"
                >
                  <polygon
                    className="ms-poly"
                    points={cropToDraw.map((p) => `${p.x},${p.y}`).join(" ")}
                    style={{ pointerEvents: 'auto' }}
                  />
                  {cropToDraw.map((p, i) => (
                    <g key={i} style={{ pointerEvents: 'auto' }}>
                      {/* Hitbox invisible grande */}
                      <circle className="ms-handle-hitbox" cx={p.x} cy={p.y} r={20} />
                      {/* Visual handle */}
                      <circle className="ms-handle" cx={p.x} cy={p.y} r={8} />
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="ms-footer">
          <div className="ms-nav-controls">
            <button className="ms-nav-btn" onClick={() => go(-1)} disabled={idx === 0}>◀</button>
            <span className="ms-page-info">Página {idx + 1} de {pages.length || 1}</span>
            <button className="ms-nav-btn" onClick={() => go(1)} disabled={idx >= pages.length - 1}>▶</button>

            <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 0.5rem' }}></div>

            <button
              className="ms-nav-btn"
              onClick={onDeletePage}
              disabled={pages.length === 0}
              title="Eliminar esta foto"
              style={{ color: '#ef4444' }}
            >
              🗑️
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>N° Pág:</span>
              <input
                type="number"
                className="input"
                style={{ width: '60px', padding: '0.25rem' }}
                value={page?.pageNumber ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageNumberForCurrent(val === "" ? undefined : Number(val));
                }}
                placeholder="#"
              />
            </div>

            <button className="btn btn-secondary" onClick={onExportJPG} disabled={!page}>
              Descargar JPG
            </button>
            <button className="btn btn-primary" onClick={onExportAllPDF} disabled={!pages.length}>
              Generar PDF
            </button>
            {onSaveToDocuments && (
              <button
                className="btn btn-primary"
                style={{ background: '#3b82f6', color: 'white' }}
                onClick={handleSaveToDocuments}
                disabled={pages.length === 0}
              >
                Guardar en Documentos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
