const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const blockRoutes = require('./block.routes');
const { successResponse } = require('../utils/response.util');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  }, 'API is up and running');
});

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blocks', blockRoutes);

module.exports = router;
