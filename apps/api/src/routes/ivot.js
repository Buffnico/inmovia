const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/openaiService');

// POST /api/ivot/chat - Send message to Ivo-t
router.post('/chat', async (req, res) => {
    try {
        const { history, useHighIntelligence } = req.body;

        if (!history || !Array.isArray(history)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid request. Expected "history" array.'
            });
        }

        const response = await getChatResponse(history, useHighIntelligence || false);

        res.json({
            ok: true,
            message: response
        });
    } catch (error) {
        console.error('[Ivo-t Route] Error:', error);
        res.status(500).json({
            ok: false,
            error: 'Error al comunicarse con Ivo-t.'
        });
    }
});

module.exports = router;
