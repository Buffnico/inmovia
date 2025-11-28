const express = require('express');
const router = express.Router();
const AgendaModel = require('../models/agendaModel');
const { canReadEvent, canEditEvent, ROLES } = require('../utils/permissions');

// GET /api/agenda - List all events (with optional filtering)
router.get('/', (req, res) => {
  let events = AgendaModel.getAll();

  // Filtering
  if (req.query.contactId) {
    events = events.filter(e => e.contactId === req.query.contactId);
  }

  if (req.query.futureOnly === 'true') {
    const today = new Date().toISOString().split('T')[0];
    events = events.filter(e => e.date >= today);
  }

  // RBAC
  const visibleEvents = events.filter(e => canReadEvent(req.user, e));

  // Sort by date ASC
  visibleEvents.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  res.json({
    ok: true,
    data: visibleEvents
  });
});

// POST /api/agenda - Create event
router.post('/', (req, res) => {
  const eventData = { ...req.body };

  // Auto-assign for Agents
  if (req.user.role === ROLES.AGENTE) {
    eventData.assignedUserId = req.user.id;
  } else if (!eventData.assignedUserId) {
    eventData.assignedUserId = req.user.id;
  }

  // Handle participants
  if (eventData.participants && Array.isArray(eventData.participants)) {
    eventData.participants = eventData.participants.map(userId => ({
      userId,
      status: 'invited'
    }));
  } else {
    eventData.participants = [];
  }

  const newEvent = AgendaModel.create(eventData);

  // Create notifications for invited participants
  if (newEvent.participants && newEvent.participants.length > 0) {
    const NotificationModel = require('../models/notificationModel');
    newEvent.participants.forEach(p => {
      NotificationModel.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: p.userId,
        type: 'agenda',
        title: 'Nueva invitación a evento',
        message: `Te han invitado al evento: ${newEvent.summary || newEvent.title} el ${newEvent.date}`,
        createdAt: new Date().toISOString(),
        read: false,
        metadata: { eventId: newEvent.id, fromUserId: req.user.id }
      });
    });
  }

  res.json({
    ok: true,
    message: 'Evento creado',
    data: newEvent
  });
});

// GET /api/agenda/:id - Get event by ID
router.get('/:id', (req, res) => {
  const event = AgendaModel.getById(req.params.id);
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
  const oldEvent = AgendaModel.getById(req.params.id);
  if (!oldEvent) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

  if (!canEditEvent(req.user, oldEvent)) {
    return res.status(403).json({ ok: false, message: "No tienes permiso para editar este evento" });
  }

  const updateData = { ...req.body };

  // Prevent reassignment by agents
  if (req.user.role === ROLES.AGENTE) {
    delete updateData.assignedUserId; // Ignore changes to assignedUserId
  }

  // Handle participants updates (only owner/admin can update participants list structure)
  // If participants are sent as array of strings (userIds), we need to merge/update
  if (updateData.participants && Array.isArray(updateData.participants)) {
    // Check if it's a list of IDs (from frontend select) or full objects
    if (typeof updateData.participants[0] === 'string') {
      const newParticipantIds = updateData.participants;
      const oldParticipants = oldEvent.participants || [];

      const mergedParticipants = newParticipantIds.map(uid => {
        const existing = oldParticipants.find(p => p.userId === uid);
        return existing || { userId: uid, status: 'invited' };
      });

      updateData.participants = mergedParticipants;

      // Notify NEW participants
      const NotificationModel = require('../models/notificationModel');
      mergedParticipants.forEach(p => {
        if (!oldParticipants.find(op => op.userId === p.userId)) {
          NotificationModel.create({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: p.userId,
            type: 'agenda',
            title: 'Nueva invitación a evento',
            message: `Te han invitado al evento: ${updateData.summary || oldEvent.summary} el ${updateData.date || oldEvent.date}`,
            createdAt: new Date().toISOString(),
            read: false,
            metadata: { eventId: oldEvent.id, fromUserId: req.user.id }
          });
        }
      });
    }
  }

  const updatedEvent = AgendaModel.update(req.params.id, updateData);

  res.json({
    ok: true,
    message: 'Evento actualizado',
    data: updatedEvent
  });
});

// POST /api/agenda/:id/responder-invitacion
router.post('/:id/responder-invitacion', (req, res) => {
  const event = AgendaModel.getById(req.params.id);
  if (!event) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

  const { status, comment } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ ok: false, message: "Estado inválido" });
  }

  const participants = event.participants || [];
  const participantIndex = participants.findIndex(p => p.userId === req.user.id);

  if (participantIndex === -1) {
    return res.status(403).json({ ok: false, message: "No estás invitado a este evento" });
  }

  participants[participantIndex].status = status;
  participants[participantIndex].comment = comment || "";
  participants[participantIndex].respondedAt = new Date().toISOString();

  AgendaModel.update(req.params.id, { participants });

  // Notify Owner
  const NotificationModel = require('../models/notificationModel');
  NotificationModel.create({
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: event.assignedUserId, // Owner
    type: 'agenda',
    title: 'Respuesta a invitación',
    message: `${req.user.name} ha ${status === 'accepted' ? 'aceptado' : 'rechazado'} tu invitación al evento: ${event.summary}`,
    createdAt: new Date().toISOString(),
    read: false,
    metadata: { eventId: event.id, fromUserId: req.user.id }
  });

  res.json({ ok: true, message: "Respuesta guardada" });
});

// DELETE /api/agenda/:id - Delete event
router.delete('/:id', (req, res) => {
  const event = AgendaModel.getById(req.params.id);
  if (!event) return res.status(404).json({ ok: false, message: "Evento no encontrado" });

  if (!canEditEvent(req.user, event)) {
    return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar este evento" });
  }

  AgendaModel.delete(req.params.id);
  res.json({
    ok: true,
    message: 'Evento eliminado'
  });
});

module.exports = router;
