import { Router } from "express";
import { readJSON, writeJSON, matchCliente as match } from "../utils/jsonStore.js";

const router = Router();

/**
 * Modelo de Propiedad:
 * {
 *   "id": "P-0001",
 *   "tipo": "Departamento",          // Casa, PH, Lote, Local, etc.
 *   "direccion": "Av. Alsina 770",
 *   "localidad": "Lomas de Zamora",
 *   "ambientes": 3,                  // número
 *   "precioUSD": 120000              // número
 * }
 */

// GET /api/propiedades  (?q=&page=&limit=)
router.get("/", async (req, res) => {
  const { q = "", page = "1", limit = "1000" } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const all = await readJSON("propiedades.json");
  const filtered = all.filter((prop) => {
    if (!q) return true;
    const hay = (s) => String(s || "").toLowerCase().includes(String(q).toLowerCase());
    return (
      hay(prop.id) ||
      hay(prop.tipo) ||
      hay(prop.direccion) ||
      hay(prop.localidad) ||
      hay(prop.ambientes) ||
      hay(prop.precioUSD)
    );
  });

  const start = (p - 1) * l;
  const data = filtered.slice(start, start + l);

  res.json({ ok: true, total: filtered.length, page: p, limit: l, data });
});

// GET /api/propiedades/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const all = await readJSON("propiedades.json");
  const item = all.find((x) => String(x.id) === String(id));
  if (!item) return res.status(404).json({ ok: false, error: "Propiedad no encontrada" });
  res.json({ ok: true, data: item });
});

// POST /api/propiedades
router.post("/", async (req, res) => {
  let { id, tipo, direccion, localidad, ambientes, precioUSD } = req.body || {};
  if (!id || !tipo || !direccion) {
    return res.status(400).json({ ok: false, error: "id, tipo y direccion son obligatorios" });
  }

  const all = await readJSON("propiedades.json");
  const exists = all.some((x) => String(x.id) === String(id));
  if (exists) return res.status(409).json({ ok: false, error: "Ya existe una propiedad con ese id" });

  const nuevo = {
    id: String(id),
    tipo: String(tipo),
    direccion: String(direccion),
    localidad: String(localidad || ""),
    ambientes: Number(ambientes ?? 0) || 0,
    precioUSD: Number(precioUSD ?? 0) || 0
  };

  all.push(nuevo);
  await writeJSON(all, "propiedades.json");
  res.status(201).json({ ok: true, data: nuevo });
});

// PATCH /api/propiedades/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { tipo, direccion, localidad, ambientes, precioUSD } = req.body || {};

  const all = await readJSON("propiedades.json");
  const idx = all.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Propiedad no encontrada" });

  all[idx] = {
    ...all[idx],
    ...(tipo !== undefined ? { tipo: String(tipo) } : {}),
    ...(direccion !== undefined ? { direccion: String(direccion) } : {}),
    ...(localidad !== undefined ? { localidad: String(localidad) } : {}),
    ...(ambientes !== undefined ? { ambientes: Number(ambientes) || 0 } : {}),
    ...(precioUSD !== undefined ? { precioUSD: Number(precioUSD) || 0 } : {})
  };

  await writeJSON(all, "propiedades.json");
  res.json({ ok: true, data: all[idx] });
});

// DELETE /api/propiedades/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const all = await readJSON("propiedades.json");
  const idx = all.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Propiedad no encontrada" });

  const eliminado = all.splice(idx, 1)[0];
  await writeJSON(all, "propiedades.json");
  res.json({ ok: true, data: eliminado });
});

export default router;
