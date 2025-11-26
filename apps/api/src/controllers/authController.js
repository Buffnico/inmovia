const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const AuthController = {
    login: async (req, res) => {
        const { email, password } = req.body;

        console.log(`Login attempt for: ${email}`);
        const user = UserModel.findByEmail(email);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            console.log('Password invalid');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.active) {
            return res.status(403).json({ message: 'User is inactive' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { passwordHash, ...userWithoutPass } = user;
        res.json({ token, user: userWithoutPass });
    },

    me: (req, res) => {
        // req.user comes from middleware
        const user = UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { passwordHash, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    }
};

module.exports = AuthController;
