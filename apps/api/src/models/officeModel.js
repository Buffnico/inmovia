const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/officeModels.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readModels() {
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

function writeModels(models) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(models, null, 2));
}

const OfficeModel = {
    findAll: () => readModels(),
    findById: (id) => readModels().find(m => m.id === id),
    create: (model) => {
        const models = readModels();
        models.push(model);
        writeModels(models);
        return model;
    },
    update: (id, updates) => {
        const models = readModels();
        const index = models.findIndex(m => m.id === id);
        if (index === -1) return null;

        models[index] = { ...models[index], ...updates, updatedAt: new Date().toISOString() };
        writeModels(models);
        return models[index];
    },
    delete: (id) => {
        let models = readModels();
        const initialLength = models.length;
        models = models.filter(m => m.id !== id);
        if (models.length !== initialLength) {
            writeModels(models);
            return true;
        }
        return false;
    }
};

module.exports = OfficeModel;
