const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/chatConversations.json');

// Ensure file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readAll() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeAll(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const ChatConversationModel = {
    findAll: () => readAll(),

    findById: (id) => {
        const items = readAll();
        return items.find(i => i.id === id);
    },

    findByUser: (userId) => {
        const items = readAll();
        return items.filter(i => i.participants.includes(userId));
    },

    create: (data) => {
        const items = readAll();
        const newItem = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data
        };
        items.push(newItem);
        writeAll(items);
        return newItem;
    },

    update: (id, updates) => {
        const items = readAll();
        const index = items.findIndex(i => i.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
        writeAll(items);
        return items[index];
    }
};

module.exports = ChatConversationModel;
