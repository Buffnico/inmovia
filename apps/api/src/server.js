// apps/api/src/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Seguridad y performance
 */
app.disable("x-powered-by");
app.use(helmet());
app.use(compression());

/**
 * CORS: producción (Vercel) + dev local
 * Si luego cambiás el dominio de Vercel, actualizá este array.
 */
app.use(
  cors({
    origin: ["https://inmovia.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);

/**
 * Body parsers
 */
app.use(express.json({ limit: "5mb" }));

/**
 * Healthcheck
 */
app.get("/api/ping", (_req, res) =>
  res.json({ ok: true, app: "inmovia-api" })
);

/**
 * Rutas
 */
const eduRouter = require("./routes/edu");
app.use("/api/edu", eduRouter);

/**
 * Start
 */
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
