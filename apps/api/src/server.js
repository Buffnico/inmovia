// apps/api/src/server.js
require("dotenv").config(); // 👈 CARGA .env EN LOCAL

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
    origin: true, // ⚠️ DEV ONLY: Allow all origins to rule out CORS issues
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
const initOwner = require('./utils/initOwner');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Inicializar Owner al arrancar
initOwner();

// Rutas de Auth y Usuarios
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

app.use("/api", routes);

/**
 * Start
 */
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
