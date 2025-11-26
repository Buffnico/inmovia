const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

async function initOwner() {
    const users = UserModel.findAll();
    const ownerExists = users.some(u => u.role === 'OWNER');

    if (!ownerExists) {
        console.log('Initializing Owner user...');

        const email = process.env.OWNER_EMAIL || 'admin@inmovia.com';
        const password = process.env.OWNER_PASSWORD || 'admin123';
        const name = process.env.OWNER_NAME || 'Super Admin';

        const passwordHash = await bcrypt.hash(password, 10);

        const newOwner = {
            id: 'owner-' + Date.now(),
            name,
            email,
            passwordHash,
            role: 'OWNER',
            active: true,
            createdAt: new Date().toISOString()
        };

        UserModel.create(newOwner);
        console.log(`Owner created: ${email} / ${password}`);
    } else {
        console.log('Owner user already exists.');
    }
}

module.exports = initOwner;
