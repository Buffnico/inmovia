const express = require('express');
const router = express.Router();
const { handleContactReminders } = require('../services/contactRemindersService');
const ContactModel = require('../models/contactModel');
const PropertyModel = require('../models/propertyModel');
const { canReadContact, canEditContact, canReadProperty, ROLES } = require('../utils/permissions');

// GET /api/contacts - List all contacts
router.get('/', (req, res) => {
    const { search } = req.query;
    let contacts = ContactModel.findAll();

    // Filter by search term if provided
    if (search) {
        const term = search.toLowerCase();
        contacts = contacts.filter(c =>
            (c.nombre && c.nombre.toLowerCase().includes(term)) ||
            (c.apellido && c.apellido.toLowerCase().includes(term)) ||
            (c.emailPrincipal && c.emailPrincipal.toLowerCase().includes(term)) ||
            (c.telefonoPrincipal && c.telefonoPrincipal.includes(term))
        );
    }

    const visibleContacts = contacts.filter(c => canReadContact(req.user, c));
    res.json({
        ok: true,
        data: visibleContacts
    });
});

// GET /api/contacts/:id - Get contact by ID
router.get('/:id', (req, res) => {
    const contact = ContactModel.findById(req.params.id);
    if (!contact) {
        return res.status(404).json({ ok: false, message: "Contacto no encontrado" });
    }

    if (!canReadContact(req.user, contact)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para ver este contacto" });
    }

    res.json({
        ok: true,
        data: contact
    });
});

// GET /api/contacts/:id/properties - Get properties associated with a contact
router.get('/:id/properties', (req, res) => {
    const contact = ContactModel.findById(req.params.id);
    if (!contact) {
        return res.status(404).json({ ok: false, message: "Contacto no encontrado" });
    }

    if (!canReadContact(req.user, contact)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para ver este contacto" });
    }

    // Find properties where contactId matches
    const properties = PropertyModel.findByContactId(contact.id);

    // Filter properties based on user permissions
    const visibleProperties = properties.filter(p => canReadProperty(req.user, p));

    res.json({
        ok: true,
        data: visibleProperties
    });
});

// POST /api/contacts - Create contact
router.post('/', (req, res) => {
    const newContact = {
        id: `c${Date.now()}`,
        ...req.body
    };

    // Auto-assign owner for Agents
    if (req.user.role === ROLES.AGENTE) {
        newContact.ownerId = req.user.id;
        newContact.agentId = req.user.id;
    } else if (!newContact.ownerId) {
        // Default owner for others
        newContact.ownerId = req.user.id;
    }

    const created = ContactModel.create(newContact);
    res.json({
        ok: true,
        message: 'Contacto creado',
        data: created
    });
});

// PUT /api/contacts/:id - Update contact
router.put('/:id', async (req, res) => {
    const oldContact = ContactModel.findById(req.params.id);
    if (!oldContact) {
        return res.status(404).json({ ok: false, message: "Contacto no encontrado" });
    }

    if (!canEditContact(req.user, oldContact)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para editar este contacto" });
    }

    let updates = { ...req.body };

    // Prevent ownership change by agents
    if (req.user.role === ROLES.AGENTE) {
        updates.ownerId = oldContact.ownerId;
    }

    // 1. Procesar recordatorios en Calendar
    const calendarUpdates = await handleContactReminders(oldContact, { ...oldContact, ...updates });

    // 2. Actualizar IDs de eventos si cambiaron
    if (calendarUpdates.cumpleCalendarEventId !== undefined) {
        updates.cumpleCalendarEventId = calendarUpdates.cumpleCalendarEventId;
    }
    if (calendarUpdates.mudanzaCalendarEventId !== undefined) {
        updates.mudanzaCalendarEventId = calendarUpdates.mudanzaCalendarEventId;
    }

    // 3. Guardar cambios
    const updatedContact = ContactModel.update(req.params.id, updates);

    res.json({
        ok: true,
        message: 'Contacto actualizado',
        data: updatedContact
    });
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', (req, res) => {
    const contact = ContactModel.findById(req.params.id);
    if (!contact) return res.status(404).json({ ok: false, message: "Contacto no encontrado" });

    if (!canEditContact(req.user, contact)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar este contacto" });
    }

    ContactModel.delete(req.params.id);
    res.json({
        ok: true,
        message: 'Contacto eliminado'
    });
});

// POST /api/contacts/sync-google (Stub)
router.post('/sync-google', (req, res) => {
    // TODO: Conectar con Google People API aquí
    res.json({ ok: true, message: "Sync Google Contacts (stub)" });
});

module.exports = router;
