const express = require('express');
const router = express.Router();
const { checkContactRemindersForDate } = require('../jobs/reminders');
const { ROLES } = require('../utils/permissions');

// POST /api/reminders/run
// Manual trigger for reminders (Owner only)
router.post('/run', (req, res) => {
    if (req.user.role !== ROLES.OWNER) {
        return res.status(403).json({ ok: false, message: 'Solo el Owner puede ejecutar esto manualmente.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const count = checkContactRemindersForDate(today);

    res.json({
        ok: true,
        message: `Se ejecutó el chequeo de recordatorios.`,
        notificationsCreated: count
    });
});

module.exports = router;
