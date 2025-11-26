const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authRequired } = require('../middleware/authMiddleware');

router.post('/login', AuthController.login);
router.get('/me', authRequired, AuthController.me);

module.exports = router;
