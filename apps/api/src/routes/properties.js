const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { handlePropertyFeedback } = require('../services/propertyFeedbackService');

// Configure Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

const { canReadProperty, canEditProperty, ROLES } = require('../utils/permissions');

// --- MOCK DATABASE (In-Memory) ---
let properties = [
    {
        id: "p1",
        titulo: "Depto 3 amb premium",
        direccion: "Lomas de Zamora",
        estado: "Activa",
        agente: "Nicolás",
        assignedAgentId: "agente1", // Mock ID for testing
        cliente: { nombre: "María Pérez", dni: "12345678", email: "maria@example.com" },
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
        assignedAgentId: "agente2", // Mock ID for testing
        cliente: { nombre: "Carlos Gómez" },
        contactId: "c2",
        recordarFeedback: false,
        frecuenciaFeedbackDias: 15,
        feedbackCalendarEventId: null
    },
];

// GET /api/properties - List all properties
router.get('/', (req, res) => {
    // Filter properties based on user role
    const visibleProperties = properties.filter(p => canReadProperty(req.user, p));

    res.json({
        ok: true,
        data: visibleProperties
    });
});

// GET /api/properties/:id - Get property by ID
router.get('/:id', (req, res) => {
    const prop = properties.find(p => p.id === req.params.id);
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

    properties.push(newProp);
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
                const existingIndex = properties.findIndex(p => p.mlsid === mlsId);

                if (existingIndex >= 0) {
                    // Update
                    properties[existingIndex] = { ...properties[existingIndex], ...mappedProp };
                    stats.updated++;
                } else {
                    // Create
                    properties.push(mappedProp);
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
    const index = properties.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });

    const oldProp = { ...properties[index] };

    if (!canEditProperty(req.user, oldProp)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para editar esta propiedad" });
    }

    const updatedProp = { ...oldProp, ...req.body };

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
    properties[index] = updatedProp;

    res.json({ ok: true, message: 'Propiedad actualizada', data: updatedProp });
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
    const prop = properties.find(p => p.id === req.params.id);
    if (!prop) return res.status(404).json({ ok: false, message: "Propiedad no encontrada" });

    if (!canEditProperty(req.user, prop)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar esta propiedad" });
    }

    properties = properties.filter(p => p.id !== req.params.id);
    res.json({ ok: true, message: 'Propiedad eliminada' });
});

module.exports = router;
