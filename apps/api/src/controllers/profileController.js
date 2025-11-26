const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const OfficeModel = require('../models/officeModel');

const ProfileController = {
    getMe: (req, res) => {
        const user = UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { passwordHash, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    },

    updateMe: (req, res) => {
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'secondaryPhone', 'avatarUrl', 'locale', 'timezone'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedUser = UserModel.update(req.user.id, updates);
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        const { passwordHash, ...userWithoutPass } = updatedUser;
        res.json(userWithoutPass);
    },

    getOffice: (req, res) => {
        // Allow any authenticated user to read office config
        const config = OfficeModel.get();
        res.json(config);
    },

    updateOffice: (req, res) => {
        if (req.user.role !== 'OWNER') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const updatedConfig = OfficeModel.update(req.body);
        res.json(updatedConfig);
    },

    changePassword: async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const user = UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({ message: 'Current password invalid' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        UserModel.update(req.user.id, { passwordHash: newHash });

        res.json({ message: 'Password updated successfully' });
    }
};

module.exports = ProfileController;
