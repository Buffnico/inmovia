const express = require('express');
const router = express.Router();
const { handlePropertyFeedback } = require('../services/propertyFeedbackService');

// --- MOCK DATABASE (In-Memory) ---
let properties = [
    {
        id: "p1",
        titulo: "Depto 3 amb premium",
        direccion: "Lomas de Zamora",
        estado: "Activa",
        agente: "Nicolás",
        cliente: { nombre: "María Pérez", dni: "12345678", email: "maria@example.com" }, // Vinculado a c1 conceptualmente
        contactId: "c1",
        recordarFeedback: false,
        frecuenciaFeedbackDias: 7,
        feedbackCalendarEventId: null
    },
    {
        id: "p2",
        titulo: "Casa 4 amb con jardín",
        direccion: "Banfield",
        estado: "Reservada",
        agente: "Lucía",
        cliente: { nombre: "Carlos Gómez" },
        contactId: "c2",
        recordarFeedback: false,
        frecuenciaFeedbackDias: 15,
        feedbackCalendarEventId: null
    },
];

// GET /api/properties - List all properties
router.get('/', (req, res) => {
    res.json({
        ok: true,
        data: properties
    });
});

// GET /api/properties/:id - Get property by ID
router.get('/:id', (req, res) => {
    const prop = properties.find(p => p.id === req.params.id);
    if (!prop) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });
    res.json({ ok: true, data: prop });
});

// POST /api/properties - Create property
router.post('/', (req, res) => {
    const newProp = { id: `p${Date.now()}`, ...req.body };
    properties.push(newProp);
    res.json({ ok: true, message: 'Propiedad creada', data: newProp });
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
    const index = properties.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });

    const oldProp = { ...properties[index] };
    const updatedProp = { ...oldProp, ...req.body };

    // 1. Procesar recordatorios de feedback
    const calendarUpdates = await handlePropertyFeedback(oldProp, updatedProp);

    // 2. Actualizar ID de evento
    if (calendarUpdates.feedbackCalendarEventId !== undefined) {
        updatedProp.feedbackCalendarEventId = calendarUpdates.feedbackCalendarEventId;
    }

    // 3. Guardar
    properties[index] = updatedProp;

    res.json({ ok: true, message: 'Propiedad actualizada', data: updatedProp });
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
    properties = properties.filter(p => p.id !== req.params.id);
    res.json({ ok: true, message: 'Propiedad eliminada' });
});

module.exports = router;
