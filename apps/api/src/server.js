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
const allowedOrigins = [
  "http://localhost:5173",
  "https://inmovia.vercel.app",      // dominio real del front (ajustar si es diferente)
  "https://www.inmovia.vercel.app",  // si aplica
  // Add any other Vercel preview domains if needed, or use a regex if you want to be more permissive with previews
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Optional: Allow Vercel preview deployments dynamically
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      console.warn("CORS bloqueó origen:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Enable pre-flight across-the-board
app.options('*', cors());

/**
 * Body parsers
 */
app.use(express.json({ limit: "5mb" }));

/**
 * Healthcheck (Ping)
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
