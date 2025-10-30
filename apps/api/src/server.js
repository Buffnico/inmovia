// ESM server.js — Node 18+ con "type":"module" en package.json

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import sharp from 'sharp'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------
// __dirname en ESM
// ---------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 3001

// Storage ROOT (persistente si montás disk; en free usar /tmp)
// Local por defecto: apps/api/storage/portadas
const DEFAULT_STORAGE = path.resolve(__dirname, '../../storage/portadas')
let STORAGE_ROOT = process.env.STORAGE_ROOT || DEFAULT_STORAGE

const DIRS = { MODELOS: 'modelos', SALIDAS: 'salidas' }

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)
}

async function ensureWritable(root) {
  await fsp.mkdir(root, { recursive: true })
  await fsp.mkdir(path.join(root, DIRS.MODELOS), { recursive: true })
  await fsp.mkdir(path.join(root, DIRS.SALIDAS), { recursive: true })
  const testFile = path.join(root, '.write-test')
  await fsp.writeFile(testFile, String(Date.now()))
  await fsp.unlink(testFile)
}

async function initStorage() {
  try {
    await ensureWritable(STORAGE_ROOT)
    console.log('[storage] OK at', STORAGE_ROOT)
  } catch (e) {
    console.error('[storage] Not writable at', STORAGE_ROOT, '-', e.message)
    STORAGE_ROOT = path.join('/tmp', 'portadas')
    await ensureWritable(STORAGE_ROOT)
    console.log('[storage] Fallback to', STORAGE_ROOT)
  }
  const PORTADAS_DIRS = {
    ROOT: STORAGE_ROOT,
    MODELOS: path.join(STORAGE_ROOT, DIRS.MODELOS),
    SALIDAS: path.join(STORAGE_ROOT, DIRS.SALIDAS),
    META: path.join(STORAGE_ROOT, 'modelos.json'),
  }
  globalThis.PORTADAS_DIRS = PORTADAS_DIRS
  return PORTADAS_DIRS
}

function loadModelos() {
  try {
    const raw = fs.readFileSync(globalThis.PORTADAS_DIRS.META, 'utf8')
    const json = JSON.parse(raw)
    return Array.isArray(json) ? json : []
  } catch {
    return []
  }
}

function saveModelos(arr) {
  fs.writeFileSync(globalThis.PORTADAS_DIRS.META, JSON.stringify(arr, null, 2), 'utf8')
}

// ---------------------------------------------------------------------
// Helpers imagen / slots
// ---------------------------------------------------------------------
const FORMATS = {
  square:   { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape:{ w: 1920, h: 1080 },
}

async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ab = await res.arrayBuffer()
    return Buffer.from(ab)
  } catch (e) {
    console.warn('[fetchImageBuffer] no se pudo descargar', url, e.message)
    return null
  }
}

function clamp01(v) { return Math.min(1, Math.max(0, Number(v))) }

function validateAndNormalizeSlots(slots) {
  if (!Array.isArray(slots)) return []
  const ALLOWED_TEXT_KEYS = new Set(['direccion','precio','ambientes','superficie','custom'])
  return slots.map((s, idx) => {
    const type = (s?.type === 'image') ? 'image' : 'text'
    const x = clamp01(s?.x), y = clamp01(s?.y), w = clamp01(s?.w), h = clamp01(s?.h)
    const key = type === 'text'
      ? (ALLOWED_TEXT_KEYS.has(s?.key) ? s.key : 'custom')
      : (typeof s?.key === 'string' ? s.key : '')
    const style = {
      color: typeof s?.style?.color === 'string' ? s.style.color : '#ffffff',
      weight: Number(s?.style?.weight) || 700,
      size: Number(s?.style?.size) || 0.7, // factor sobre alto del slot
      align: ['left','center','right'].includes(s?.style?.align) ? s.style.align : 'left',
    }
    const imgIndex = Number.isInteger(s?.imgIndex) ? s.imgIndex : idx // por defecto, orden
    return { id: s?.id || `slot-${idx}`, type, key, x, y, w, h, style, imgIndex }
  })
}

function svgForTextSlots(textSlots, data, fmt) {
  const safe = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  const el = []
  for (const s of textSlots) {
    let value = ''
    if (s.key === 'direccion')   value = data.direccion || ''
    else if (s.key === 'precio') value = data.precio || ''
    else if (s.key === 'ambientes') value = data.ambientes ? `${data.ambientes} amb` : ''
    else if (s.key === 'superficie') value = data.superficie ? `${data.superficie} m²` : ''
    else value = data[s.key] || '' // 'custom' u otros

    const xPx = Math.round(s.x * fmt.w)
    const yPx = Math.round(s.y * fmt.h)
    const wPx = Math.round(s.w * fmt.w)
    const hPx = Math.round(s.h * fmt.h)
    const fontSize = Math.max(12, Math.round(hPx * (s.style?.size || 0.7)))
    let anchor = 'start'
    let xDraw = xPx + 4
    if (s.style?.align === 'center') { anchor = 'middle'; xDraw = xPx + Math.round(wPx/2) }
    if (s.style?.align === 'right')  { anchor = 'end';    xDraw = xPx + wPx - 4 }

    el.push(
      `<text x="${xDraw}" y="${yPx + Math.round(hPx*0.8)}" text-anchor="${anchor}" font-family="Inter,Segoe UI,Arial" font-size="${fontSize}" font-weight="${s.style?.weight || 700}" fill="${s.style?.color || '#fff'}">${safe(value)}</text>`
    )
  }
  const svg = `<svg width="${fmt.w}" height="${fmt.h}" viewBox="0 0 ${fmt.w} ${fmt.h}" xmlns="http://www.w3.org/2000/svg">${el.join('\n')}</svg>`
  return Buffer.from(svg)
}

// ---------------------------------------------------------------------
// App
// ---------------------------------------------------------------------
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Multer en memoria con filtro de imágenes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/png','image/jpeg','image/webp'].includes(file.mimetype)
    cb(ok ? null : new Error('Tipo de archivo no permitido'), ok)
  }
})

// Inicializar storage ANTES de montar /storage
const PORTADAS = await initStorage()

// --- Limpieza automática de archivos viejos en /tmp (GRATIS) ---
const MAX_AGE_HOURS = Number(process.env.CLEANUP_MAX_AGE_HOURS || 24)

async function cleanupOldFiles(root, hours) {
  const cutoff = Date.now() - hours * 3600 * 1000
  for (const sub of [DIRS.MODELOS, DIRS.SALIDAS]) {
    const dir = path.join(root, sub)
    try {
      const files = await fsp.readdir(dir)
      await Promise.all(files.map(async (f) => {
        try {
          const fp = path.join(dir, f)
          const st = await fsp.stat(fp)
          if (st.isFile() && st.mtimeMs < cutoff) {
            await fsp.unlink(fp)
          }
        } catch {}
      }))
    } catch {}
  }
  console.log(`[cleanup] done. root=${root} maxAge=${hours}h`)
}

// corre una vez al inicio y luego cada 30 min
await cleanupOldFiles(PORTADAS.ROOT, MAX_AGE_HOURS)
setInterval(() => cleanupOldFiles(PORTADAS.ROOT, MAX_AGE_HOURS), 30 * 60 * 1000)
// --- FIN limpieza ---

// Static de archivos generados y modelos
app.use('/storage', express.static(PORTADAS.ROOT, {
  maxAge: '365d',
  fallthrough: true,
}))

// ---------------------------------------------------------------------
// Rutas informativas raíz
// ---------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ ok:true, info:'API Inmovia', try:['/api/ping','/api/portadas/modelos'] })
})
app.get(['/api','/api/'], (req, res) => {
  res.json({ ok:true, info:'API Inmovia', try:['/api/ping','/api/portadas/modelos'] })
})

// ---------------------------------------------------------------------
// Rutas Portadas / Modelos
// ---------------------------------------------------------------------
app.get('/api/ping', (req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    storageRoot: PORTADAS.ROOT,
    cleanupMaxAgeHours: MAX_AGE_HOURS,
  })
})

app.get('/api/portadas/modelos', (req, res) => {
  const modelos = loadModelos().map(m => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion || '',
    url: m.url,
    hasSlots: Array.isArray(m.slots) && m.slots.length > 0
  }))
  res.json({ modelos })
})

app.get('/api/portadas/modelos/:id', (req, res) => {
  const modelos = loadModelos()
  const m = modelos.find(x => x.id === req.params.id)
  if (!m) return res.status(404).json({ ok:false, error:'No existe' })
  res.json({ ok:true, modelo: m })
})

app.get('/api/portadas/modelos/:id/slots', (req, res) => {
  const modelos = loadModelos()
  const m = modelos.find(x => x.id === req.params.id)
  if (!m) return res.status(404).json({ ok:false, error:'No existe' })
  res.json({ ok:true, slots: m.slots || [] })
})

app.post('/api/portadas/modelos/:id/slots', async (req, res) => {
  try {
    const input = Array.isArray(req.body?.slots) ? req.body.slots : []
    const slots = validateAndNormalizeSlots(input)
    const modelos = loadModelos()
    const idx = modelos.findIndex(x => x.id === req.params.id)
    if (idx === -1) return res.status(404).json({ ok:false, error:'No existe' })
    modelos[idx].slots = slots
    saveModelos(modelos)
    res.json({ ok:true, slots })
  } catch (e) {
    console.error('[slots save]', e)
    res.status(500).json({ ok:false, error: e.message })
  }
})

app.post('/api/portadas/modelos/upload', upload.single('archivo'), async (req, res) => {
  try {
    const file = req.file
    const { nombre = '', descripcion = '' } = req.body || {}
    if (!file) return res.status(400).json({ ok:false, error:'Falta archivo (campo "archivo")' })
    if (!nombre.trim()) return res.status(400).json({ ok:false, error:'Falta nombre' })

    const slug = slugify(nombre)
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png'
    const id  = `${slug || 'modelo'}-${Date.now()}`
    const filename = `${id}${ext}`
    const outPath  = path.join(PORTADAS.MODELOS, filename)

    await fsp.writeFile(outPath, file.buffer)
    const modelos = loadModelos()
    const record = {
      id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      url: `/storage/${DIRS.MODELOS}/${filename}`,
      file: filename,
      createdAt: Date.now(),
      slots: [] // nuevo
    }
    modelos.push(record)
    saveModelos(modelos)

    res.json({ ok:true, modelo: { id: record.id, nombre: record.nombre, descripcion: record.descripcion, url: record.url, hasSlots:false } })
  } catch (e) {
    console.error('[upload modelo] ', e)
    res.status(500).json({ ok:false, error: e.message })
  }
})

app.delete('/api/portadas/modelos/:id', async (req, res) => {
  try {
    const { id } = req.params
    let modelos = loadModelos()
    const idx = modelos.findIndex(m => m.id === id)
    if (idx === -1) return res.status(404).json({ ok:false, error:'No existe' })

    const filePath = path.join(PORTADAS.MODELOS, modelos[idx].file || '')
    if (filePath && fs.existsSync(filePath)) {
      try { await fsp.unlink(filePath) } catch {}
    }
    const removed = modelos.splice(idx, 1)[0]
    saveModelos(modelos)
    res.json({ ok:true, removed: { id: removed.id } })
  } catch (e) {
    console.error('[delete modelo] ', e)
    res.status(500).json({ ok:false, error: e.message })
  }
})

// Preview — devuelve datos para que el front renderice
app.post('/api/portadas/preview', (req, res) => {
  try {
    const { modelo='clasico', direccion='', precio='', ambientes='', superficie='', imagen='' } = req.body || {}
    const titulo = direccion || 'Propiedad'
    const preview = {
      modelo,
      titulo,
      precio,
      ambientes,
      superficie,
      imagenUrl: imagen || '',
      tieneImagen: !!imagen,
    }
    res.json({ ok:true, preview })
  } catch (e) {
    console.error('[preview] ', e)
    res.status(500).json({ ok:false, error: e.message })
  }
})

// Instanciar — usa slots si existen; si no, overlay simple
app.post('/api/portadas/instanciar', async (req, res) => {
  try {
    const { modeloId='', formato='square', direccion='', precio='', ambientes='', superficie='', fotos=[], principalIndex=0, custom={} } = req.body || {}
    const fmt = FORMATS[formato] || FORMATS.square
    const data = { direccion, precio, ambientes, superficie, ...custom }

    // base: imagen principal o color liso
    let base
    const principal = Array.isArray(fotos) && fotos.length ? fotos[Math.min(Math.max(0, parseInt(principalIndex || 0, 10)), fotos.length-1)] : null
    if (principal) {
      const buf = await fetchImageBuffer(principal)
      if (buf) base = await sharp(buf).resize(fmt.w, fmt.h, { fit:'cover' }).toBuffer()
    }
    if (!base) {
      base = await sharp({ create: { width: fmt.w, height: fmt.h, channels: 3, background: '#0f172a' } }).png().toBuffer()
    }

    // Si el modelo tiene slots, aplicarlos
    const modelos = loadModelos()
    const modelo = modelos.find(m => m.id === modeloId)
    const composites = []
    let textSlots = []

    if (modelo && Array.isArray(modelo.slots) && modelo.slots.length) {
      const slots = validateAndNormalizeSlots(modelo.slots)
      // Imagenes
      let imgCursor = 0
      for (const s of slots) {
        if (s.type === 'image') {
          const idx = Number.isInteger(s.imgIndex) ? s.imgIndex : imgCursor++
          const src = fotos[idx]
          if (!src) continue
          const buf = await fetchImageBuffer(src)
          if (!buf) continue
          const wPx = Math.round(s.w * fmt.w)
          const hPx = Math.round(s.h * fmt.h)
          const xPx = Math.round(s.x * fmt.w)
          const yPx = Math.round(s.y * fmt.h)
          const fitted = await sharp(buf).resize(wPx, hPx, { fit:'cover' }).toBuffer()
          composites.push({ input: fitted, left: xPx, top: yPx })
        } else {
          textSlots.push(s)
        }
      }
      // Textos en un único SVG overlay
      if (textSlots.length) {
        const overlay = svgForTextSlots(textSlots, data, fmt)
        composites.push({ input: overlay })
      }
    } else {
      // Modo simple (sin slots): solo un overlay básico con datos clave
      const safe = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
      const svg = Buffer.from(
        `<svg width="${fmt.w}" height="${fmt.h}" viewBox="0 0 ${fmt.w} ${fmt.h}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="${fmt.h - Math.round(fmt.h*0.22)}" width="${fmt.w}" height="${Math.round(fmt.h*0.22)}" fill="rgba(0,0,0,0.45)"/>
          <text x="32" y="${fmt.h - Math.round(fmt.h*0.22) + 60}" font-family="Inter,Segoe UI,Arial" font-size="${Math.round(fmt.h*0.05)}" font-weight="700" fill="#fff">${safe(direccion || 'Propiedad')}</text>
          <text x="32" y="${fmt.h - Math.round(fmt.h*0.22) + 110}" font-family="Inter,Segoe UI,Arial" font-size="${Math.round(fmt.h*0.04)}" font-weight="600" fill="#22d3ee">${safe(precio || '')}</text>
        </svg>`
      )
      composites.push({ input: svg })
    }

    const outName = `portada_${Date.now()}.png`
    const outPath = path.join(PORTADAS.SALIDAS, outName)

    await sharp(base).composite(composites).png().toFile(outPath)

    const url = `/storage/${DIRS.SALIDAS}/${outName}`
    res.json({ ok:true, url, formato, modeloId, usedSlots: !!(modelo && modelo.slots && modelo.slots.length) })
  } catch (e) {
    console.error('[instanciar] ', e)
    res.status(500).json({ ok:false, error: e.message })
  }
})

// ---------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`API Inmovia on http://localhost:${PORT}`)
})
