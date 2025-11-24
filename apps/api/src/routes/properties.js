const express = require('express');
const router = express.Router();

// GET /api/properties - List all properties
router.get('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Properties endpoint (placeholder)',
        data: []
    });
});

// POST /api/properties - Create property
router.post('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Property created (placeholder)',
        data: { id: 1, ...req.body }
    });
});

// GET /api/properties/:id - Get property by ID
router.get('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Property detail (placeholder)',
        data: { id: req.params.id }
    });
});

// PUT /api/properties/:id - Update property
router.put('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Property updated (placeholder)',
        data: { id: req.params.id, ...req.body }
    });
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Property deleted (placeholder)'
    });
});

module.exports = router;
