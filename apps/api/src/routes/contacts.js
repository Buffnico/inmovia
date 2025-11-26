const express = require('express');
const router = express.Router();
const { handleContactReminders } = require('../services/contactRemindersService');

const { canReadContact, canEditContact, ROLES } = require('../utils/permissions');

// --- MOCK DATABASE (In-Memory) ---
let contacts = [
    {
        id: "c1",
        agentId: "agente1", // Mock ID
        ownerId: "agente1",
        agenteNombre: "Agente Juan",
        nombre: "María",
        apellido: "Pérez",
        telefonoPrincipal: "+54 11 1234-5678",
        emailPrincipal: "maria.perez@example.com",
        tipoContacto: "Cliente comprador",
        etapa: "En seguimiento",
        origen: "Portal",
        fechaCumpleanios: "1990-05-12",
        recordarCumpleanios: false,
        fechaMudanza: "2024-03-01",
        recordarMudanza: false,
        direccion: "Av. Siempre Viva 123",
        ciudad: "Lomas de Zamora",
        provincia: "Buenos Aires",
        pais: "Argentina",
        cumpleCalendarEventId: null,
        mudanzaCalendarEventId: null,
        linkedPropertyId: "p1" // Linked property for Receptionist access test
    },
    {
        id: "c2",
        agentId: "agente1",
        ownerId: "agente1",
        agenteNombre: "Agente Juan",
        nombre: "Carlos",
        apellido: "Gómez",
        telefonoPrincipal: "+54 11 2222-3333",
        emailPrincipal: "carlos.gomez@example.com",
        tipoContacto: "Posible cliente",
        etapa: "Nuevo",
        origen: "Redes",
        recordarCumpleanios: false,
        recordarMudanza: false,
    },
    {
        id: "c3",
        agentId: "a2",
        ownerId: "a2",
        agenteNombre: "Recepcionista Laura",
        nombre: "Laura",
        apellido: "Sosa",
        telefonoPrincipal: "+54 11 4444-5555",
        emailPrincipal: "laura.sosa@example.com",
        tipoContacto: "Proveedor",
        etapa: "Cliente activo",
        origen: "Recomendado",
        recordarCumpleanios: false,
        recordarMudanza: false,
    },
];

// GET /api/contacts - List all contacts
router.get('/', (req, res) => {
    const visibleContacts = contacts.filter(c => canReadContact(req.user, c));
    res.json({
        ok: true,
        data: visibleContacts
    });
});

// GET /api/contacts/:id - Get contact by ID
router.get('/:id', (req, res) => {
    const contact = contacts.find(c => c.id === req.params.id);
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

    contacts.push(newContact);
    res.json({
        ok: true,
        message: 'Contacto creado',
        data: newContact
    });
});

// PUT /api/contacts/:id - Update contact
router.put('/:id', async (req, res) => {
    const index = contacts.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ ok: false, message: "Contacto no encontrado" });
    }

    const oldContact = { ...contacts[index] };

    if (!canEditContact(req.user, oldContact)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para editar este contacto" });
    }

    const updatedContact = { ...oldContact, ...req.body };

    // Prevent ownership change by agents
    if (req.user.role === ROLES.AGENTE) {
        updatedContact.ownerId = oldContact.ownerId;
    }

    // 1. Procesar recordatorios en Calendar
    const calendarUpdates = await handleContactReminders(oldContact, updatedContact);

    // 2. Actualizar IDs de eventos si cambiaron
    if (calendarUpdates.cumpleCalendarEventId !== undefined) {
        updatedContact.cumpleCalendarEventId = calendarUpdates.cumpleCalendarEventId;
    }
    if (calendarUpdates.mudanzaCalendarEventId !== undefined) {
        updatedContact.mudanzaCalendarEventId = calendarUpdates.mudanzaCalendarEventId;
    }

    // 3. Guardar cambios
    contacts[index] = updatedContact;

    res.json({
        ok: true,
        message: 'Contacto actualizado',
        data: updatedContact
    });
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', (req, res) => {
    const contact = contacts.find(c => c.id === req.params.id);
    if (!contact) return res.status(404).json({ ok: false, message: "Contacto no encontrado" });

    if (!canEditContact(req.user, contact)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar este contacto" });
    }

    contacts = contacts.filter(c => c.id !== req.params.id);
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
