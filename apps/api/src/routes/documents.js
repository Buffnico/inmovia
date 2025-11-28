const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const OfficeModel = require('../models/officeModel');
const { canManageOfficeModels, canUseOfficeModels } = require('../utils/permissions');
const { authRequired } = require('../middleware/authMiddleware');

// Configure Multer for uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../data/uploads/models');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Apply auth middleware to all routes in this router
router.use(authRequired);

// --- Office Models Routes ---

// GET /api/documents/office-models
router.get('/office-models', (req, res) => {
    if (!canUseOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para ver modelos." });
    }
    const models = OfficeModel.findAll();
    // Filter by officeId if we had multi-tenant, for now return all
    res.json({ ok: true, data: models });
});

// PUT /api/documents/office-models/:id
router.put('/office-models/:id', upload.single('file'), (req, res) => {
    if (!canManageOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para editar modelos." });
    }

    const model = OfficeModel.findById(req.params.id);
    if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

    const updates = {
        name: req.body.name || model.name,
        description: req.body.description || model.description,
        updatedBy: req.user.id
    };

    if (req.file) {
        // Delete old file if exists? Maybe keep for history.
        updates.filePath = req.file.path;
    }

    const updated = OfficeModel.update(req.params.id, updates);
    res.json({ ok: true, message: "Modelo actualizado", data: updated });
});

// DELETE /api/documents/office-models/:id
router.delete('/office-models/:id', (req, res) => {
    if (!canManageOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar modelos." });
    }

    // Optionally delete file from disk
    const model = OfficeModel.findById(req.params.id);
    if (model && fs.existsSync(model.filePath)) {
        try {
            fs.unlinkSync(model.filePath);
        } catch (e) { console.error("Error deleting file", e); }
    }

    OfficeModel.delete(req.params.id);
    res.json({ ok: true, message: "Modelo eliminado" });
});

// POST /api/documents/office-models/:id/generate
// POST /api/documents/office-models/:id/generate
router.post('/office-models/:id/generate', (req, res) => {
    if (!canUseOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para usar modelos." });
    }

    const model = OfficeModel.findById(req.params.id);
    if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

    const { formato, contactId, datosManual, clausulasPersonalizadas } = req.body;

    if (!fs.existsSync(model.filePath)) {
        return res.status(404).json({ ok: false, message: "Archivo base no encontrado en servidor" });
    }

    try {
        // 1. Read file
        const content = fs.readFileSync(model.filePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // 2. Construct Data Map
        const dataMap = {};

        // a. Merge datosManual (flattened if needed, but simple merge is usually enough)
        if (datosManual) {
            Object.assign(dataMap, datosManual);
            if (datosManual.otrosCampos) {
                Object.assign(dataMap, datosManual.otrosCampos);
            }
        }

        // b. Add Contact Data (Placeholder for future integration)
        if (contactId) {
            // TODO: Fetch contact from ContactModel
            // const contact = ContactModel.findById(contactId);
            // if (contact) {
            //     dataMap.contact_nombre = contact.nombre + ' ' + contact.apellido;
            //     dataMap.contact_email = contact.emailPrincipal;
            //     dataMap.contact_telefono = contact.telefonoPrincipal;
            //     dataMap.contact_direccion = contact.direccion;
            // }
        }

        // c. Add Custom Clauses
        if (Array.isArray(clausulasPersonalizadas) && clausulasPersonalizadas.length > 0) {
            dataMap.clausulas_extra = clausulasPersonalizadas.join('\n\n');
            clausulasPersonalizadas.forEach((texto, index) => {
                dataMap[`clausula_${index + 1}`] = texto;
            });
        } else {
            dataMap.clausulas_extra = "";
        }

        // GET /api/documents/office-models/:id/preview
        router.get('/office-models/:id/preview', (req, res) => {
            const model = OfficeModel.findById(req.params.id);
            if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

            // TODO: Convert DOCX to PDF or HTML for preview.
            // For now, serving the file directly. Browser might download it if it's DOCX.
            // Ideally we stream a PDF.

            if (fs.existsSync(model.filePath)) {
                const express = require('express');
                const router = express.Router();
                const multer = require('multer');
                const path = require('path');
                const fs = require('fs');
                const PizZip = require('pizzip');
                const Docxtemplater = require('docxtemplater');
                const OfficeModel = require('../models/officeModel');
                const { canManageOfficeModels, canUseOfficeModels } = require('../utils/permissions');
                const { authRequired } = require('../middleware/authMiddleware');

                // Configure Multer for uploads
                const storage = multer.diskStorage({
                    destination: function (req, file, cb) {
                        const dir = path.join(__dirname, '../data/uploads/models');
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }
                        cb(null, dir);
                    },
                    filename: function (req, file, cb) {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        cb(null, uniqueSuffix + path.extname(file.originalname));
                    }
                });

                const upload = multer({ storage: storage });

                // Apply auth middleware to all routes in this router
                router.use(authRequired);

                // --- Office Models Routes ---

                // GET /api/documents/office-models
                router.get('/office-models', (req, res) => {
                    if (!canUseOfficeModels(req.user)) {
                        return res.status(403).json({ ok: false, message: "No tienes permiso para ver modelos." });
                    }
                    const models = OfficeModel.findAll();
                    res.json({ ok: true, data: models });
                });

                // POST /api/documents/office-models
                router.post('/office-models', upload.single('file'), (req, res) => {
                    if (!canManageOfficeModels(req.user)) {
                        return res.status(403).json({ ok: false, message: "No tienes permiso para crear modelos." });
                    }

                    if (!req.file) {
                        return res.status(400).json({ ok: false, message: "No se ha subido ningún archivo." });
                    }

                    const newModel = {
                        name: req.body.name || req.file.originalname,
                        description: req.body.description || '',
                        filePath: req.file.path,
                        type: 'officeModel',
                        createdBy: req.user.id,
                        createdAt: new Date().toISOString()
                    };

                    OfficeModel.create(newModel);
                    res.json({ ok: true, message: "Modelo creado", data: newModel });
                });

                // PUT /api/documents/office-models/:id
                router.put('/office-models/:id', upload.single('file'), (req, res) => {
                    if (!canManageOfficeModels(req.user)) {
                        return res.status(403).json({ ok: false, message: "No tienes permiso para editar modelos." });
                    }

                    const model = OfficeModel.findById(req.params.id);
                    if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

                    const updates = {
                        name: req.body.name || model.name,
                        description: req.body.description || model.description,
                        updatedBy: req.user.id
                    };

                    if (req.file) {
                        // Delete old file if exists? Maybe keep for history.
                        if (model.filePath && fs.existsSync(model.filePath)) {
                            try {
                                fs.unlinkSync(model.filePath);
                            } catch (e) { console.error("Error deleting old file:", e); }
                        }
                        updates.filePath = req.file.path;
                    }

                    const updated = OfficeModel.update(req.params.id, updates);
                    res.json({ ok: true, message: "Modelo actualizado", data: updated });
                });

                // DELETE /api/documents/office-models/:id
                router.delete('/office-models/:id', (req, res) => {
                    if (!canManageOfficeModels(req.user)) {
                        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar modelos." });
                    }

                    // Optionally delete file from disk
                    const model = OfficeModel.findById(req.params.id);
                    if (model && fs.existsSync(model.filePath)) {
                        try {
                            fs.unlinkSync(model.filePath);
                        } catch (e) { console.error("Error deleting file", e); }
                    }

                    OfficeModel.delete(req.params.id);
                    res.json({ ok: true, message: "Modelo eliminado" });
                });

                // POST /api/documents/office-models/:id/generate
                router.post('/office-models/:id/generate', async (req, res) => {
                    if (!canUseOfficeModels(req.user)) {
                        return res.status(403).json({ ok: false, message: "No tienes permiso para usar modelos." });
                    }

                    const model = OfficeModel.findById(req.params.id);
                    if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

                    const { formato, contactId, datosManual, clausulasPersonalizadas } = req.body;

                    if (!fs.existsSync(model.filePath)) {
                        return res.status(404).json({ ok: false, message: "Archivo base no encontrado en servidor" });
                    }

                    try {
                        // 1. Read file
                        const content = fs.readFileSync(model.filePath, 'binary');
                        const zip = new PizZip(content);
                        const doc = new Docxtemplater(zip, {
                            paragraphLoop: true,
                            linebreaks: true,
                        });

                        // 2. Construct Data Map
                        const dataMap = {};

                        // a. Merge datosManual (flattened if needed, but simple merge is usually enough)
                        if (datosManual) {
                            Object.assign(dataMap, datosManual);
                            if (datosManual.otrosCampos) {
                                Object.assign(dataMap, datosManual.otrosCampos);
                            }
                        }

                        // b. Add Contact Data (Placeholder for future integration)
                        if (contactId) {
                            // TODO: Fetch contact from ContactModel
                            // const contact = ContactModel.findById(contactId);
                            // if (contact) {
                            //     dataMap.contact_nombre = contact.nombre + ' ' + contact.apellido;
                            //     dataMap.contact_email = contact.emailPrincipal;
                            //     dataMap.contact_telefono = contact.telefonoPrincipal;
                            //     dataMap.contact_direccion = contact.direccion;
                            // }
                        }

                        // c. Add Custom Clauses
                        if (Array.isArray(clausulasPersonalizadas) && clausulasPersonalizadas.length > 0) {
                            dataMap.clausulas_extra = clausulasPersonalizadas.join('\n\n');
                            clausulasPersonalizadas.forEach((texto, index) => {
                                dataMap[`clausula_${index + 1}`] = texto;
                            });
                        } else {
                            dataMap.clausulas_extra = "";
                        }

                        // d. Default Date if not present
                        if (!dataMap.fechaHoy) {
                            dataMap.fechaHoy = new Date().toLocaleDateString('es-AR');
                        }

                        // 3. Render
                        doc.render(dataMap);

                        // 4. Generate Output
                        const buf = doc.getZip().generate({
                            type: 'nodebuffer',
                            compression: 'DEFLATE',
                        });

                        const safeName = (model.name || 'documento').replace(/[^a-z0-9]/gi, '_').toLowerCase();

                        // 5. Send Response
                        if (formato === 'pdf') {
                            try {
                                // Convert DOCX buffer to PDF buffer
                                const libre = require('libreoffice-convert');
                                const util = require('util');
                                const convertAsync = util.promisify(libre.convert);

                                // Note: libreoffice-convert expects a buffer
                                // It requires libreoffice installed on the system
                                const pdfBuf = await convertAsync(buf, '.pdf', undefined);

                                res.setHeader('Content-Type', 'application/pdf');
                                res.setHeader('Content-Disposition', `attachment; filename="Generado_${safeName}.pdf"`);
                                return res.send(pdfBuf);

                            } catch (err) {
                                console.error("Error converting DOCX to PDF:", err);
                                // Fallback to DOCX if conversion fails
                            }
                        }

                        // Default: DOCX
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                        res.setHeader('Content-Disposition', `attachment; filename="Generado_${safeName}.docx"`);
                        res.send(buf);

                    } catch (error) {
                        console.error("Error generating document:", error);

                        // Handle docxtemplater specific errors
                        if (error.properties && error.properties.errors) {
                            const errorMessages = error.properties.errors.map(e => e.properties.explanation).join(", ");
                            return res.status(400).json({
                                ok: false,
                                message: "Error en la plantilla del documento: " + errorMessages
                            });
                        }

                        res.status(500).json({ ok: false, message: "Error interno al generar el documento." });
                    }
                });

                // GET /api/documents/office-models/:id/preview
                router.get('/office-models/:id/preview', (req, res) => {
                    const model = OfficeModel.findById(req.params.id);
                    if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

                    // TODO: Convert DOCX to PDF or HTML for preview.
                    // For now, serving the file directly. Browser might download it if it's DOCX.
                    // Ideally we stream a PDF.

                    if (fs.existsSync(model.filePath)) {
                        res.sendFile(model.filePath);
                    } else {
                        res.status(404).json({ ok: false, message: "Archivo de modelo no encontrado." });
                    }
                });

                // GET /api/documents/:id - Get document by ID
                router.get('/:id', (req, res) => {
                    res.json({
                        ok: true,
                        message: 'Document detail (placeholder)',
                        data: { id: req.params.id }
                    });
                });

                // DELETE /api/documents/:id - Delete document
                router.delete('/:id', (req, res) => {
                    res.json({
                        ok: true,
                        message: 'Document deleted (placeholder)'
                    });
                });

                module.exports = router;
