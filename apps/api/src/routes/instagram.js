const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/authMiddleware');
const InstagramAccountModel = require('../models/instagramAccountModel');

// GET /api/instagram/accounts/my
// Returns personal accounts for the user + office account if authorized
router.get('/accounts/my', authRequired, (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role; // Assuming role is available in req.user

        const personalAccounts = InstagramAccountModel.findByUserId(userId);
        let accounts = [...personalAccounts];

        // If user has privileged role, also include OFFICE account
        const privilegedRoles = ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'];
        if (privilegedRoles.includes(userRole)) {
            const officeAccount = InstagramAccountModel.findOfficeAccount();
            if (officeAccount) {
                accounts.push(officeAccount);
            }
        }

        res.json({ ok: true, data: accounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error fetching accounts' });
    }
});

// POST /api/instagram/accounts
// Create or update an account
router.post('/accounts', authRequired, (req, res) => {
    try {
        const { type, igUsername, displayName } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!type || !igUsername) {
            return res.status(400).json({ ok: false, message: 'Missing required fields' });
        }

        // Check permissions for OFFICE account
        if (type === 'OFICINA') {
            const privilegedRoles = ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'];
            if (!privilegedRoles.includes(userRole)) {
                return res.status(403).json({ ok: false, message: 'Unauthorized to manage office account' });
            }

            // Check if office account already exists, if so update it
            const existingOffice = InstagramAccountModel.findOfficeAccount();
            if (existingOffice) {
                const updated = InstagramAccountModel.update(existingOffice.id, {
                    igUsername,
                    displayName: displayName || existingOffice.displayName,
                    updatedBy: userId
                });
                return res.json({ ok: true, data: updated, message: 'Office account updated' });
            }
        }

        // Check if personal account already exists for this user
        if (type === 'PERSONAL') {
            const existingPersonal = InstagramAccountModel.findByUserId(userId).find(a => a.type === 'PERSONAL');
            if (existingPersonal) {
                const updated = InstagramAccountModel.update(existingPersonal.id, {
                    igUsername,
                    displayName: displayName || existingPersonal.displayName
                });
                return res.json({ ok: true, data: updated, message: 'Personal account updated' });
            }
        }

        // Create new account
        const newAccount = InstagramAccountModel.create({
            userId: type === 'PERSONAL' ? userId : null, // Office account doesn't belong to a specific user ID in the same way, or could be linked to creator
            type,
            igUsername,
            displayName: displayName || igUsername,
            ivoSettings: { suggestMode: false, autoReplyMode: false }
        });

        res.json({ ok: true, data: newAccount, message: 'Account created' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error creating account' });
    }
});

// PUT /api/instagram/accounts/:id/ivo-settings
// Update Ivo-t settings
router.put('/accounts/:id/ivo-settings', authRequired, (req, res) => {
    try {
        const { id } = req.params;
        const { suggestMode, autoReplyMode } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const account = InstagramAccountModel.findById(id);
        if (!account) {
            return res.status(404).json({ ok: false, message: 'Account not found' });
        }

        // Authorization check
        if (account.type === 'PERSONAL' && account.userId !== userId) {
            return res.status(403).json({ ok: false, message: 'Unauthorized' });
        }
        if (account.type === 'OFICINA') {
            const privilegedRoles = ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'];
            if (!privilegedRoles.includes(userRole)) {
                return res.status(403).json({ ok: false, message: 'Unauthorized' });
            }
        }

        const updated = InstagramAccountModel.update(id, {
            ivoSettings: {
                suggestMode: suggestMode !== undefined ? suggestMode : account.ivoSettings?.suggestMode,
                autoReplyMode: autoReplyMode !== undefined ? autoReplyMode : account.ivoSettings?.autoReplyMode
            }
        });

        res.json({ ok: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error updating settings' });
    }
});

module.exports = router;
