const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { handlePropertyFeedback } = require('../services/propertyFeedbackService');
const PropertyModel = require('../models/propertyModel');
const ContactModel = require('../models/contactModel');

// Configure Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

const { canReadProperty, canEditProperty, ROLES } = require('../utils/permissions');

// GET /api/properties - List all properties
router.get('/', (req, res) => {
    const properties = PropertyModel.findAll();
    // Filter properties based on user role
    const visibleProperties = properties.filter(p => canReadProperty(req.user, p));

    res.json({
        ok: true,
        data: visibleProperties
    });
});

// GET /api/properties/:id - Get property by ID
router.get('/:id', (req, res) => {
    const prop = PropertyModel.findById(req.params.id);
    if (!prop) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });

    if (!canReadProperty(req.user, prop)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para ver esta propiedad" });
    }

    res.json({ ok: true, data: prop });
});

// POST /api/properties - Create property
router.post('/', (req, res) => {
    const newProp = { id: `p${Date.now()}`, ...req.body };

    // Enforce assignment for Agents
    if (req.user.role === ROLES.AGENTE) {
        newProp.assignedAgentId = req.user.id;
        // Optionally set agent name from user profile if available, or frontend sends it
    }

    // For other roles, they can assign anyone. If not provided, maybe default to creator?
    if (!newProp.assignedAgentId && [ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO].includes(req.user.role)) {
        newProp.assignedAgentId = req.user.id; // Default to self if not specified
    }

    // --- Contact Linking Logic ---
    // 1. Check if contactId is provided
    if (newProp.contactId) {
        const existing = ContactModel.findById(newProp.contactId);
        if (!existing) {
            // If invalid ID, maybe clear it or warn? For now, we'll proceed but it might be inconsistent.
            // Or we could try to find/create based on client data if ID is bad.
            console.warn(`Provided contactId ${newProp.contactId} not found.`);
            newProp.contactId = null;
        }
    }

    // 2. If no contactId, try to find by email/phone from 'cliente' object
    if (!newProp.contactId && newProp.cliente) {
        const { email, celular, telefono, nombre, apellido } = newProp.cliente;

        let foundContact = null;
        if (email) foundContact = ContactModel.findByEmail(email);
        if (!foundContact && (celular || telefono)) foundContact = ContactModel.findByPhone(celular || telefono);

        if (foundContact) {
            newProp.contactId = foundContact.id;
            console.log(`Linked to existing contact: ${foundContact.id}`);
        } else {
            // 3. If not found, create new contact
            // We need basic info. If 'cliente' has name/email/phone, we can create it.
            if (nombre || email || (celular || telefono)) {
                const newContact = {
                    id: `c${Date.now()}`,
                    nombre: nombre || 'Sin Nombre',
                    apellido: apellido || '',
                    emailPrincipal: email || '',
                    telefonoPrincipal: celular || telefono || '',
                    tipoContacto: 'Cliente vendedor', // Default role for property owner?
                    etapa: 'Nuevo',
                    ownerId: req.user.id, // Assign to current user
                    agentId: req.user.id,
                    origen: 'Creación de Propiedad'
                };
                ContactModel.create(newContact);
                newProp.contactId = newContact.id;
                console.log(`Created new contact: ${newContact.id}`);
            }
        }
    }

    PropertyModel.create(newProp);
    res.json({ ok: true, message: 'Propiedad creada', data: newProp });
});

// POST /api/properties/importar/remax-excel - Import from RE/MAX CSV
router.post('/importar/remax-excel', upload.single('file'), (req, res) => {
    // Only authorized roles should import? For now assume middleware handles basic auth.
    // Maybe restrict import to ADMIN/OWNER?
    if (![ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO].includes(req.user.role)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para importar propiedades." });
    }

    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: 'No se subió ningún archivo.' });
        }

        // Parse CSV/Excel
        // xlsx.read handles CSVs automatically if passed as buffer.
        // It detects delimiters (comma, semicolon) reasonably well.
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // sheet_to_json with raw: false helps with some CSV parsing edge cases, 
        // but default is usually fine.
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: null });

        let stats = {
            total: rawData.length,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0
        };

        const properties = PropertyModel.findAll();

        rawData.forEach(row => {
            try {
                const mlsId = row['MLSID'] ? String(row['MLSID']).trim() : null;
                if (!mlsId) {
                    stats.skipped++;
                    return;
                }

                // Map fields
                const mappedProp = {
                    id: mlsId, // Use MLSID as ID for simplicity in this context
                    mlsid: mlsId,
                    redremaxId: row['Redremax ID'],

                    // Location
                    direccion: `${row['Dirección'] || ''} ${row['Altura'] || ''}`.trim(),
                    codigoPostal: row['Código postal'],
                    localidad: row['Localidad'],
                    barrio: row['Barrio'],
                    barrioCerrado: row['Barrio Cerrado'],
                    latitud: row['Latitud'],
                    longitud: row['Longitud'],

                    // Status & Operation
                    statusListing: row['Status Listing'],
                    estado: row['Estado de la propiedad'] || 'Activa',
                    tipoOperacion: row['Tipo de Operación'],
                    tipoPropiedad: row['Tipo de Propiedad'],
                    tipoContrato: row['Tipo de contrato'],
                    cartel: row['Cartel'],
                    diasEnMercado: row['Días en Mercado'],

                    // Dates
                    fechaCaptacion: row['Fecha Captación'],
                    ultimaActualizacion: row['Última actualización'],
                    fechaVentaAlquiler: row['Fecha de Venta/Alquiler'],
                    fechaExpiracion: row['Fecha Expiración'],

                    // Commercial
                    precio: row['Precio'],
                    monedaPrecio: row['Tipo de moneda'],
                    precioVenta: row['Precio venta'],
                    monedaPrecioVenta: row['Tipo de moneda_1'], // xlsx handles duplicate headers by appending _1
                    comisionTotal: row['Comisión Total'],

                    // Physical
                    ambientes: row['Ambientes'],
                    dormitorios: row['Dormitorios'],
                    cocheras: row['Cocheras'],
                    supCubierta: row['Sup. cubierta'],
                    supDescubierta: row['Sup. descubierta'],
                    supSemicubierta: row['Sup. semicubierta'],
                    terreno: row['Terreno'],
                    antiguedad: row['Antigüedad'],

                    // Owner
                    propietario: {
                        nombre: row['Nombre del dueño'],
                        email: row['Email del dueño'],
                        celular: row['Celular del dueño']
                    },

                    // Agent
                    agente: row['Nombre Agente'],
                    oficina: row['Nombre Oficina'],
                    pais: row['País'],

                    // Assign to current user if importing? Or try to match agent name?
                    // For now, let's assign to the importer for simplicity or leave null
                    assignedAgentId: req.user.id,

                    // Metadata for extra fields
                    metadata: {
                        origen: 'REMAX_EXCEL',
                        raw: row
                    },

                    // Title generation (simple logic)
                    titulo: `${row['Tipo de Propiedad'] || 'Propiedad'} en ${row['Barrio'] || row['Localidad'] || 'Venta'} - ${row['Ambientes'] || '?'} Amb`
                };

                // Check if exists
                const existingProp = PropertyModel.findById(mlsId);

                if (existingProp) {
                    // Update
                    PropertyModel.update(mlsId, mappedProp);
                    stats.updated++;
                } else {
                    // Create
                    PropertyModel.create(mappedProp);
                    stats.created++;
                }

            } catch (err) {
                console.error("Error processing row:", err);
                stats.errors++;
            }
        });

        res.json({
            ok: true,
            message: 'Importación completada',
            stats
        });

    } catch (error) {
        console.error("Import error:", error);
        res.status(500).json({ ok: false, message: 'Error interno al procesar el archivo.' });
    }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
    const oldProp = PropertyModel.findById(req.params.id);
    if (!oldProp) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });

    if (!canEditProperty(req.user, oldProp)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para editar esta propiedad" });
    }

    let updatedProp = { ...oldProp, ...req.body };

    // Prevent agents from changing assignment?
    if (req.user.role === ROLES.AGENTE) {
        updatedProp.assignedAgentId = oldProp.assignedAgentId; // Force keep original assignment
    }

    // 1. Procesar recordatorios de feedback
    const calendarUpdates = await handlePropertyFeedback(oldProp, updatedProp);

    // 2. Actualizar ID de evento
    if (calendarUpdates.feedbackCalendarEventId !== undefined) {
        updatedProp.feedbackCalendarEventId = calendarUpdates.feedbackCalendarEventId;
    }

    // 3. Guardar
    updatedProp = PropertyModel.update(req.params.id, updatedProp);

    res.json({ ok: true, message: 'Propiedad actualizada', data: updatedProp });
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
    const prop = PropertyModel.findById(req.params.id);
    if (!prop) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });

    if (!canEditProperty(req.user, prop)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar esta propiedad" });
    }

    PropertyModel.delete(req.params.id);
    res.json({ ok: true, message: 'Propiedad eliminada' });
});

module.exports = router;
