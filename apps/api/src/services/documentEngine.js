const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const libre = require('libreoffice-convert');
const util = require('util');
const convertAsync = util.promisify(libre.convert);

// --- Concurrency Limiter for LibreOffice ---
const MAX_CONCURRENT_CONVERSIONS = 2;
let activeConversions = 0;
const conversionQueue = [];

/**
 * Ejecuta una tarea (conversión) respetando el límite de concurrencia.
 * @param {Function} task - Función async que devuelve una promesa.
 * @returns {Promise<any>}
 */
async function runWithLimit(task) {
    if (activeConversions >= MAX_CONCURRENT_CONVERSIONS) {
        console.log(`[DocumentEngine] Cola llena (${activeConversions}/${MAX_CONCURRENT_CONVERSIONS}). Encolando tarea...`);
        return new Promise((resolve, reject) => {
            conversionQueue.push({ task, resolve, reject });
        });
    }
    return executeTask(task);
}

async function executeTask(task) {
    activeConversions++;
    try {
        return await task();
    } finally {
        activeConversions--;
        if (conversionQueue.length > 0) {
            const next = conversionQueue.shift();
            // Ejecutamos la siguiente tarea sin esperar (fire and forget para el loop, pero conectando promesas)
            executeTask(next.task)
                .then(next.resolve)
                .catch(next.reject);
        }
    }
}

// --- Helpers ---

/**
 * Convierte un buffer DOCX a PDF usando LibreOffice (con cola).
 * @param {Buffer} docxBuffer 
 * @returns {Promise<Buffer>}
 */
/**
 * Convierte un buffer DOCX a PDF usando LibreOffice (con cola).
 * @param {Buffer} docxBuffer 
 * @returns {Promise<Buffer>}
 */
async function convertDocxBufferToPdf(docxBuffer) {
    return runWithLimit(async () => {
        // undefined filter allows auto-detection
        const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);

        // Validate PDF signature
        if (!pdfBuffer || pdfBuffer.length < 4 || pdfBuffer.slice(0, 4).toString() !== "%PDF") {
            const err = new Error("PDF_SIGNATURE_INVALID");
            err.code = "CONVERT_ERROR";
            throw err;
        }

        return pdfBuffer;
    });
}

/**
 * Construye el mapa de datos para Docxtemplater.
 */
function buildDataMap(datosManual, clausulasPersonalizadas) {
    const dataMap = {};

    if (datosManual) {
        Object.assign(dataMap, datosManual);
        if (datosManual.otrosCampos) {
            Object.assign(dataMap, datosManual.otrosCampos);
        }
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

    return dataMap;
}

// --- Public API ---

/**
 * Genera un documento a partir de un modelo de oficina.
 * 
 * @param {Object} options
 * @param {Object} options.model        // officeModel (incluye filePath, name, etc.)
 * @param {Object} options.datosManual  // campos enviados desde el wizard/Ivo-t
 * @param {string[]} options.clausulasPersonalizadas
 * @param {"docx"|"pdf"} options.formato
 * 
 * @returns {Promise<{ buffer: Buffer, mimeType: string, fileName: string }>}
 */
async function generateFromOfficeModel({ model, datosManual, clausulasPersonalizadas, formato }) {
    if (!model || !model.filePath) {
        throw new Error("Modelo inválido o sin filePath.");
    }

    if (!fs.existsSync(model.filePath)) {
        throw new Error("Archivo base no encontrado en servidor.");
    }

    // 1. Leer y renderizar DOCX
    const content = fs.readFileSync(model.filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
    });

    const dataMap = buildDataMap(datosManual, clausulasPersonalizadas);

    try {
        doc.render(dataMap);
    } catch (error) {
        // Handle docxtemplater errors
        if (error.properties && error.properties.errors) {
            const errorMessages = error.properties.errors.map(e => {
                // If it's a tag error, give more context
                if (e.properties && e.properties.explanation) {
                    return e.properties.explanation;
                }
                return e.message;
            }).join(", ");
            console.error("[DocumentEngine] Template render error:", errorMessages);
            const err = new Error("Error en la plantilla del documento: " + errorMessages);
            err.code = "TEMPLATE_ERROR";
            err.details = errorMessages;
            throw err;
        }
        throw error;
    }

    const docxBuf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });

    const safeName = (model.name || 'documento').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // 2. Si el formato es DOCX, devolver directamente
    if (formato === 'docx') {
        return {
            buffer: docxBuf,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileName: `Generado_${safeName}.docx`
        };
    }

    // 3. Si es PDF, convertir
    if (formato === 'pdf') {
        try {
            const pdfBuf = await convertDocxBufferToPdf(docxBuf);
            return {
                buffer: pdfBuf,
                mimeType: 'application/pdf',
                fileName: `Generado_${safeName}.pdf`
            };
        } catch (err) {
            console.error("[DocumentEngine] Error converting DOCX to PDF:", err);
            const wrapped = new Error(err.message || "Error al convertir a PDF");
            wrapped.code = "CONVERT_ERROR";
            throw wrapped;
        }
    }

    // 4. Fallback por seguridad (si formato desconocido)
    return {
        buffer: docxBuf,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileName: `Generado_${safeName}.docx`
    };
}

/**
 * Helper para convertir un archivo DOCX en disco a PDF Buffer (para Previews).
 * @param {string} filePath 
 * @returns {Promise<Buffer>}
 */
async function convertDocxFileToPdf(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File not found: " + filePath);
    }
    const docxBuf = fs.readFileSync(filePath);
    return await convertDocxBufferToPdf(docxBuf);
}

module.exports = {
    generateFromOfficeModel,
    convertDocxFileToPdf
};
