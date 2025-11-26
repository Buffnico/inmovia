const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

function readUsers() {
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

function writeUsers(users) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

const UserModel = {
    findAll: () => readUsers(),
    findByEmail: (email) => readUsers().find(u => u.email === email),
    findById: (id) => readUsers().find(u => u.id === id),
    create: (user) => {
        const users = readUsers();
        users.push(user);
        writeUsers(users);
        return user;
    },
    update: (id, updates) => {
        const users = readUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updates };
        writeUsers(users);
        return users[index];
    }
};

module.exports = UserModel;
