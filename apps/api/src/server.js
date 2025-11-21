// apps/api/src/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const eduRouter = require("./routes/edu");
const calendarRoutes = require("./googleCalendar"); // 👈 Google Calendar

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
app.use("/api/edu", eduRouter);

// 👇 Todas las rutas de calendario arrancan con /api/calendar
app.use("/api/calendar", calendarRoutes);

/**
 * Start
 */
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
