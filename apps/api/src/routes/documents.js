const express = require('express');
const router = express.Router();

// GET /api/documents - List all documents
router.get('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Documents endpoint (placeholder)',
        data: []
    });
});

// POST /api/documents - Upload document
router.post('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Document uploaded (placeholder)',
        data: { id: 1, ...req.body }
    });
});

// GET /api/documents/:id - Get document by ID
router.get('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Document detail (placeholder)',
        data: { id: req.params.id }
    });
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', (req, res) => {
    res.json({
        ok: true,
        message: 'Document deleted (placeholder)'
    });
});

module.exports = router;
