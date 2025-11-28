const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/rentalPayments.json');

function readPayments() {
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

function writePayments(payments) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payments, null, 2));
}

const RentalPaymentModel = {
    findAll: () => readPayments(),
    findById: (id) => readPayments().find(p => p.id === id),
    findByContractId: (contractId) => readPayments().filter(p => p.contractId === contractId),
    create: (payment) => {
        const payments = readPayments();
        payments.push(payment);
        writePayments(payments);
        return payment;
    },
    update: (id, updates) => {
        const payments = readPayments();
        const index = payments.findIndex(p => p.id === id);
        if (index === -1) return null;

        payments[index] = { ...payments[index], ...updates };
        writePayments(payments);
        return payments[index];
    },
    delete: (id) => {
        let payments = readPayments();
        const initialLength = payments.length;
        payments = payments.filter(p => p.id !== id);
        if (payments.length !== initialLength) {
            writePayments(payments);
            return true;
        }
        return false;
    }
};

module.exports = RentalPaymentModel;
