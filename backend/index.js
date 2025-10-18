// index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());           // Permite que el frontend (localhost:5173) se conecte
app.use(express.json());   // Permite recibir datos en formato JSON

// Ruta de prueba para comprobar que todo anda
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Backend Inmovia OK 🚀" });
});

// Configurar el puerto
const PORT = process.env.PORT || 3000;

// Encender el servidor
app.listen(PORT, () => {
  console.log(`✅ Backend Inmovia escuchando en http://localhost:${PORT}`);
});
