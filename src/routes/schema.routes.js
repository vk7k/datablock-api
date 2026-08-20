const express = require('express');
const schemaController = require('../controllers/schema.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/schemas
 * @desc    Get all available official payload schemas grouped by domain
 * @access  Private
 */
router.get('/', authenticateToken, schemaController.getSchemas);

/**
 * @route   GET /api/schemas/:type/:version?
 * @desc    Get specific schema template
 * @access  Private
 */
router.get('/:type/:version?', authenticateToken, schemaController.getSchemaByTypeAndVersion);

module.exports = router;
