const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/properties.json');

function readProperties() {
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

function writeProperties(props) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(props, null, 2));
}

const PropertyModel = {
    findAll: () => readProperties(),
    findById: (id) => readProperties().find(p => p.id === id),
    findByContactId: (contactId) => readProperties().filter(p => p.contactId === contactId),
    create: (prop) => {
        const props = readProperties();
        props.push(prop);
        writeProperties(props);
        return prop;
    },
    update: (id, updates) => {
        const props = readProperties();
        const index = props.findIndex(p => p.id === id);
        if (index === -1) return null;

        props[index] = { ...props[index], ...updates };
        writeProperties(props);
        return props[index];
    },
    delete: (id) => {
        let props = readProperties();
        const initialLength = props.length;
        props = props.filter(p => p.id !== id);
        if (props.length !== initialLength) {
            writeProperties(props);
            return true;
        }
        return false;
    }
};

module.exports = PropertyModel;
