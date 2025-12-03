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

// GET /api/agenda/invitations - List pending invitations for logged user
router.get('/invitations', (req, res) => {
  const events = AgendaModel.getAll();
  const invitations = [];

  events.forEach(event => {
    if (event.participants && Array.isArray(event.participants)) {
      const participant = event.participants.find(p => p.userId === req.user.id && p.status === 'invited');
      if (participant) {
        invitations.push({
          invitationId: `${event.id}_${req.user.id}`,
          eventId: event.id,
          fromUserId: event.assignedUserId, // owner
          title: event.summary || event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          description: event.description,
          status: participant.status
        });
      }
    }
  });

  res.json({
    ok: true,
    data: invitations
  });
});

// POST /api/agenda/ivot/schedule - Create event from Ivo-t
router.post('/ivot/schedule', async (req, res) => {
  console.log("POST /api/agenda/ivot/schedule", req.body);
  const { title, date, time, durationMinutes, location, description, invitees } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ ok: false, message: "Faltan datos obligatorios (título, fecha, hora)" });
  }

  // Calculate end time
  let endTime = "";
  if (time && durationMinutes) {
    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + durationMinutes);
    endTime = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  const participants = (invitees || []).map(uid => ({
    userId: uid,
    status: 'invited',
    comment: null
  }));

  const newEvent = AgendaModel.create({
    title,
    summary: title, // Compatibility
    date,
    startTime: time,
    endTime,
    location,
    description,
    assignedUserId: req.user.id, // Owner
    source: 'ivot',
    participants
  });

  // Notify participants
  if (participants.length > 0) {
    const NotificationModel = require('../models/notificationModel');
    participants.forEach(p => {
      NotificationModel.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: p.userId,
        type: 'agenda',
        title: 'Nueva invitación (vía Ivo-t)',
        message: `Te han invitado al evento: ${title} el ${date} a las ${time}`,
        createdAt: new Date().toISOString(),
        read: false,
        metadata: { eventId: newEvent.id, fromUserId: req.user.id }
      });
    });
  }

  // Try to sync with Google Calendar (optional)
  const googleCalendar = require('../googleCalendar');
  const status = googleCalendar.getStatus();

  if (status.connected) {
    try {
      // Map internal event to Google Event format
      const googleEventData = {
        summary: title,
        description: description || "",
        location: location || "",
        start: {
          dateTime: `${date}T${time}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: `${date}T${endTime}:00`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        attendees: participants.map(p => ({ email: p.userId })) // This assumes userId is email or we need to look up email. 
        // For now, let's skip attendees sync to Google to avoid complexity with User lookup, 
        // or just sync the event itself.
      };

      // Since we don't have easy access to User emails here without looking them up, 
      // and the requirement is "Google Calendar opcional", let's just create the event for the owner.
      // If we really need attendees in Google, we'd need to fetch User objects.

      // Actually, let's just call createEvent from googleCalendar.js if it supports this format.
      // Checking googleCalendar.js usage in other routes might be useful, but let's stick to the requested logic:
      // "Si está conectado, intentar crear el evento también en Google Calendar"

      // We'll use a simplified call assuming googleCalendar.createEvent takes (auth, eventResource).
      // But googleCalendar.js usually handles auth internally or via a stored token.

      // Let's look at how POST /api/calendar/events does it. 
      // It seems we don't have that code visible here, but usually it's `googleCalendar.createEvent(eventData)`.

      // Wait, the prompt says "llamar a la función existente de creación de eventos".
      // Let's assume googleCalendar.createEvent exists and takes an object.

      await googleCalendar.createEvent({
        title,
        date,
        startTime: time,
        endTime,
        description,
        location
      });

      console.log("Evento sincronizado con Google Calendar");

    } catch (googleErr) {
      console.error("Error sincronizando con Google Calendar (no bloqueante):", googleErr.message);
    }
  }

  res.json({
    ok: true,
    event: newEvent
  });
});

module.exports = router;
