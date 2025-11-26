const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'inmovia_secret_key_dev';

function authRequired(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

const authorize = (roles = []) => {
    // roles param can be a single string (e.g. 'OWNER') 
    // or an array of strings (e.g. ['OWNER', 'ADMIN'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};

module.exports = { authRequired, authorize, JWT_SECRET };
