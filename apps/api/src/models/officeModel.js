const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/officeConfig.json');

const DEFAULT_CONFIG = {
    officeName: "Inmovia Office",
    brandName: "Inmovia",
    officeAddress: "",
    officeCity: "",
    marketArea: "",
    defaultCurrency: "USD",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone: "America/Argentina/Buenos_Aires",
    branding: {
        primaryColor: "#0f172a",
        secondaryColor: "#3b82f6",
        logoUrl: ""
    },
    modules: {
        properties: true,
        agenda: true,
        contacts: true,
        whatsapp: true,
        edu: true,
        scanner: true,
        social: true,
        ivot: true
    }
};

function readConfig() {
    if (!fs.existsSync(DATA_FILE)) {
        return DEFAULT_CONFIG;
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return DEFAULT_CONFIG;
    }
}

function writeConfig(config) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(config, null, 2));
}

const OfficeModel = {
    get: () => readConfig(),
    update: (newConfig) => {
        const current = readConfig();
        const updated = { ...current, ...newConfig };
        writeConfig(updated);
        return updated;
    }
};

module.exports = OfficeModel;
