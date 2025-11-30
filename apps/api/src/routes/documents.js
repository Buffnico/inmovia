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

// Helper: Convert DOCX file to PDF Buffer
async function convertDocxFileToPdfBuffer(filePath) {
    const libre = require('libreoffice-convert');
    const util = require('util');
    const convertAsync = util.promisify(libre.convert);

    if (!fs.existsSync(filePath)) {
        throw new Error("File not found for conversion: " + filePath);
    }

    const docxBuf = fs.readFileSync(filePath);
    // Using undefined for filter allows libreoffice to auto-detect or use default
    return await convertAsync(docxBuf, '.pdf', undefined);
}

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

    // 1. Fix missing IDs
    docs = docs.map(d => {
        if (!d.id) {
            d.id = Date.now().toString() + Math.floor(Math.random() * 1000);
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

    // If we filtered out any documents or added IDs, update the JSON
    if (changed) {
        console.log("🔄 documents.json normalizado: se actualizaron registros (IDs o Ghosts).");
        DocumentModel.setAll(validDocs);
    }

    res.json({ ok: true, data: validDocs });
});

// POST /api/documents (Upload normal document)
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, message: "No se ha subido ningún archivo." });
    }

    const newDoc = {
        id: Date.now().toString(), // Simple ID generation
        name: req.body.name || req.file.originalname,
        category: req.body.category || 'General',
        type: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
        size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
        date: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        status: 'pendiente', // Default status
        filePath: req.file.path,
        uploadedBy: req.user.id,
        createdAt: new Date().toISOString()
    };

    DocumentModel.create(newDoc);
    res.json({ ok: true, message: "Documento subido", data: newDoc });
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
                const pdfBuf = await convertDocxFileToPdfBuffer(doc.filePath);
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
        const content = fs.readFileSync(model.filePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const dataMap = {};

        if (datosManual) {
            Object.assign(dataMap, datosManual);
            if (datosManual.otrosCampos) {
                Object.assign(dataMap, datosManual.otrosCampos);
            }
        }

        if (contactId) {
            // TODO: Fetch contact from ContactModel
        }

        if (Array.isArray(clausulasPersonalizadas) && clausulasPersonalizadas.length > 0) {
            dataMap.clausulas_extra = clausulasPersonalizadas.join('\n\n');
            clausulasPersonalizadas.forEach((texto, index) => {
                dataMap[`clausula_${index + 1}`] = texto;
            });
        } else {
            dataMap.clausulas_extra = "";
        }

        if (!dataMap.fechaHoy) {
            dataMap.fechaHoy = new Date().toLocaleDateString('es-AR');
        }

        doc.render(dataMap);

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        const safeName = (model.name || 'documento').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (formato === 'pdf') {
            try {
                const libre = require('libreoffice-convert');
                const util = require('util');
                const convertAsync = util.promisify(libre.convert);

                const pdfBuf = await convertAsync(buf, '.pdf', undefined);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="Generado_${safeName}.pdf"`);
                return res.send(pdfBuf);

            } catch (err) {
                console.error("Error converting DOCX to PDF:", err);
            }
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="Generado_${safeName}.docx"`);
        res.send(buf);

    } catch (error) {
        console.error("Error generating document:", error);

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
                const pdfBuf = await convertDocxFileToPdfBuffer(model.filePath);
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
