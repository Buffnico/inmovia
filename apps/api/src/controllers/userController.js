const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

const UserController = {
    getAll: (req, res) => {
        const users = UserModel.findAll();
        const safeUsers = users.map(({ passwordHash, ...u }) => u);
        res.json(safeUsers);
    },

    create: async (req, res) => {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const existing = UserModel.findByEmail(email);
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = {
            id: 'u-' + Date.now(),
            name,
            email,
            passwordHash,
            role,
            active: true,
            createdAt: new Date().toISOString()
        };

        UserModel.create(newUser);

        const { passwordHash: _, ...safeUser } = newUser;
        res.status(201).json(safeUser);
    }
};

module.exports = UserController;
