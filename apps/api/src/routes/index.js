import express from "express";
import portadas from "./portadas.js";

const eduRouter = require("./routes/edu");
const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, message: "API Root OK" }));

router.use("/portadas", portadas);
app.use("/api/edu", eduRouter);
// Namespaces (placeholders)
router.use("/auth", (req, res) => res.json({ ok: true, module: "auth" }));
router.use("/contacts", (req, res) => res.json({ ok: true, module: "contacts" }));
router.use("/assets", (req, res) => res.json({ ok: true, module: "assets" }));
router.use("/cases", (req, res) => res.json({ ok: true, module: "cases" }));

// Real Estate (placeholders)
router.use("/real-estate/portadas", (req, res) => res.json({ ok: true, module: "portadas" }));
router.use("/real-estate/showcases", (req, res) => res.json({ ok: true, module: "showcases" }));

// Calendar (flag)
router.use("/calendar", (req, res) => res.json({ ok: true, module: "calendar (flag pending)" }));

export default router;
