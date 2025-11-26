const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authRequired, authorize } = require('../middleware/authMiddleware');

// Solo Owner y Admin pueden ver usuarios
router.get('/', authRequired, authorize(['OWNER', 'ADMIN']), UserController.getAll);

// Solo Owner puede crear usuarios
router.post('/', authRequired, authorize(['OWNER']), UserController.create);

module.exports = router;
