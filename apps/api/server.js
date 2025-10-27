import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import clientesRouter from "./src/routes/clientes.routes.js";
import propiedadesRouter from "./src/routes/propiedades.routes.js";
import reservasRouter from "./src/routes/reservas.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- PARSERS: obligamos a parsear JSON y forms ---
app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded

// CORS + logs
app.use(cors());
app.use(morgan("dev"));

// Logger de debug del body (te dice qué llega)
app.use((req, _res, next) => {
  if (["POST","PUT","PATCH"].includes(req.method)) {
    console.log("🔎", req.method, req.originalUrl, "CT:", req.headers["content-type"]);
    console.log("     body >", req.body);
  }
  next();
});

// Static + index
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// APIs
app.get("/api/ping", (_req, res) => res.json({ ok: true, message: "pong" }));
app.use("/api/clientes", clientesRouter);
app.use("/api/propiedades", propiedadesRouter);
app.use("/api/reservas", reservasRouter);

// 404
app.use((_req, res) => res.status(404).json({ ok: false, error: "Ruta no encontrada" }));

// Fallback de puerto 3000→3005
const BASE = Number(process.env.PORT) || 3001; // lo pongo en 3001 para no chocar con nada
function startOn(port, max = 3005) {
  const server = app.listen(port, () => {
    console.log(`✅ Backend Inmovia en http://localhost:${port}`);
    console.log(`🧪 Tester UI en http://localhost:${port}/`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && port < max) {
      console.warn(`⚠️ Puerto ${port} en uso, probando ${port + 1}...`);
      startOn(port + 1, max);
    } else {
      throw err;
    }
  });
}
startOn(BASE);
