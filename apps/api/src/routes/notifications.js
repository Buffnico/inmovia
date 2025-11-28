const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/notificationModel');
const { authRequired } = require('../middleware/authMiddleware');

router.use(authRequired);

// GET /api/notificaciones
// Query: ?unread=true
router.get('/', (req, res) => {
    const userId = req.user.id;
    let notifications = NotificationModel.findByUserId(userId);

    if (req.query.unread === 'true') {
        notifications = notifications.filter(n => !n.read);
    }

    // Sort by newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ ok: true, data: notifications });
});

// POST /api/notificaciones/marcar-leidas
// Body: { id: "..." }
router.post('/marcar-leidas', (req, res) => {
    const userId = req.user.id;
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ ok: false, message: 'ID requerido' });
    }

    const updated = NotificationModel.markAsRead(id, userId);
    if (!updated) {
        return res.status(404).json({ ok: false, message: 'Notificación no encontrada' });
    }

    res.json({ ok: true, data: updated });
});

// POST /api/notificaciones/marcar-todas-leidas
router.post('/marcar-todas-leidas', (req, res) => {
    const userId = req.user.id;
    const count = NotificationModel.markAllAsRead(userId);
    res.json({ ok: true, message: `Marcadas ${count} notificaciones como leídas` });
});

// POST /api/notificaciones/test (Only OWNER/ADMIN)
router.post('/test', (req, res) => {
    if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ ok: false, message: 'No autorizado' });
    }

    const { type, title, message } = req.body;

    const newNotification = {
        id: `notif_${Date.now()}`,
        userId: req.user.id,
        type: type || 'sistema',
        title: title || 'Prueba de notificación',
        message: message || 'Esta es una notificación de prueba generada manualmente.',
        createdAt: new Date().toISOString(),
        read: false,
        metadata: {}
    };

    const created = NotificationModel.create(newNotification);
    res.json({ ok: true, data: created });
});

// Hooks for future integration:
// TODO: Endpoint to create notification for another user (e.g. share agenda event)
// router.post('/send', ...)

module.exports = router;
