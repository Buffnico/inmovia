const express = require('express');
const router = express.Router();
const RentalContractModel = require('../models/rentalContractModel');
const RentalPaymentModel = require('../models/rentalPaymentModel');
const { authRequired } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authRequired);

// --- Contracts ---

// GET /api/alquileres/contratos
router.get('/contratos', (req, res) => {
    const contracts = RentalContractModel.findAll();
    // Optional: Filter by officeId if implemented in future
    res.json({ ok: true, data: contracts });
});

// GET /api/alquileres/contratos/:id
router.get('/contratos/:id', (req, res) => {
    const contract = RentalContractModel.findById(req.params.id);
    if (!contract) {
        return res.status(404).json({ ok: false, message: 'Contrato no encontrado' });
    }
    res.json({ ok: true, data: contract });
});

// POST /api/alquileres/contratos
router.post('/contratos', (req, res) => {
    const { title, baseAmount, startDate, endDate, status } = req.body;

    if (!title || !baseAmount || !startDate || !endDate) {
        return res.status(400).json({ ok: false, message: 'Faltan campos obligatorios' });
    }

    const newContract = {
        id: `rc${Date.now()}`,
        officeId: req.user.officeId || 'default', // Fallback if not in user
        ...req.body,
        createdAt: new Date().toISOString()
    };

    const created = RentalContractModel.create(newContract);
    res.json({ ok: true, message: 'Contrato creado', data: created });
});

// PATCH /api/alquileres/contratos/:id
router.patch('/contratos/:id', (req, res) => {
    const contract = RentalContractModel.findById(req.params.id);
    if (!contract) {
        return res.status(404).json({ ok: false, message: 'Contrato no encontrado' });
    }

    const updated = RentalContractModel.update(req.params.id, req.body);
    res.json({ ok: true, message: 'Contrato actualizado', data: updated });
});

// --- Payments ---

// GET /api/alquileres/contratos/:id/pagos
router.get('/contratos/:id/pagos', (req, res) => {
    const payments = RentalPaymentModel.findByContractId(req.params.id);
    res.json({ ok: true, data: payments });
});

// POST /api/alquileres/contratos/:id/pagos
router.post('/contratos/:id/pagos', (req, res) => {
    const contract = RentalContractModel.findById(req.params.id);
    if (!contract) {
        return res.status(404).json({ ok: false, message: 'Contrato no encontrado' });
    }

    const newPayment = {
        id: `rp${Date.now()}`,
        contractId: req.params.id,
        ...req.body,
        createdAt: new Date().toISOString()
    };

    const created = RentalPaymentModel.create(newPayment);
    res.json({ ok: true, message: 'Pago registrado', data: created });
});

// --- Vencimientos (Stub) ---

// GET /api/alquileres/vencimientos
router.get('/vencimientos', (req, res) => {
    // Stub: Return dummy data or filter pending payments
    // For now, let's just filter all payments that are PENDING
    const allPayments = RentalPaymentModel.findAll();
    const pending = allPayments.filter(p => p.status === 'PENDIENTE');

    // Sort by dueDate if available
    pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({ ok: true, data: pending });
});

// --- Payment Updates ---

// PATCH /api/alquileres/pagos/:id
router.patch('/pagos/:id', (req, res) => {
    const payment = RentalPaymentModel.findById(req.params.id);
    if (!payment) {
        return res.status(404).json({ ok: false, message: 'Pago no encontrado' });
    }

    const updates = { ...req.body };

    // Auto-set paidDate if status becomes PAGADO and date not provided
    if (updates.status === 'PAGADO' && !updates.paidDate) {
        updates.paidDate = new Date().toISOString();
    }

    const updated = RentalPaymentModel.update(req.params.id, updates);
    res.json({ ok: true, message: 'Pago actualizado', data: updated });
});

module.exports = router;
