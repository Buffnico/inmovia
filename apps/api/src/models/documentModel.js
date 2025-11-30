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
    findAll: () => readDocuments(),
    findById: (id) => readDocuments().find(d => d.id == id),
    create: (doc) => {
        const docs = readDocuments();
        docs.push(doc);
        writeDocuments(docs);
        return doc;
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
