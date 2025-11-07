/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// Detectamos OpenCV en tiempo de ejecución (sin import tipado)
declare const cv: any | undefined;

type Quad = [
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number }
];

type BasePayload = {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array | ArrayLike<number>;
};
type WithQuad = BasePayload & { quad: Quad };

type WorkerOk<T = any> = { __for: string; ok: true; payload: T };
type WorkerErr = { __for: string; ok: false; error: string };

function reply<T = any>(id: string, ok: boolean, payloadOrErr: T | string): void {
  const msg: WorkerOk<T> | WorkerErr = ok
    ? ({ __for: id, ok: true, payload: payloadOrErr as T } as WorkerOk<T>)
    : ({ __for: id, ok: false, error: String(payloadOrErr) } as WorkerErr);
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}

/** Crea SIEMPRE un Uint8ClampedArray respaldado por un ArrayBuffer "normal" */
function toPlainClamped(src: BasePayload["data"]): Uint8ClampedArray {
  let tmp: Uint8ClampedArray;
  if (src instanceof Uint8ClampedArray) {
    tmp = src;
  } else if (src instanceof Uint8Array) {
    tmp = new Uint8ClampedArray(src.length);
    tmp.set(src);
  } else {
    const len = (src as ArrayLike<number>).length as number;
    tmp = new Uint8ClampedArray(len);
    for (let i = 0; i < len; i++) tmp[i] = (src as ArrayLike<number>)[i] as number;
  }
  // Ahora forzamos un ArrayBuffer "nuevo" (no compartido)
  const buf = new ArrayBuffer(tmp.byteLength);
  const view = new Uint8ClampedArray(buf);
  view.set(tmp);
  return view;
}

/** Construcción de ImageData que satisface la sobrecarga de TS */
function makeImageData(arr: Uint8ClampedArray, w: number, h: number): ImageData {
  // En algunos d.ts, TS confunde el tipo del buffer → usamos any para la sobrecarga correcta
  const Ctor: any = (self as any).ImageData || ImageData;
  return new Ctor(arr as unknown as Uint8ClampedArray, w, h) as ImageData;
}

function imageDataFromPayload(p: BasePayload): ImageData {
  const arr = toPlainClamped(p.data);
  return makeImageData(arr, p.width, p.height);
}

async function canvasFromImageData(id: ImageData): Promise<OffscreenCanvas> {
  const c = new OffscreenCanvas(id.width, id.height);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.putImageData(id, 0, 0);
  return c;
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

async function toPNG(id: ImageData): Promise<{ mime: string; bytes: Uint8Array }> {
  const c = await canvasFromImageData(id);
  const b = await c.convertToBlob({ type: "image/png" });
  return { mime: "image/png", bytes: await blobToBytes(b) };
}

/* --------------------- Filtros JS (sin OpenCV) --------------------- */

function enhanceJS(
  id: ImageData,
  opts?: { deshadow?: number; contrast?: number; binarize?: number }
): ImageData {
  const deshadow = Math.max(1, Math.min(10, Math.round(opts?.deshadow ?? 5)));
  const contrast = Math.max(1, Math.min(10, Math.round(opts?.contrast ?? 6)));
  const binarize = Math.max(0, Math.min(10, Math.round(opts?.binarize ?? 0)));

  const data = new Uint8ClampedArray(id.data); // copia

  // 1) a gris
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const y = r * 0.299 + g * 0.587 + b * 0.114;
    data[i] = data[i + 1] = data[i + 2] = y;
  }

  // 2) "top-hat" simple via blur-resta
  const k = Math.max(1, Math.min(25, Math.round(deshadow * 2 + 1)));
  const blurred = boxBlurGray(data, id.width, id.height, k);
  for (let i = 0; i < data.length; i += 4) {
    let v = data[i] - (blurred[i] - 128);
    data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, v));
  }

  // 3) contraste lineal
  const cFactor = contrast / 5; // ~0.2..2
  for (let i = 0; i < data.length; i += 4) {
    let v = data[i];
    v = (v - 128) * cFactor + 128;
    data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, v));
  }

  // 4) binarización opcional
  if (binarize > 0) {
    const t = 220 - Math.min(10, binarize) * 15;
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i] >= t ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }

  return makeImageData(data, id.width, id.height);
}

function boxBlurGray(src: Uint8ClampedArray, w: number, h: number, r: number): Uint8ClampedArray {
  const dst = new Uint8ClampedArray(src.length);
  const tmp = new Float32Array(w * h);
  const div = r;

  // horizontal
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      sum += src[i];
      if (x >= div) sum -= src[(y * w + (x - div)) * 4];
      const x2 = x - div + 1;
      if (x2 >= 0) tmp[y * w + x2] = sum / Math.min(div, x + 1);
    }
  }

  // vertical
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = 0; y < h; y++) {
      sum += tmp[y * w + x];
      if (y >= div) sum -= tmp[(y - div) * w + x];
      const y2 = y - div + 1;
      if (y2 >= 0) {
        const v = sum / Math.min(div, y + 1);
        const i = (y2 * w + x) * 4;
        const g = Math.max(0, Math.min(255, v | 0));
        dst[i] = dst[i + 1] = dst[i + 2] = g;
        dst[i + 3] = 255;
      }
    }
  }
  return dst;
}

// Recorte por bounding box del quad (fallback sin homografía)
function cropBBox(id: ImageData, quad: Quad): ImageData {
  const xs = quad.map((p) => p.x);
  const ys = quad.map((p) => p.y);
  const minX = Math.max(0, Math.min(...xs) | 0);
  const minY = Math.max(0, Math.min(...ys) | 0);
  const maxX = Math.min(id.width, Math.max(...xs) | 0);
  const maxY = Math.min(id.height, Math.max(...ys) | 0);
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);

  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext("2d")!;
  const src = new OffscreenCanvas(id.width, id.height);
  src.getContext("2d")!.putImageData(id, 0, 0);
  ctx.drawImage(src, minX, minY, w, h, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/* --------------------- OpenCV opcional --------------------- */

const hasCV: boolean = typeof cv !== "undefined" && !!cv && typeof (cv as any).Mat === "function";

function idToMatGray(id: ImageData): any {
  const mat = (cv as any).matFromImageData(id);
  const gray = new (cv as any).Mat();
  (cv as any).cvtColor(mat, gray, (cv as any).COLOR_RGBA2GRAY);
  mat.delete();
  return gray;
}

async function matToPNGBytes(mat: any): Promise<{ mime: string; bytes: Uint8Array }> {
  const rgba = new (cv as any).Mat();
  (cv as any).cvtColor(mat, rgba, (cv as any).COLOR_GRAY2RGBA);
  const imageData = makeImageData(new Uint8ClampedArray(rgba.data), rgba.cols, rgba.rows);
  rgba.delete();
  const c = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = c.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  const blob = await c.convertToBlob({ type: "image/png" });
  return { mime: "image/png", bytes: await blobToBytes(blob) };
}

/* --------------------- Mensajería --------------------- */

(self as unknown as DedicatedWorkerGlobalScope).onmessage = async (e: MessageEvent) => {
  const { __id, op, payload } = (e.data || {}) as { __id?: string; op?: string; payload?: any };
  if (!__id) return;

  try {
    if (op === "ping") {
      reply(__id, true, { cvReady: hasCV });
      return;
    }

    if (op === "enhance") {
      const id = imageDataFromPayload(payload as BasePayload);
      const out = enhanceJS(id, payload);
      const res = await toPNG(out);
      reply(__id, true, res);
      return;
    }

    if (op === "cropBBox") {
      const p = payload as WithQuad;
      const id = imageDataFromPayload(p);
      if (!p.quad) throw new Error("Quad requerido");
      const out = cropBBox(id, p.quad);
      const res = await toPNG(out);
      reply(__id, true, res);
      return;
    }

    if (!hasCV) throw new Error("Operación no soportada sin OpenCV");

    if (op === "autoDetect") {
      const id = imageDataFromPayload(payload as BasePayload);
      const gray = idToMatGray(id);
      const blurred = new (cv as any).Mat();
      (cv as any).GaussianBlur(gray, blurred, new (cv as any).Size(5, 5), 0);
      const edges = new (cv as any).Mat();
      (cv as any).Canny(blurred, edges, 75, 200);
      const contours = new (cv as any).MatVector();
      const hierarchy = new (cv as any).Mat();
      (cv as any).findContours(edges, contours, hierarchy, (cv as any).RETR_LIST, (cv as any).CHAIN_APPROX_SIMPLE);

      let best: any = null;
      let bestArea = 0;
      for (let i = 0; i < contours.size(); i++) {
        const c0 = contours.get(i);
        const peri = (cv as any).arcLength(c0, true);
        const approx = new (cv as any).Mat();
        (cv as any).approxPolyDP(c0, approx, 0.02 * peri, true);
        if (approx.rows === 4) {
          const area = (cv as any).contourArea(approx);
          if (area > bestArea) {
            if (best) best.delete();
            bestArea = area;
            best = approx;
          } else {
            approx.delete();
          }
        } else {
          approx.delete();
        }
        c0.delete();
      }

      let quad: Quad | null = null;
      if (best) {
        quad = [
          { x: best.intAt(0, 0), y: best.intAt(0, 1) },
          { x: best.intAt(1, 0), y: best.intAt(1, 1) },
          { x: best.intAt(2, 0), y: best.intAt(2, 1) },
          { x: best.intAt(3, 0), y: best.intAt(3, 1) },
        ];
        best.delete();
      }
      gray.delete(); blurred.delete(); edges.delete(); contours.delete(); hierarchy.delete();
      reply(__id, true, { quad });
      return;
    }

    if (op === "warp") {
      const p = payload as WithQuad;
      const id = imageDataFromPayload(p);
      if (!p.quad) throw new Error("Quad requerido");

      const src = (cv as any).matFromImageData(id);
      const pts = [...p.quad] as Quad;

      // ordenar TL, TR, BR, BL
      pts.sort((a, b) => a.y - b.y);
      const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
      const bottom = pts.slice(2, 4).sort((a, b) => a.x - b.x);
      const ordered = [top[0], top[1], bottom[1], bottom[0]];

      const w = Math.hypot(ordered[1].x - ordered[0].x, ordered[1].y - ordered[0].y) | 0;
      const w2 = Math.hypot(ordered[2].x - ordered[3].x, ordered[2].y - ordered[3].y) | 0;
      const h = Math.hypot(ordered[3].x - ordered[0].x, ordered[3].y - ordered[0].y) | 0;
      const h2 = Math.hypot(ordered[2].x - ordered[1].x, ordered[2].y - ordered[1].y) | 0;
      const W = Math.max(w, w2, 1), H = Math.max(h, h2, 1);

      const srcTri = (cv as any).matFromArray(4, 1, (cv as any).CV_32FC2, ordered.flatMap((p0) => [p0.x, p0.y]));
      const dstTri = (cv as any).matFromArray(4, 1, (cv as any).CV_32FC2, [0, 0, W, 0, W, H, 0, H]);
      const M = (cv as any).getPerspectiveTransform(srcTri, dstTri);
      const dst = new (cv as any).Mat();
      (cv as any).warpPerspective(
        src,
        dst,
        M,
        new (cv as any).Size(W, H),
        (cv as any).INTER_LINEAR,
        (cv as any).BORDER_CONSTANT,
        new (cv as any).Scalar()
      );
      const out = await matToPNGBytes(dst);
      src.delete(); dst.delete(); srcTri.delete(); dstTri.delete(); M.delete();
      reply(__id, true, out);
      return;
    }

    if (op === "opencvPipeline") {
      const p = payload as BasePayload & {
        gaussian?: number; tophat?: number; median?: number;
        claheClip?: number; claheTile?: number; bilateral?: number; binarize?: number;
      };
      const id = imageDataFromPayload(p);
      const {
        gaussian = 3, tophat = 5, median = 3, claheClip = 3, claheTile = 8,
        bilateral = 0, binarize = 0
      } = p;

      let gray = idToMatGray(id);
      if (gaussian > 0) (cv as any).GaussianBlur(gray, gray, new (cv as any).Size(gaussian | 1, gaussian | 1), 0, 0, (cv as any).BORDER_DEFAULT);

      if (tophat > 0) {
        const kernel = (cv as any).getStructuringElement((cv as any).MORPH_RECT, new (cv as any).Size((tophat | 1), (tophat | 1)));
        const morph = new (cv as any).Mat();
        (cv as any).morphologyEx(gray, morph, (cv as any).MORPH_BLACKHAT, kernel);
        (cv as any).add(gray, morph, gray);
        kernel.delete(); morph.delete();
      }

      if (median > 0) (cv as any).medianBlur(gray, gray, median | 1);

      if (claheClip > 0) {
        const clahe = new (cv as any).CLAHE(claheClip, new (cv as any).Size(claheTile, claheTile));
        clahe.apply(gray, gray); clahe.delete();
      }

      if (bilateral > 0) {
        const dst = new (cv as any).Mat();
        (cv as any).bilateralFilter(gray, dst, 5 + bilateral * 2, 75, 75);
        gray.delete(); gray = dst;
      }

      if (binarize > 0) {
        const dst = new (cv as any).Mat();
        (cv as any).adaptiveThreshold(gray, dst, 255, (cv as any).ADAPTIVE_THRESH_MEAN_C, (cv as any).THRESH_BINARY, 15, 10);
        gray.delete(); gray = dst;
      }

      const out = await matToPNGBytes(gray);
      gray.delete();
      reply(__id, true, out);
      return;
    }

    throw new Error("Operación no soportada");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    reply(__id, false, msg);
  }
};
