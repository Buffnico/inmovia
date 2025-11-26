const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { authRequired, authorize } = require('../middleware/authMiddleware');

router.use(authRequired);

router.get('/me', ProfileController.getMe);
router.put('/me', ProfileController.updateMe);

router.get('/office', ProfileController.getOffice);
router.put('/office', authorize(['OWNER']), ProfileController.updateOffice);

router.put('/change-password', ProfileController.changePassword);

module.exports = router;
