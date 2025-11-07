const express = require("express");
const router = express.Router();

const MOCK = [
  {
    id: "captacion-pro",
    title: "Captación PRO: cómo conseguir propiedades de calidad",
    summary: "Método paso a paso para captar propietarios, calificar leads y preparar un pitch efectivo.",
    lessons: 8, duration: 55, level: "Intermedio", paid: true,
    contents: [
      "Mapa de prospección y segmentación","Guion de llamada y objeciones",
      "Visita de evaluación: checklist","Presentación de servicios",
      "Seguimiento y cierre","Plantillas (PDF/Word)","KPIs y tablero semanal","Bonus: Objeciones difíciles"
    ]
  },
  {
    id: "fotografia-movil",
    title: "Fotografía inmobiliaria con celular",
    summary: "Composición, luz, encuadre y flujo con el escáner/edición de Inmovia.",
    lessons: 5, duration: 32, level: "Básico", paid: false,
    contents: ["Configuración del móvil","Luz natural vs artificial","Ángulos por ambiente","Postpro con el escáner","Entrega a portales/redes"]
  }
];

router.get("/modules", (_req, res) => {
  res.json(MOCK.map(({ contents, ...rest }) => rest));
});

router.get("/modules/:id", (req, res) => {
  const item = MOCK.find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

module.exports = router;
