// apps/web/src/scanner/lib/pdf.ts
// Exporta siempre en A4. Acepta Blob | ArrayBuffer | Uint8Array | {bytes; mime?}
// Requiere: pdf-lib  →  npm i pdf-lib
import { PDFDocument } from "pdf-lib";

/** Tamaño A4 en puntos (72 dpi) */
const A4 = { width: 595.28, height: 841.89 } as const;

export type ImageInput =
  | Blob
  | ArrayBuffer
  | Uint8Array
  | { bytes: Blob | ArrayBuffer | Uint8Array; mime?: string };

/* ================= Helpers de memoria seguros ================= */
/** Copia un Uint8Array a un ArrayBuffer *plano* (no SharedArrayBuffer). */
function toPlainArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}

/** Obtiene un Uint8Array desde Blob/ArrayBuffer/Uint8Array y lo copia a buffer propio. */
async function getSafeUint8(input: Blob | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  if (input instanceof Uint8Array) {
    // Clonamos para garantizar que su .buffer sea un ArrayBuffer normal
    const cloned = new Uint8Array(input.byteLength);
    cloned.set(input);
    return cloned;
  }
  if (input instanceof Blob) {
    const ab = await input.arrayBuffer();
    const u8 = new Uint8Array(ab);
    const cloned = new Uint8Array(u8.byteLength);
    cloned.set(u8);
    return cloned;
  }
  // ArrayBuffer (o ArrayBufferLike): clonamos
  const u8 = new Uint8Array(input);
  const cloned = new Uint8Array(u8.byteLength);
  cloned.set(u8);
  return cloned;
}

/* ================ Utilidades de imagen ================= */
function sniffImageType(u8: Uint8Array): "jpg" | "png" {
  // JPEG = ff d8 ff
  if (u8.length > 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) return "jpg";
  // PNG = 89 50 4e 47 0d 0a 1a 0a
  if (
    u8.length > 8 &&
    u8[0] === 0x89 &&
    u8[1] === 0x50 &&
    u8[2] === 0x4e &&
    u8[3] === 0x47 &&
    u8[4] === 0x0d &&
    u8[5] === 0x0a &&
    u8[6] === 0x1a &&
    u8[7] === 0x0a
  ) {
    return "png";
  }
  return "jpg";
}

async function normalizeToBytes(
  item: ImageInput,
  fallbackMime = "image/jpeg"
): Promise<{ u8: Uint8Array; mime: string }> {
  if (item instanceof Blob) {
    const u8 = await getSafeUint8(item);
    return { u8, mime: item.type || fallbackMime };
  }
  if (item instanceof Uint8Array) {
    const u8 = await getSafeUint8(item);
    return { u8, mime: fallbackMime };
  }
  if (item instanceof ArrayBuffer) {
    const u8 = await getSafeUint8(item);
    return { u8, mime: fallbackMime };
  }
  if (item && typeof item === "object" && "bytes" in item) {
    const inner = (item as { bytes: Blob | ArrayBuffer | Uint8Array; mime?: string }).bytes;
    const mime = (item as { mime?: string }).mime || fallbackMime;
    const u8 = await getSafeUint8(inner);
    return { u8, mime };
  }
  throw new Error("Formato de imagen no soportado para PDF.");
}

/* ================ Generación de PDF ================= */
export async function createPDFfromJPGs(
  images: ImageInput[],
  opts?: { marginPt?: number; a4?: boolean }
): Promise<Blob> {
  const margin = Math.max(0, opts?.marginPt ?? 24);
  const pdf = await PDFDocument.create();

  for (const item of images) {
    const { u8 } = await normalizeToBytes(item);
    const kind = sniffImageType(u8);
    const img = kind === "png" ? await pdf.embedPng(u8) : await pdf.embedJpg(u8);

    // Página A4
    const page = pdf.addPage([A4.width, A4.height]);

    // Área útil
    const maxW = A4.width - margin * 2;
    const maxH = A4.height - margin * 2;

    // Escalar manteniendo aspecto
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (A4.width - drawW) / 2;
    const y = (A4.height - drawH) / 2;

    page.drawImage(img, { x, y, width: drawW, height: drawH });
  }

  // pdf.save() → Uint8Array. Lo copiamos a ArrayBuffer plano antes del Blob.
  const pdfBytes = await pdf.save(); // Uint8Array
  const plainAb = toPlainArrayBuffer(pdfBytes);
  return new Blob([plainAb], { type: "application/pdf" });
}

/** Descarga cómoda */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
