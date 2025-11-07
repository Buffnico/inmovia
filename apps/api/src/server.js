// apps/api/src/server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: ajustá el origin cuando tengas la URL final de Vercel
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://TU-PROYECTO.vercel.app"
  ],
  credentials: true,
}));

app.use(express.json());

// Rutas
app.get("/api/ping", (_req, res) => res.json({ ok: true, app: "inmovia-api" }));

const eduRouter = require("./routes/edu");
app.use("/api/edu", eduRouter);

// Start
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
