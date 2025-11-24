// apps/api/src/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const routes = require("./routes");

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
 */
app.use(
  cors({
    origin: [
      "https://inmovia.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
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
 * Rutas principales
 */
app.use("/api", routes);

/**
 * Start
 */
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
