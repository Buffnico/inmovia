// backend/index.js
const express = require("express");
const cors = require("cors");

const app = express();

// Permitir origen del frontend (Vercel) si está seteado; si no, local en desarrollo
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

// Ruta raíz (útil para verificar que el servicio está vivo)
app.get("/", (_req, res) => res.send("API Inmovia online ✅"));

// Ping de salud para el frontend
app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, message: "Backend Inmovia OK 🚀" });
});

// (Opcional) Almacenamiento temporal en memoria para pruebas
let clientes = [];
let nextId = 1;

app.post("/api/clientes", (req, res) => {
  const { nombre, apellido, dni, email, telefono } = req.body || {};
  if (!nombre || !apellido || !dni) {
    return res.status(400).json({ ok: false, message: "Faltan campos obligatorios" });
  }
  const dniStr = String(dni).trim();
  if (!/^\d{7,10}$/.test(dniStr)) {
    return res.status(400).json({ ok: false, message: "DNI inválido (7 a 10 dígitos)" });
  }
  if (clientes.some((cliente) => cliente.dni === dniStr)) {
    return res.status(409).json({ ok: false, message: "Ya existe un cliente con ese DNI" });
  }
  const nuevo = { id: nextId++, nombre, apellido, dni: dniStr, email: email || "", telefono: telefono || "" };
  clientes.push(nuevo);
  return res.status(201).json(nuevo);
});

app.get("/api/clientes", (_req, res) => res.json(clientes));

// Render asigna el puerto en process.env.PORT (¡no fijar 3000 a mano!)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend Inmovia escuchando en puerto ${PORT}`);
  console.log(`CORS permitido para: ${FRONTEND_ORIGIN}`);
});

// Borrar cliente por id
app.delete("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = clientes.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ ok:false, message:"Cliente no encontrado" });
  const [eliminado] = clientes.splice(idx, 1);
  res.json({ ok:true, eliminado });
});
