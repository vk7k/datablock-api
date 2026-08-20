const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/database.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Protect all database explorer endpoints with JWT Auth
router.use(authenticateToken);

// 1. Status & Metrics
router.get('/status', databaseController.getStatus.bind(databaseController));

// 2. Connection Config & Test
router.get('/config', databaseController.getConfig.bind(databaseController));
router.post('/test-connection', databaseController.testConnection.bind(databaseController));

// 3. Tables & Schema
router.get('/tables', databaseController.getTables.bind(databaseController));
router.get('/tables/:tableName/schema', databaseController.getTableSchema.bind(databaseController));
router.get('/tables/:tableName/data', databaseController.getTableData.bind(databaseController));

// 4. SQL Console Query Execution
router.post('/query', databaseController.executeQuery.bind(databaseController));

module.exports = router;
