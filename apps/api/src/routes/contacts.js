const express = require('express');
const router = express.Router();

// GET /api/contacts - List all contacts
router.get('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Contacts endpoint (placeholder)',
        data: []
    });
});

// POST /api/contacts - Create contact
router.post('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Contact created (placeholder)',
        data: { id: 1, ...req.body }
    });
});

// GET /api/contacts/:id - Get contact by ID
router.get('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Contact detail (placeholder)',
        data: { id: req.params.id }
    });
});

// PUT /api/contacts/:id - Update contact
router.put('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Contact updated (placeholder)',
        data: { id: req.params.id, ...req.body }
    });
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Contact deleted (placeholder)'
    });
});

module.exports = router;
