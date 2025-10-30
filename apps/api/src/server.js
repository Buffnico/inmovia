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
// Helpers imagen
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

function overlaySVG({ w, h, titulo, precio, ambientes, superficie }) {
  const safe = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  return Buffer.from(
`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/></filter>
  </defs>

  <rect x="0" y="0" width="${w}" height="${Math.round(h*0.12)}" fill="url(#g)"/>
  <text x="24" y="${Math.round(h*0.08)}" font-family="Inter,Segoe UI,Arial" font-size="${Math.round(h*0.06)}" font-weight="800" fill="#0a0a0a">INMOVIA</text>

  <rect x="24" y="${h - Math.round(h*0.26)}" rx="18" width="${w-48}" height="${Math.round(h*0.22)}" fill="rgba(0,0,0,0.45)" filter="url(#shadow)"/>
  <text x="48" y="${h - Math.round(h*0.26) + 60}" font-family="Inter,Segoe UI,Arial" font-size="${Math.round(h*0.05)}" font-weight="700" fill="#fff">${safe(titulo)}</text>
  <text x="48" y="${h - Math.round(h*0.26) + 110}" font-family="Inter,Segoe UI,Arial" font-size="${Math.round(h*0.04)}" font-weight="600" fill="#22d3ee">${safe(precio || '')}</text>

  <g font-family="Inter,Segoe UI,Arial" font-size="${Math.round(h*0.035)}" fill="#fff">
    <text x="48" y="${h - Math.round(h*0.26) + 155}">${safe(ambientes ? ambientes + ' amb' : '')}</text>
    <text x="220" y="${h - Math.round(h*0.26) + 155}">${safe(superficie ? superficie + ' m²' : '')}</text>
  </g>
</svg>`
  )
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
// Rutas
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
  }))
  res.json({ modelos })
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
      createdAt: Date.now()
    }
    modelos.push(record)
    saveModelos(modelos)

    res.json({ ok:true, modelo: { id: record.id, nombre: record.nombre, descripcion: record.descripcion, url: record.url } })
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

// Instanciar — compone foto principal + overlay SVG y guarda PNG
app.post('/api/portadas/instanciar', async (req, res) => {
  try {
    const { modeloId='', formato='square', direccion='', precio='', ambientes='', superficie='', fotos=[], principalIndex=0 } = req.body || {}
    const fmt = FORMATS[formato] || FORMATS.square
    const title = direccion || 'Propiedad'

    // base: imagen principal o color liso
    let base
    const principal = Array.isArray(fotos) && fotos.length ? fotos[Math.min(Math.max(0, parseInt(principalIndex || 0, 10)), fotos.length-1)] : null
    if (principal) {
      const buf = await fetchImageBuffer(principal)
      if (buf) {
        base = await sharp(buf).resize(fmt.w, fmt.h, { fit:'cover' }).toBuffer()
      }
    }
    if (!base) {
      base = await sharp({ create: { width: fmt.w, height: fmt.h, channels: 3, background: '#0f172a' } }).png().toBuffer()
    }

    const overlay = overlaySVG({ w: fmt.w, h: fmt.h, titulo: title, precio, ambientes, superficie })

    const outName = `portada_${Date.now()}.png`
    const outPath = path.join(PORTADAS.SALIDAS, outName)

    await sharp(base)
      .composite([{ input: overlay }])
      .png()
      .toFile(outPath)

    const url = `/storage/${DIRS.SALIDAS}/${outName}`
    res.json({ ok:true, url, formato, modeloId })
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
