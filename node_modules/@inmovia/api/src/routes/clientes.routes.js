import { Router } from "express";
import { readJSON, writeJSON, matchCliente } from "../utils/jsonStore.js";

const router = Router();

/**
 * Modelo:
 * {
 *   "dni": "12345678",
 *   "nombre": "Juan",
 *   "apellido": "Pérez",
 *   "telefono": "11-1234-5678",
 *   "email": "juan@example.com"
 * }
 */

// GET /api/clientes  (lista + búsqueda ?q= + paginación ?page=&limit=)
router.get("/", async (req, res) => {
  const { q = "", page = "1", limit = "1000" } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const all = await readJSON();
  const filtered = all.filter((c) => matchCliente(c, q));
  const start = (p - 1) * l;
  const data = filtered.slice(start, start + l);

  res.json({
    ok: true,
    total: filtered.length,
    page: p,
    limit: l,
    data
  });
});

// GET /api/clientes/:dni
router.get("/:dni", async (req, res) => {
  const { dni } = req.params;
  const clientes = await readJSON();
  const cliente = clientes.find((c) => String(c.dni) === String(dni));
  if (!cliente) return res.status(404).json({ ok: false, error: "Cliente no encontrado" });
  res.json({ ok: true, data: cliente });
});

// POST /api/clientes  (crear)
router.post("/", async (req, res) => {
  const { dni, nombre, apellido, telefono, email } = req.body || {};
  if (!dni || !nombre) {
    return res.status(400).json({ ok: false, error: "dni y nombre son obligatorios" });
  }
  const clientes = await readJSON();
  const existe = clientes.some((c) => String(c.dni) === String(dni));
  if (existe) {
    return res.status(409).json({ ok: false, error: "Ya existe un cliente con ese DNI" });
  }
  const nuevo = {
    dni: String(dni),
    nombre: String(nombre),
    apellido: String(apellido || ""),
    telefono: String(telefono || ""),
    email: String(email || "")
  };
  clientes.push(nuevo);
  await writeJSON(clientes);
  res.status(201).json({ ok: true, data: nuevo });
});

// PATCH /api/clientes/:dni  (actualización parcial)
router.patch("/:dni", async (req, res) => {
  const { dni } = req.params;
  const { nombre, apellido, telefono, email } = req.body || {};
  const clientes = await readJSON();
  const idx = clientes.findIndex((c) => String(c.dni) === String(dni));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Cliente no encontrado" });

  clientes[idx] = {
    ...clientes[idx],
    ...(nombre !== undefined ? { nombre: String(nombre) } : {}),
    ...(apellido !== undefined ? { apellido: String(apellido) } : {}),
    ...(telefono !== undefined ? { telefono: String(telefono) } : {}),
    ...(email !== undefined ? { email: String(email) } : {})
  };

  await writeJSON(clientes);
  res.json({ ok: true, data: clientes[idx] });
});

// PUT /api/clientes/:dni  (reemplazo total salvo dni)
router.put("/:dni", async (req, res) => {
  const { dni } = req.params;
  const { nombre, apellido, telefono, email } = req.body || {};
  if (!nombre) return res.status(400).json({ ok: false, error: "nombre es obligatorio" });

  const clientes = await readJSON();
  const idx = clientes.findIndex((c) => String(c.dni) === String(dni));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Cliente no encontrado" });

  clientes[idx] = {
    dni: String(dni),
    nombre: String(nombre),
    apellido: String(apellido || ""),
    telefono: String(telefono || ""),
    email: String(email || "")
  };

  await writeJSON(clientes);
  res.json({ ok: true, data: clientes[idx] });
});

// DELETE /api/clientes/:dni
router.delete("/:dni", async (req, res) => {
  const { dni } = req.params;
  const clientes = await readJSON();
  const idx = clientes.findIndex((c) => String(c.dni) === String(dni));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Cliente no encontrado" });

  const eliminado = clientes.splice(idx, 1)[0];
  await writeJSON(clientes);
  res.json({ ok: true, data: eliminado });
});

export default router;
