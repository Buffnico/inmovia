const express = require('express');
const router = express.Router();

// GET /api/agenda - List all events
router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Agenda endpoint (placeholder)',
    data: []
  });
});

// POST /api/agenda - Create event
router.post('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Event created (placeholder)',
    data: { id: 1, ...req.body }
  });
});

// GET /api/agenda/:id - Get event by ID
router.get('/:id', (req, res) => {
  res.json({
    ok: true,
    message: 'Event detail (placeholder)',
    data: { id: req.params.id }
  });
});

// PUT /api/agenda/:id - Update event
router.put('/:id', (req, res) => {
  res.json({
    ok: true,
    message: 'Event updated (placeholder)',
    data: { id: req.params.id, ...req.body }
  });
});

// DELETE /api/agenda/:id - Delete event
router.delete('/:id', (req, res) => {
  res.json({
    ok: true,
    message: 'Event deleted (placeholder)'
  });
});

module.exports = router;
