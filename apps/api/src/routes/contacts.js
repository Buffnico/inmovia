const express = require('express');
const router = express.Router();
const { handleContactReminders } = require('../services/contactRemindersService');

// --- MOCK DATABASE (In-Memory) ---
let contacts = [
    {
        id: "c1",
        agentId: "a1",
        agenteNombre: "Agente Juan",
        nombre: "María",
        apellido: "Pérez",
        telefonoPrincipal: "+54 11 1234-5678",
        emailPrincipal: "maria.perez@example.com",
        tipoContacto: "Cliente comprador",
        etapa: "En seguimiento",
        origen: "Portal",
        fechaCumpleanios: "1990-05-12",
        recordarCumpleanios: false, // Empezamos en false para probar el toggle
        fechaMudanza: "2024-03-01",
        recordarMudanza: false,
        direccion: "Av. Siempre Viva 123",
        ciudad: "Lomas de Zamora",
        provincia: "Buenos Aires",
        pais: "Argentina",
        cumpleCalendarEventId: null,
        mudanzaCalendarEventId: null
    },
    {
        id: "c2",
        agentId: "a1",
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

// Helper para filtrar por rol (Stub)
function filterByRole(user, data) {
    // TODO: Implementar filtrado real por rol (ej. recepcionista no ve ciertos contactos)
    return data;
}

// GET /api/contacts - List all contacts
router.get('/', (req, res) => {
    const visibleContacts = filterByRole(req.user, contacts);
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
    const updatedContact = { ...oldContact, ...req.body };

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
