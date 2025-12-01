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
const DocumentEngine = require('../services/documentEngine');

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

const DocumentModel = require('../models/documentModel');

// --- Normal Documents Routes ---

// GET /api/documents
router.get('/', (req, res) => {
    // Auto-cleanup ghost documents AND fix missing IDs
    let docs = DocumentModel.findAll();
    let changed = false;

    // 1. Fix missing IDs and migrate legacy docs to current user
    docs = docs.map(d => {
        if (!d.id) {
            d.id = Date.now().toString() + Math.floor(Math.random() * 1000);
            changed = true;
        }
        // Migration: If no owner, assign to current user (so they don't disappear)
        if (!d.ownerUserId) {
            d.ownerUserId = req.user.id;
            changed = true;
        }
        return d;
    });

    // 2. Filter ghosts
    const validDocs = docs.filter(doc => {
        // Keep only if filePath is defined AND file exists
        return doc.filePath && fs.existsSync(doc.filePath);
    });

    if (validDocs.length !== docs.length) {
        console.log(`Auto-cleaned ${docs.length - validDocs.length} ghost documents.`);
        changed = true;
    }

    // If we filtered out any documents or added IDs/owners, update the JSON
    if (changed) {
        console.log("🔄 documents.json normalizado: se actualizaron registros (IDs, Ghosts o Owners).");
        DocumentModel.setAll(validDocs);
    }

    // 3. Filter by Owner (Personal Documents)
    const userDocs = validDocs.filter(d => d.ownerUserId === req.user.id);

    // 4. Populate Property Info
    const PropertyModel = require('../models/propertyModel');
    const enrichedDocs = userDocs.map(doc => {
        if (doc.propertyId) {
            const prop = PropertyModel.findById(doc.propertyId);
            if (prop) {
                doc.property = `[${prop.code}] ${prop.address}`;
            }
        }
        return doc;
    });

    res.json({ ok: true, data: enrichedDocs });
});


// GET /api/documents/:id/preview
router.get('/:id/preview', async (req, res) => {
    try {
        const doc = DocumentModel.findById(req.params.id);
        if (!doc) return res.status(404).json({ ok: false, message: "Documento no encontrado" });

        if (!fs.existsSync(doc.filePath)) {
            return res.status(404).json({ ok: false, message: "Archivo no encontrado en disco." });
        }

        const ext = path.extname(doc.filePath).toLowerCase();

        // If DOCX, try to convert to PDF for preview
        if (ext === '.docx') {
            try {
                const pdfBuf = await DocumentEngine.convertDocxFileToPdf(doc.filePath);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${(doc.name || 'document').replace('.docx', '')}.pdf"`);
                return res.send(pdfBuf);
            } catch (err) {
                console.error("Preview DOCX->PDF failed, sending DOCX fallback:", err.message);
                // Fallback to sending original file
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${doc.name || 'document.docx'}"`);
                const stream = fs.createReadStream(doc.filePath);
                return stream.pipe(res);
            }
        }

        // Set Content-Type for other files
        if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${doc.name || 'document.pdf'}"`);
        } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            res.setHeader('Content-Type', 'image/' + ext.replace('.', ''));
            res.setHeader('Content-Disposition', `inline; filename="${doc.name || 'image' + ext}"`);
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${doc.name || 'file' + ext}"`);
        }

        const stream = fs.createReadStream(doc.filePath);
        stream.pipe(res);
    } catch (error) {
        console.error("Error in GET /documents/:id/preview:", error);
        res.status(500).json({ message: "Error generating preview" });
    }
});

// PATCH /api/documents/:id/approve-signature
router.patch('/:id/approve-signature', (req, res) => {
    const role = (req.user.role || "").toUpperCase();
    const canSendToSignature = ["OWNER", "ADMIN", "MARTILLERO", "RECEPCIONISTA"].includes(role);

    if (!canSendToSignature) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para aprobar firmas." });
    }

    const doc = DocumentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Documento no encontrado" });

    if (!doc.signature || !doc.signature.enabled || doc.signature.status !== 'SOLICITADO') {
        return res.status(400).json({ ok: false, message: "El documento no está en estado SOLICITADO." });
    }

    const updates = {
        signature: {
            ...doc.signature,
            status: 'PENDIENTE',
            approvedBy: req.user.id,
            approvedAt: new Date().toISOString()
        }
    };

    const updatedDoc = DocumentModel.update(req.params.id, updates);
    res.json({ success: true, document: updatedDoc });
});

// PATCH /api/documents/:id/mark-signed
router.patch('/:id/mark-signed', (req, res) => {
    const role = (req.user.role || "").toUpperCase();
    const canSendToSignature = ["OWNER", "ADMIN", "MARTILLERO", "RECEPCIONISTA"].includes(role);

    if (!canSendToSignature) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para marcar como firmado." });
    }

    const doc = DocumentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Documento no encontrado" });

    // Only allow if PENDIENTE
    if (doc.signature?.status !== 'PENDIENTE') {
        return res.status(400).json({ ok: false, message: "El documento debe estar PENDIENTE para marcarlo como firmado." });
    }

    // Update signature status
    const updates = {
        signature: {
            ...doc.signature,
            enabled: true,
            status: 'FIRMADO',
            signedAt: new Date().toISOString()
        }
    };

    const updatedDoc = DocumentModel.update(req.params.id, updates);
    res.json({ success: true, document: updatedDoc });
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
    console.log("DELETE /documents hit with ID:", req.params.id);
    const doc = DocumentModel.findById(req.params.id);

    // Idempotent: If not found, consider it success
    if (!doc) {
        console.warn("DELETE /documents: registro no encontrado, se considera ya eliminado", req.params.id);
        return res.json({ success: true, alreadyRemoved: true });
    }

    // Try to delete file but don't fail if missing
    if (doc.filePath) {
        try {
            if (fs.existsSync(doc.filePath)) {
                await fs.promises.unlink(doc.filePath);
            } else {
                console.warn("Archivo no encontrado en disco, se eliminará solo el registro:", doc.filePath);
            }
        } catch (e) {
            console.error("Error deleting file:", e);
        }
    }

    DocumentModel.delete(req.params.id);
    res.json({ success: true, alreadyRemoved: false });
});

// --- Office Models Routes ---

// GET /api/documents/office-models
router.get('/office-models', (req, res) => {
    if (!canUseOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para ver modelos." });
    }

    // Auto-cleanup ghost models AND fix missing IDs
    let models = OfficeModel.findAll();
    let changed = false;

    // 1. Fix missing IDs
    models = models.map(m => {
        if (!m.id) {
            m.id = Date.now().toString() + Math.floor(Math.random() * 1000);
            changed = true;
        }
        return m;
    });

    // 2. Filter ghosts
    const validModels = models.filter(m => {
        // Keep only if filePath is defined AND file exists
        return m.filePath && fs.existsSync(m.filePath);
    });

    if (validModels.length !== models.length) {
        console.log(`Auto-cleaned ${models.length - validModels.length} ghost office models.`);
        changed = true;
    }

    if (changed) {
        console.log("🔄 officeModels.json normalizado: se actualizaron registros (IDs o Ghosts).");
        OfficeModel.setAll(validModels);
    }

    res.json({ ok: true, data: validModels });
});

// POST /api/documents/office-models
router.post('/office-models', upload.single('file'), (req, res) => {
    console.log("POST /office-models hit");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (!canManageOfficeModels(req.user)) {
        console.error("Permission denied for user:", req.user.id);
        return res.status(403).json({ ok: false, message: "No tienes permiso para crear modelos." });
    }

    if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({ ok: false, message: "No se ha subido ningún archivo." });
    }

    const newModel = {
        id: Date.now().toString(),
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
router.delete('/office-models/:id', async (req, res) => {
    console.log("DELETE /office-models hit with ID:", req.params.id);
    if (!canManageOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar modelos." });
    }

    const model = OfficeModel.findById(req.params.id);

    // Idempotent: If not found, consider it success
    if (!model) {
        console.warn("DELETE /office-models: registro no encontrado, se considera ya eliminado", req.params.id);
        return res.json({ success: true, alreadyRemoved: true });
    }

    console.log(`Deleting model: ${model.name} (${model.id})`);

    if (model.filePath) {
        try {
            if (fs.existsSync(model.filePath)) {
                await fs.promises.unlink(model.filePath);
                console.log(`Deleted file: ${model.filePath}`);
            } else {
                console.warn(`File not found for deletion: ${model.filePath}`);
            }
        } catch (e) { console.error("Error deleting file", e); }
    }

    OfficeModel.delete(req.params.id);
    res.json({ success: true, alreadyRemoved: false });
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
        const result = await DocumentEngine.generateFromOfficeModel({
            model,
            datosManual,
            clausulasPersonalizadas,
            formato
        });

        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        res.send(result.buffer);

    } catch (error) {
        console.error("Error generating document:", error);

        if (error.code === 'TEMPLATE_ERROR') {
            return res.status(400).json({
                ok: false,
                message: "La plantilla Word tiene errores en los placeholders {{ }}. Revisá el archivo en Word.",
                details: error.details || null
            });
        }

        if (error.code === 'CONVERT_ERROR') {
            return res.status(500).json({
                ok: false,
                message: "No se pudo convertir el documento a PDF. Intentá de nuevo o generá la versión en Word (DOCX)."
            });
        }

        res.status(500).json({ ok: false, message: "Error interno al generar el documento: " + error.message });
    }
});

// GET /api/documents/office-models/:id/placeholders
router.get('/office-models/:id/placeholders', (req, res) => {
    if (!canUseOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para ver detalles de modelos." });
    }

    const model = OfficeModel.findById(req.params.id);
    if (!model) return res.status(404).json({ ok: false, message: "Modelo no encontrado" });

    if (!fs.existsSync(model.filePath)) {
        return res.status(404).json({ ok: false, message: "Archivo de modelo no encontrado en disco." });
    }

    try {
        const content = fs.readFileSync(model.filePath, "binary");
        const zip = new PizZip(content);

        // Use regex directly on the full text content to avoid docxtemplater parsing errors during extraction
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{{', end: '}}' }
        });

        // We try to get full text, but if docxtemplater fails, we might need to fallback or just use the regex on the raw XML content if possible.
        // However, doc.getFullText() relies on parsing.
        // Let's try to just read the zip content files if doc.getFullText() fails, OR just accept that we need to parse it.
        // Actually, the user asked to use regex to find tags.
        // Let's try to use the regex on the text returned by getFullText().
        // If getFullText() throws (due to bad tags), we catch it.

        let text = "";
        try {
            text = doc.getFullText();
        } catch (e) {
            console.warn("Docxtemplater failed to parse text, trying to extract from raw XML content...");
            // Fallback: Read 'word/document.xml' from zip
            try {
                text = zip.file("word/document.xml").asText();
            } catch (zipErr) {
                console.error("Failed to read document.xml", zipErr);
                throw e;
            }
        }

        // Regex to find {{variable}} patterns
        // User suggested: /{{\s*([^}]+?)\s*}}/g
        const regex = /{{\s*([^}]+?)\s*}}/g;
        const matches = [...text.matchAll(regex)];

        const placeholders = [...new Set(matches.map(m => {
            // m[1] is the captured group (the variable name)
            return m[1].trim();
        }))];

        const filtered = placeholders.filter(p =>
            p &&
            p !== "clausulas_extra" &&
            !p.startsWith("clausula_") &&
            p !== "fechaHoy"
        );

        res.json({
            ok: true,
            modelId: model.id,
            placeholders: filtered
        });
    } catch (error) {
        console.error("Error extracting placeholders:", error);
        // Don't fail hard, just return empty placeholders if something is really wrong
        res.json({ ok: true, modelId: model.id, placeholders: [], warning: "No se pudieron extraer placeholders automáticos." });
    }
});

// GET /api/documents/office-models/:id/preview
router.get('/office-models/:id/preview', async (req, res) => {
    try {
        const model = OfficeModel.findById(req.params.id);
        if (!model) {
            return res.status(404).json({ ok: false, message: "Modelo no encontrado" });
        }

        if (!fs.existsSync(model.filePath)) {
            return res.status(404).json({ ok: false, message: "Archivo de modelo no encontrado en disco." });
        }

        const ext = path.extname(model.filePath).toLowerCase();

        // If DOCX, convert to PDF for preview
        if (ext === '.docx') {
            try {
                const pdfBuf = await DocumentEngine.convertDocxFileToPdf(model.filePath);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${(model.name || 'model').replace('.docx', '')}.pdf"`);
                return res.send(pdfBuf);
            } catch (err) {
                console.error("Preview DOCX->PDF failed, sending DOCX fallback:", err.message);
                // Fallback to sending original file if conversion fails
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${model.name || 'model.docx'}"`);
                const stream = fs.createReadStream(model.filePath);
                return stream.pipe(res);
            }
        }

        // Other types
        if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${model.name || 'model.pdf'}"`);
        } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            res.setHeader('Content-Type', 'image/' + ext.replace('.', ''));
            res.setHeader('Content-Disposition', `inline; filename="${model.name || 'image' + ext}"`);
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${model.name || 'model' + ext}"`);
        }

        const stream = fs.createReadStream(model.filePath);
        stream.pipe(res);
    } catch (error) {
        console.error("Error in GET /office-models/:id/preview:", error);
        res.status(500).json({ message: "Error generating preview" });
    }
});

// POST /api/documents/office-models/cleanup
router.post('/office-models/cleanup', (req, res) => {
    if (!canManageOfficeModels(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para limpiar modelos." });
    }

    const models = OfficeModel.findAll();
    let removedCount = 0;
    const removedIds = [];

    models.forEach(model => {
        if (!model.filePath || !fs.existsSync(model.filePath)) {
            OfficeModel.delete(model.id);
            removedCount++;
            removedIds.push(model.id);
        }
    });

    console.log(`Cleanup: Removed ${removedCount} orphan models: ${removedIds.join(', ')}`);
    res.json({ ok: true, message: `Limpieza completada. Se eliminaron ${removedCount} modelos huérfanos.`, removedCount, removedIds });
});

module.exports = router;
