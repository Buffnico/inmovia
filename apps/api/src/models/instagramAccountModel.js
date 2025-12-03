const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/instagramAccounts.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const findAll = () => {
    return readData();
};

const findById = (id) => {
    const accounts = readData();
    return accounts.find(a => a.id === id);
};

const findByUserId = (userId) => {
    const accounts = readData();
    return accounts.filter(a => a.userId === userId);
};

const findOfficeAccount = () => {
    const accounts = readData();
    return accounts.find(a => a.type === 'OFICINA');
};

const create = (accountData) => {
    const accounts = readData();
    const newAccount = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        ...accountData
    };
    accounts.push(newAccount);
    writeData(accounts);
    return newAccount;
};

const update = (id, updates) => {
    const accounts = readData();
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) return null;

    accounts[index] = {
        ...accounts[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    writeData(accounts);
    return accounts[index];
};

const remove = (id) => {
    const accounts = readData();
    const filtered = accounts.filter(a => a.id !== id);
    if (filtered.length !== accounts.length) {
        writeData(filtered);
        return true;
    }
    return false;
};

module.exports = {
    findAll,
    findById,
    findByUserId,
    findOfficeAccount,
    create,
    update,
    remove
};
