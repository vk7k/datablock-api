const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../validators/user.validator');

const router = express.Router();

// Protected User Routes (Require JWT)
router.get('/me', authenticateToken, userController.getMe);
router.put('/me', authenticateToken, validate(updateProfileSchema), userController.updateMe);

module.exports = router;
