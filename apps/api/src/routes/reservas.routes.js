import express from "express";
import { Router } from "express";
import { readJSON, writeJSON } from "../utils/jsonStore.js";

const router = Router();

// Aseguramos parseo dentro del router también (por si acaso)
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const notEmpty = (v) => v !== undefined && String(v).trim() !== "";
const trim = (v) => (v === undefined ? v : String(v).trim());

async function hydrate(reserva) {
  const clientes = await readJSON("clientes.json");
  const propiedades = await readJSON("propiedades.json");
  const cli = clientes.find(c => String(c.dni) === String(reserva.dniCliente));
  const prop = propiedades.find(p => String(p.id) === String(reserva.idPropiedad));
  return {
    ...reserva,
    _cliente: cli ? { dni: cli.dni, nombre: cli.nombre, apellido: cli.apellido } : null,
    _propiedad: prop ? { id: prop.id, tipo: prop.tipo, direccion: prop.direccion } : null
  };
}

router.get("/", async (req, res) => {
  const { q = "", page = "1", limit = "1000" } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const all = await readJSON("reservas.json");
  const clientes = await readJSON("clientes.json");
  const propiedades = await readJSON("propiedades.json");
  const hay = (s) => String(s || "").toLowerCase().includes(String(q).toLowerCase());

  const filtered = all.filter(r => {
    if (!q) return true;
    const cli = clientes.find(c => String(c.dni) === String(r.dniCliente));
    const prop = propiedades.find(p => String(p.id) === String(r.idPropiedad));
    return (
      hay(r.id) || hay(r.dniCliente) || hay(r.idPropiedad) || hay(r.fecha) || hay(r.estado) || hay(r.monto) ||
      (cli && (hay(cli.nombre) || hay(cli.apellido))) ||
      (prop && (hay(prop.tipo) || hay(prop.direccion)))
    );
  });

  const start = (p - 1) * l;
  const data = await Promise.all(filtered.slice(start, start + l).map(hydrate));
  res.json({ ok: true, total: filtered.length, page: p, limit: l, data });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const all = await readJSON("reservas.json");
  const item = all.find(x => String(x.id) === String(id));
  if (!item) return res.status(404).json({ ok: false, error: "Reserva no encontrada" });
  res.json({ ok: true, data: await hydrate(item) });
});

router.post("/", async (req, res) => {
  let { id, dniCliente, idPropiedad, fecha, monto, estado } = req.body || {};

  id = trim(id);
  dniCliente = trim(dniCliente);
  idPropiedad = trim(idPropiedad);
  fecha = trim(fecha);

  const faltantes = [];
  if (!notEmpty(id)) faltantes.push("id");
  if (!notEmpty(dniCliente)) faltantes.push("dniCliente");
  if (!notEmpty(idPropiedad)) faltantes.push("idPropiedad");
  if (!notEmpty(fecha)) faltantes.push("fecha");

  if (faltantes.length) {
    return res.status(400).json({ ok: false, error: `Faltan campos obligatorios: ${faltantes.join(", ")}` });
  }

  const reservas = await readJSON("reservas.json");
  if (reservas.some(x => String(x.id) === String(id))) {
    return res.status(409).json({ ok: false, error: "Ya existe una reserva con ese id" });
  }

  // Validar referencias (si querés las desactivamos luego)
  const clientes = await readJSON("clientes.json");
  const propiedades = await readJSON("propiedades.json");
  if (!clientes.some(c => String(c.dni) === String(dniCliente))) {
    return res.status(400).json({ ok: false, error: "dniCliente no existe" });
  }
  if (!propiedades.some(p => String(p.id) === String(idPropiedad))) {
    return res.status(400).json({ ok: false, error: "idPropiedad no existe" });
  }

  const nuevo = {
    id,
    dniCliente,
    idPropiedad,
    fecha,
    monto: Number(monto ?? 0) || 0,
    estado: String(estado || "activa")
  };

  reservas.push(nuevo);
  await writeJSON(reservas, "reservas.json");
  res.status(201).json({ ok: true, data: await hydrate(nuevo) });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  let { dniCliente, idPropiedad, fecha, monto, estado } = req.body || {};
  const reservas = await readJSON("reservas.json");
  const idx = reservas.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Reserva no encontrada" });

  if (dniCliente !== undefined) {
    dniCliente = trim(dniCliente);
    const clientes = await readJSON("clientes.json");
    if (!clientes.some(c => String(c.dni) === String(dniCliente))) {
      return res.status(400).json({ ok: false, error: "dniCliente no existe" });
    }
  }
  if (idPropiedad !== undefined) {
    idPropiedad = trim(idPropiedad);
    const propiedades = await readJSON("propiedades.json");
    if (!propiedades.some(p => String(p.id) === String(idPropiedad))) {
      return res.status(400).json({ ok: false, error: "idPropiedad no existe" });
    }
  }

  reservas[idx] = {
    ...reservas[idx],
    ...(dniCliente !== undefined ? { dniCliente } : {}),
    ...(idPropiedad !== undefined ? { idPropiedad } : {}),
    ...(fecha !== undefined ? { fecha: trim(fecha) } : {}),
    ...(monto !== undefined ? { monto: Number(monto) || 0 } : {}),
    ...(estado !== undefined ? { estado: String(estado) } : {})
  };

  await writeJSON(reservas, "reservas.json");
  res.json({ ok: true, data: await hydrate(reservas[idx]) });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const reservas = await readJSON("reservas.json");
  const idx = reservas.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Reserva no encontrada" });

  const eliminado = reservas.splice(idx, 1)[0];
  await writeJSON(reservas, "reservas.json");
  res.json({ ok: true, data: eliminado });
});

export default router;
