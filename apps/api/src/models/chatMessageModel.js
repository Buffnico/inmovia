const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/chatMessages.json');

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

const ChatMessageModel = {
    findAll: () => readAll(),

    findByConversation: (conversationId) => {
        const items = readAll();
        return items.filter(i => i.conversationId === conversationId);
    },

    create: (data) => {
        const items = readAll();
        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            createdAt: new Date().toISOString(),
            readBy: [],
            ...data
        };
        items.push(newItem);
        writeAll(items);
        return newItem;
    }
};

module.exports = ChatMessageModel;
