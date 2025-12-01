const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/documents.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readDocuments() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeDocuments(docs) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2));
}

const DocumentModel = {
    findAll: () => {
        const docs = readDocuments();
        return docs.map(doc => {
            // Ensure timestamps
            if (!doc.createdAt) doc.createdAt = doc.date ? new Date(doc.date).toISOString() : new Date().toISOString();
            if (!doc.updatedAt) doc.updatedAt = doc.createdAt;

            // Ensure agentUserId
            if (typeof doc.agentUserId === "undefined") {
                doc.agentUserId = null;
            }

            // Ensure signature object
            if (!doc.signature) {
                doc.signature = {
                    enabled: false,
                    status: null,
                    provider: null,
                    requestId: null,
                    requestedBy: null,
                    requestedAt: null,
                    approvedBy: null,
                    approvedAt: null,
                    signedAt: null
                };
            } else {
                // Ensure new signature fields exist if signature object exists
                if (typeof doc.signature.requestedBy === "undefined") doc.signature.requestedBy = null;
                if (typeof doc.signature.requestedAt === "undefined") doc.signature.requestedAt = null;
                if (typeof doc.signature.approvedBy === "undefined") doc.signature.approvedBy = null;
                if (typeof doc.signature.approvedAt === "undefined") doc.signature.approvedAt = null;
            }
            return doc;
        });
    },
    findById: (id) => {
        const doc = readDocuments().find(d => d.id == id);
        if (doc) {
            // Ensure defaults on findById as well
            if (!doc.createdAt) doc.createdAt = doc.date ? new Date(doc.date).toISOString() : new Date().toISOString();
            if (!doc.updatedAt) doc.updatedAt = doc.createdAt;

            if (typeof doc.agentUserId === "undefined") {
                doc.agentUserId = null;
            }

            if (!doc.signature) {
                doc.signature = {
                    enabled: false,
                    status: null,
                    provider: null,
                    requestId: null,
                    requestedBy: null,
                    requestedAt: null,
                    approvedBy: null,
                    approvedAt: null,
                    signedAt: null
                };
            } else {
                if (typeof doc.signature.requestedBy === "undefined") doc.signature.requestedBy = null;
                if (typeof doc.signature.requestedAt === "undefined") doc.signature.requestedAt = null;
                if (typeof doc.signature.approvedBy === "undefined") doc.signature.approvedBy = null;
                if (typeof doc.signature.approvedAt === "undefined") doc.signature.approvedAt = null;
            }
        }
        return doc;
    },
    create: (doc) => {
        const docs = readDocuments();
        // Ensure defaults on create
        if (!doc.createdAt) doc.createdAt = new Date().toISOString();
        if (!doc.updatedAt) doc.updatedAt = doc.createdAt;

        if (typeof doc.agentUserId === "undefined") {
            doc.agentUserId = null;
        }

        if (!doc.signature) {
            doc.signature = {
                enabled: false,
                status: null,
                provider: null,
                requestId: null,
                requestedBy: null,
                requestedAt: null,
                approvedBy: null,
                approvedAt: null,
                signedAt: null
            };
        }
        docs.push(doc);
        writeDocuments(docs);
        return doc;
    },
    update: (id, updates) => {
        let docs = readDocuments();
        let updatedDoc = null;
        docs = docs.map(d => {
            if (d.id == id) {
                // Deep merge signature if present in updates
                let newSignature = d.signature;
                if (updates.signature) {
                    newSignature = { ...d.signature, ...updates.signature };
                }

                updatedDoc = {
                    ...d,
                    ...updates,
                    signature: newSignature,
                    updatedAt: new Date().toISOString()
                };
                return updatedDoc;
            }
            return d;
        });
        if (updatedDoc) {
            writeDocuments(docs);
        }
        return updatedDoc;
    },
    delete: (id) => {
        let docs = readDocuments();
        const initialLength = docs.length;
        docs = docs.filter(d => d.id != id);
        if (docs.length !== initialLength) {
            writeDocuments(docs);
            return true;
        }
        return false;
    },
    setAll: (docs) => {
        writeDocuments(docs);
    }
};

module.exports = DocumentModel;
