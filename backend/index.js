const express = require("express");
const cors = require("cors");

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/", (_req, res) => res.send("API Inmovia online ✅"));
app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, message: "Backend Inmovia OK 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend Inmovia escuchando en puerto ${PORT}`);
});
