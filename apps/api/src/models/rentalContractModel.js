const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/rentalContracts.json');

function readContracts() {
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

function writeContracts(contracts) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(contracts, null, 2));
}

const RentalContractModel = {
    findAll: () => readContracts(),
    findById: (id) => readContracts().find(c => c.id === id),
    findByPropertyId: (propertyId) => readContracts().filter(c => c.propertyId === propertyId),
    create: (contract) => {
        const contracts = readContracts();
        contracts.push(contract);
        writeContracts(contracts);
        return contract;
    },
    update: (id, updates) => {
        const contracts = readContracts();
        const index = contracts.findIndex(c => c.id === id);
        if (index === -1) return null;

        contracts[index] = { ...contracts[index], ...updates };
        writeContracts(contracts);
        return contracts[index];
    },
    delete: (id) => {
        let contracts = readContracts();
        const initialLength = contracts.length;
        contracts = contracts.filter(c => c.id !== id);
        if (contracts.length !== initialLength) {
            writeContracts(contracts);
            return true;
        }
        return false;
    }
};

module.exports = RentalContractModel;
