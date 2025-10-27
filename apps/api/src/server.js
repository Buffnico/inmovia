import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Inmovia Office API", env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

import router from "./routes/index.js";
app.use("/api", router);

app.use((req, res) => res.status(404).json({ ok: false, message: "Not Found" }));

app.listen(PORT, () => console.log(`✅ API en http://localhost:${PORT}`));
