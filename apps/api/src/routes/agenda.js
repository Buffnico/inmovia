const express = require('express');
const router = express.Router();

const { canReadEvent, canEditEvent, ROLES } = require('../utils/permissions');

// --- MOCK DATABASE (In-Memory) ---
let events = [
  {
    id: "e1",
    title: "Visita Propiedad P1",
    date: "2025-11-28",
    startTime: "10:00",
    endTime: "11:00",
    type: "Visita con comprador",
    assignedUserId: "agente1",
    agent: "Agente Juan"
  },
  {
    id: "e2",
    title: "Reunión de equipo",
    date: "2025-11-29",
    startTime: "09:00",
    endTime: "10:00",
    type: "Reunión interna",
    assignedUserId: "admin",
    agent: "Admin"
  }
];

// GET /api/agenda - List all events
router.get('/', (req, res) => {
  const visibleEvents = events.filter(e => canReadEvent(req.user, e));
  res.json({
    ok: true,
    data: visibleEvents
  });
});

// POST /api/agenda - Create event
router.post('/', (req, res) => {
  const newEvent = {
    id: `e${Date.now()}`,
    ...req.body
  };

  // Auto-assign for Agents
  if (req.user.role === ROLES.AGENTE) {
    newEvent.assignedUserId = req.user.id;
    // Optionally set agent name
  } else if (!newEvent.assignedUserId) {
    newEvent.assignedUserId = req.user.id;
  }

  events.push(newEvent);
  res.json({
    ok: true,
    message: 'Evento creado',
    data: newEvent
  });
});

// GET /api/agenda/:id - Get event by ID
router.get('/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

  if (!canReadEvent(req.user, event)) {
    return res.status(403).json({ ok: false, message: "No tienes permiso para ver este evento" });
  }

  res.json({
    ok: true,
    data: event
  });
});

// PUT /api/agenda/:id - Update event
router.put('/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

  const oldEvent = { ...events[index] };

  if (!canEditEvent(req.user, oldEvent)) {
    return res.status(403).json({ ok: false, message: "No tienes permiso para editar este evento" });
  }

  const updatedEvent = { ...oldEvent, ...req.body };

  // Prevent reassignment by agents
  if (req.user.role === ROLES.AGENTE) {
    updatedEvent.assignedUserId = oldEvent.assignedUserId;
  }

  events[index] = updatedEvent;

  res.json({
    ok: true,
    message: 'Evento actualizado',
    data: updatedEvent
  });
});

// DELETE /api/agenda/:id - Delete event
router.delete('/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

  if (!canEditEvent(req.user, event)) {
    return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar este evento" });
  }

  events = events.filter(e => e.id !== req.params.id);
  res.json({
    ok: true,
    message: 'Evento eliminado'
  });
});

module.exports = router;
