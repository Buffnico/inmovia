const express = require('express');
const router = express.Router();

// Import route modules
const agendaRouter = require('./agenda');
const contactsRouter = require('./contacts');
const propertiesRouter = require('./properties');
const documentsRouter = require('./documents');
const ivotRouter = require('./ivot');
const alquileresRouter = require('./alquileres');

// Import Google Calendar module (located in parent src/ folder)
const googleCalendarRouter = require('../googleCalendar');

// API root
router.get('/', (req, res) => res.json({ ok: true, message: 'Inmovia API v1.0' }));

// Register routes
router.use('/agenda', agendaRouter);
router.use('/contacts', contactsRouter);
router.use('/properties', propertiesRouter);
router.use('/documents', documentsRouter);
router.use('/ivot', ivotRouter);
router.use('/alquileres', alquileresRouter);
router.use('/notificaciones', require('./notifications'));
router.use('/reminders', require('./reminders'));
router.use('/chat', require('./chat'));

// Google Calendar Integration
// This router handles /api/calendar/status, /api/calendar/connect, /api/calendar/events, etc.
router.use('/calendar', googleCalendarRouter);

// Auth placeholder (can be expanded later)
router.use('/auth', (req, res) => res.json({ ok: true, module: 'auth (placeholder)' }));

module.exports = router;
