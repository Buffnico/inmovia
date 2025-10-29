import express from "express";
const router = express.Router();

// Verificación rápida de que el router está montado
router.get("/ping", (req, res) => {
  res.json({ ok: true, module: "portadas", message: "pong" });
});

// Generación simulada de portada (sin IA aún)
router.post("/preview", (req, res) => {
  try {
    const { direccion, precio, ambientes, superficie, imagen } = req.body || {};

    // Validación mínima
    if (!direccion || !precio || !ambientes || !superficie) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos requeridos: direccion, precio, ambientes, superficie"
      });
    }

    const portada = {
      ok: true,
      message: "Portada generada correctamente",
      preview: {
        direccion,
        precio,
        ambientes,
        superficie,
        imagen: imagen || "https://via.placeholder.com/800x450.png?text=Vista+de+la+propiedad",
        colorPrincipal: "#1E40AF",
        estilo: "moderno",
        texto: `🏠 ${direccion}\n💰 ${precio}\n${ambientes} ambientes · ${superficie} m²`
      }
    };

    return res.json(portada);
  } catch (e) {
    console.error("Error en /portadas/preview:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
});

export default router;
