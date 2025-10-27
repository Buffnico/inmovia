import { Router } from "express";
const router = Router();

router.get("/", (req, res) => res.json({ ok: true, message: "Inmovia Office API v1" }));
router.use("/auth", (req, res) => res.json({ ok: true, module: "auth" }));
router.use("/contacts", (req, res) => res.json({ ok: true, module: "contacts" }));
router.use("/assets", (req, res) => res.json({ ok: true, module: "assets" }));
router.use("/cases", (req, res) => res.json({ ok: true, module: "cases" }));
router.use("/real-estate/portadas", (req, res) => res.json({ ok: true, module: "portadas" }));
router.use("/real-estate/showcases", (req, res) => res.json({ ok: true, module: "showcases" }));
router.use("/real-estate/acm", (req, res) => res.json({ ok: true, module: "acm" }));
router.use("/real-estate/signage", (req, res) => res.json({ ok: true, module: "signage" }));
router.use("/calendar", (req, res) => res.json({ ok: true, module: "calendar (flag pending)" }));

export default router;
