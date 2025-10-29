import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fse from 'fs-extra';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// ===== Paths de almacenamiento =====
const __filename = fileURLToPath(import.meta.url); 
const STORAGE_ROOT = process.env.STORAGE_ROOT || path.resolve(__dirname, '../../storage/portadas');
const __dirname = path.dirname(__filename);

const MODELOS_DIR  = path.join(STORAGE_ROOT, 'modelos');
const SALIDAS_DIR  = path.join(STORAGE_ROOT, 'salidas');
const MODELOS_JSON = path.join(STORAGE_ROOT, 'modelos.json');


fse.ensureDirSync(MODELOS_DIR);
fse.ensureDirSync(SALIDAS_DIR);
if (!fs.existsSync(MODELOS_JSON)) fs.writeFileSync(MODELOS_JSON, JSON.stringify([], null, 2), 'utf-8');

// Estático para ver/descargar
app.use('/storage', express.static(STORAGE_ROOT));

// ===== Utils =====
const readModelos = () => {
  try { return JSON.parse(fs.readFileSync(MODELOS_JSON, 'utf-8')); }
  catch { return []; }
};
const writeModelos = (arr) => fs.writeFileSync(MODELOS_JSON, JSON.stringify(arr, null, 2), 'utf-8');

const slugify = (s) =>
  (s || '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48);

// Multer imágenes (Owner sube modelo)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, MODELOS_DIR),
  filename:    (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${Date.now()}-${slugify(file.originalname)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

// ===== Helpers de imagen / OCR =====
const sizeFor = (formato) => {
  if (formato === 'portrait')  return { W: 1080, H: 1350 };
  if (formato === 'landscape') return { W: 1920, H: 1080 };
  return { W: 1080, H: 1080 }; // square
};

const rectFromAny = (obj) => {
  if (!obj) return null;
  if (obj.bbox) { // tesseract
    const { x0, y0, x1, y1 } = obj.bbox;
    return { left: x0, top: y0, width: Math.max(1, x1 - x0), height: Math.max(1, y1 - y0) };
  }
  if (obj.x !== undefined && obj.y !== undefined && obj.w !== undefined && obj.h !== undefined) {
    return { left: obj.x, top: obj.y, width: obj.w, height: obj.h };
  }
  return null;
};

const inflate = (r, margin, W, H) => {
  const left   = Math.max(0, Math.round(r.left - margin));
  const top    = Math.max(0, Math.round(r.top - margin));
  const right  = Math.min(W, Math.round(r.left + r.width + margin));
  const bottom = Math.min(H, Math.round(r.top + r.height + margin));
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
};

const area = (r) => r ? r.width * r.height : 0;

const iou = (a, b) => {
  const x1 = Math.max(a.left, b.left);
  const y1 = Math.max(a.top,  b.top);
  const x2 = Math.min(a.left + a.width,  b.left + b.width);
  const y2 = Math.min(a.top  + a.height, b.top  + b.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const uni = area(a) + area(b) - inter;
  return uni <= 0 ? 0 : inter / uni;
};

const classifyLine = (txt) => {
  const t = String(txt || '').toLowerCase();
  if (/[u\$s]|usd|u\$s|\$\s*\d|us?\$/.test(t)) return 'precio';
  if (/\bamb(ient|\.|es)?\b|\b\d+\s*amb/.test(t)) return 'ambientes';
  if (/\b(m2|m²|metros|mts|mtrs)\b/.test(t)) return 'superficie';
  // dirección: letras+números en una misma línea
  if (/[a-záéíóúñ].*\d|\d+.*[a-záéíóúñ]/.test(t)) return 'direccion';
  return null;
};

async function ocrAnalyze(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'spa+eng');
  const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
  const lines  = Array.isArray(data?.lines)  ? data.lines  : [];
  const words  = Array.isArray(data?.words)  ? data.words  : [];

  // Campos de texto por heurística
  const bucket = { precio: [], ambientes: [], superficie: [], direccion: [] };
  for (const ln of lines) {
    const kind = classifyLine(ln.text);
    if (!kind) continue;
    const r = rectFromAny(ln);
    if (!r) continue;
    bucket[kind].push({ rect: r, text: ln.text });
  }

  // Elegir una por campo (la más alta/alta+grande)
  const pickBest = (arr) => arr.slice().sort((a, b) => (b.rect.height * b.rect.width) - (a.rect.height * a.rect.width))[0];
  const layout = {};
  if (bucket.precio.length)     layout.precio     = pickBest(bucket.precio);
  if (bucket.ambientes.length)  layout.ambientes  = pickBest(bucket.ambientes);
  if (bucket.superficie.length) layout.superficie = pickBest(bucket.superficie);
  if (bucket.direccion.length)  layout.direccion  = bucket.direccion.slice().sort((a,b)=> a.rect.top - b.rect.top)[0];

  // Detectar zonas de imagen: usar BLOQUES con muy baja cobertura de texto
  // 1) mapear palabras a rect
  const wordRects = words.map(w => rectFromAny(w)).filter(Boolean);

  // 2) score de cobertura por bloque
  const imgBlocks = [];
  for (const b of blocks) {
    const br = rectFromAny(b);
    if (!br) continue;
    const A = area(br);
    if (A < 0.06 * (data.image?.width ?? 1) * (data.image?.height ?? 1)) continue; // ignorar bloques muy chicos
    const insideTextArea = wordRects
      .filter(wr => iou(br, wr) > 0.35)
      .map(area)
      .reduce((s, v) => s + v, 0);
    const coverage = insideTextArea / A; // proporción del área ocupada por texto
    if (coverage < 0.06) imgBlocks.push({ rect: br, coverage, A });
  }

  // 3) filtrar overlaps grandes y ordenar por área (slots de fotos)
  const slots = [];
  imgBlocks
    .sort((a, b) => b.A - a.A)
    .forEach(cand => {
      if (slots.every(s => iou(s.rect, cand.rect) < 0.25)) slots.push(cand);
    });

  return { layout, slots: slots.map(s => s.rect), imageW: data.image?.width ?? null, imageH: data.image?.height ?? null };
}

function svgTextAt({ W, H, rect, text, weight = 800, color = '#ffffff', shadow = true }) {
  const fs = Math.max(14, Math.floor(rect.height * 0.80));
  const x  = rect.left + Math.round(rect.width * 0.04);
  const y  = rect.top  + Math.round(rect.height * 0.82);
  const filter = shadow ? `
    <filter id="sh" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.55"/>
    </filter>` : '';
  const shadowAttr = shadow ? 'filter="url(#sh)"' : '';
  return Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <style>.t{font:${weight} ${fs}px 'Segoe UI', Roboto, Arial; fill:${color};}</style>
      ${filter}
      <text class="t" x="${x}" y="${y}" ${shadowAttr}>${String(text ?? '')}</text>
    </svg>
  `);
}

async function blurPatch(baseBuffer, rect) {
  const patch = await sharp(baseBuffer).extract(rect).blur(10).toBuffer();
  return { input: patch, left: rect.left, top: rect.top };
}

async function fetchImageBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No se pudo descargar imagen: ${url} (HTTP ${r.status})`);
  return Buffer.from(await r.arrayBuffer());
}

// ===== Rutas =====
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'Inmovia API',
    endpoints: [
      'GET  /api/ping',
      'GET  /api/portadas/modelos',
      'POST /api/portadas/modelos/upload (multipart: archivo, nombre, descripcion?)',
      'DELETE /api/portadas/modelos/:id',
      'POST /api/portadas/preview',
      'POST /api/portadas/instanciar'
    ]
  });
});

app.get('/api/ping', (_req, res) => res.status(200).json({ ok: true, ts: new Date().toISOString() }));

app.get('/api/portadas/modelos', (_req, res) => res.status(200).json({ ok: true, modelos: readModelos() }));

app.post('/api/portadas/modelos/upload', upload.single('archivo'), (req, res) => {
  try {
    const { nombre = '', descripcion = '' } = req.body || {};
    if (!req.file) return res.status(400).json({ ok: false, error: 'Falta archivo' });
    if (!nombre)   return res.status(400).json({ ok: false, error: 'Falta nombre del modelo' });

    const modelos = readModelos();
    const base = slugify(nombre) || 'modelo';
    let id = base, c = 0;
    while (modelos.find(m => m.id === id) && c < 50) id = `${base}-${(++c).toString().padStart(2, '0')}`;

    const filename = req.file.filename;
    const url = `/storage/modelos/${filename}`;
    const nuevo = { id, nombre, descripcion, filename, url, createdAt: new Date().toISOString() };
    modelos.push(nuevo);
    writeModelos(modelos);
    res.status(201).json({ ok: true, modelo: nuevo });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.delete('/api/portadas/modelos/:id', (req, res) => {
  const { id } = req.params;
  const modelos = readModelos();
  const idx = modelos.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Modelo no encontrado' });

  const removed = modelos.splice(idx, 1)[0];
  writeModelos(modelos);
  const fp = path.join(MODELOS_DIR, removed.filename || '');
  if (removed.filename && fs.existsSync(fp)) { try { fs.unlinkSync(fp); } catch {} }
  res.status(200).json({ ok: true, removed });
});

// Preview simple (se mantiene por compatibilidad)
app.post('/api/portadas/preview', (req, res) => {
  const { direccion, precio, ambientes, superficie, imagen, modelo } = req.body || {};
  if (!direccion || !precio) return res.status(400).json({ ok: false, error: 'Faltan direccion y precio' });

  const modelos = readModelos();
  const modeloValido = modelos.find(m => m.id === modelo)?.id || 'clasico';
  const normalize = (u) => (typeof u === 'string' && (u.startsWith('http') || u.startsWith('/'))) ? u.trim() : null;

  res.status(200).json({
    ok: true,
    preview: {
      modelo: modeloValido,
      titulo: `Propiedad en ${direccion}`,
      precio, ambientes, superficie,
      imagenUrl: normalize(imagen),
      tieneImagen: Boolean(normalize(imagen))
    }
  });
});

// ===== IA Layout: OCR + reemplazo + fotos en slots =====
app.post('/api/portadas/instanciar', async (req, res) => {
  try {
    const {
      modeloId,
      direccion,
      precio,
      ambientes,
      superficie,
      formato = 'square',
      fotos = [],          // array de URLs http(s) o rutas /storage
      principalIndex = 0   // índice de foto principal
    } = req.body || {};

    if (!modeloId || !direccion || !precio) {
      return res.status(400).json({ ok: false, error: 'Faltan: modeloId, direccion, precio' });
    }

    const modelos = readModelos();
    const modelo = modelos.find(m => m.id === modeloId);
    if (!modelo) return res.status(404).json({ ok: false, error: 'Modelo no encontrado' });

    const srcPath = path.join(MODELOS_DIR, modelo.filename);
    if (!fs.existsSync(srcPath)) return res.status(410).json({ ok: false, error: 'Archivo de modelo no existe' });

    const { W, H } = sizeFor(formato);

    // 1) Base redimensionada
    const baseResized = await sharp(srcPath).resize(W, H, { fit: 'cover', position: 'attention' }).toBuffer();

    // 2) OCR: detectar layout (textos + bloques imagen)
    const { layout, slots, imageW, imageH } = await ocrAnalyze(baseResized);

    // 3) Preparar composiciones
    const composites = [];

    // 3.1) BLUR de zonas originales con texto
    const fields = [
      { k:'precio',     val: precio },
      { k:'direccion',  val: `Propiedad en ${direccion}` },
      { k:'ambientes',  val: ambientes ? `${ambientes} amb` : '' },
      { k:'superficie', val: superficie ? `${superficie} m²` : '' },
    ];

    for (const f of fields) {
      const hit = layout[f.k];
      if (!hit?.rect) continue;
      const R = inflate(hit.rect, 6, W, H);
      composites.push(await blurPatch(baseResized, R));
    }

    // 3.2) FOTOS en slots (principal va al más grande)
    let slotRects = slots.slice().sort((a,b)=> (b.width*b.height) - (a.width*a.height));
    // si OCR no detectó slots, intentar usar todo el lienzo como 1 slot
    if (!slotRects.length) slotRects = [{ left: 0, top: 0, width: W, height: Math.round(H*0.55) }];

    const fotosOrdered = [...fotos];
    if (fotosOrdered.length) {
      const idx = Math.max(0, Math.min(principalIndex, fotosOrdered.length - 1));
      const principal = fotosOrdered.splice(idx, 1)[0];
      fotosOrdered.unshift(principal);
    }

    for (let i = 0; i < slotRects.length; i++) {
      const rect = slotRects[i];
      const url  = fotosOrdered[i] || fotosOrdered[0]; // si faltan, repetimos principal
      if (!url) continue;
      const buf = await fetchImageBuffer(url.startsWith('/') ? `http://localhost:${process.env.PORT||3001}${url}` : url);
      const img = await sharp(buf).resize(rect.width, rect.height, { fit: 'cover', position: 'attention' }).toBuffer();
      composites.push({ input: img, left: rect.left, top: rect.top });
    }

    // 4) Componer BLUR + FOTOS
    let composed = sharp(baseResized).composite(composites);

    // 5) Superponer nuevos textos en mismas posiciones (mantener estética)
    const textSvgs = [];
    for (const f of fields) {
      const hit = layout[f.k];
      if (!hit?.rect || !f.val) continue;
      const R = inflate(hit.rect, 2, W, H);
      const color = f.k === 'precio' ? '#ffffff' : '#eaf2ff';
      textSvgs.push(svgTextAt({ W, H, rect: R, text: f.val, weight: f.k === 'precio' ? 900 : 700, color }));
    }
    if (textSvgs.length) {
      composed = composed.composite(textSvgs.map((input) => ({ input, left: 0, top: 0 })));
    }

    // 6) Guardar salida
    const outId = uuidv4();
    const outPath = path.join(SALIDAS_DIR, `${outId}.png`);
    await composed.png().toFile(outPath);

    return res.status(200).json({
      ok: true,
      url: `/storage/salidas/${path.basename(outPath)}`,
      metadata: {
        W, H,
        slots: slotRects,
        layout
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ===== Arranque =====
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
