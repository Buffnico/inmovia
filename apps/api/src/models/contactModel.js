const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/contacts.json');

function readContacts() {
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

function writeContacts(contacts) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
}

const ContactModel = {
    findAll: () => readContacts(),
    findById: (id) => readContacts().find(c => c.id === id),
    findByEmail: (email) => {
        if (!email) return null;
        return readContacts().find(c => c.emailPrincipal && c.emailPrincipal.toLowerCase() === email.toLowerCase());
    },
    findByPhone: (phone) => {
        if (!phone) return null;
        // Basic normalization could happen here
        return readContacts().find(c => c.telefonoPrincipal === phone);
    },
    create: (contact) => {
        const contacts = readContacts();
        contacts.push(contact);
        writeContacts(contacts);
        return contact;
    },
    update: (id, updates) => {
        const contacts = readContacts();
        const index = contacts.findIndex(c => c.id === id);
        if (index === -1) return null;

        contacts[index] = { ...contacts[index], ...updates };
        writeContacts(contacts);
        return contacts[index];
    },
    delete: (id) => {
        let contacts = readContacts();
        const initialLength = contacts.length;
        contacts = contacts.filter(c => c.id !== id);
        if (contacts.length !== initialLength) {
            writeContacts(contacts);
            return true;
        }
        return false;
    }
};

module.exports = ContactModel;
