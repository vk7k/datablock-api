const express = require('express');
const blockController = require('../controllers/block.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createBlockSchema,
  updateBlockSchema,
  blockQuerySchema,
} = require('../validators/block.validator');

const router = express.Router();

// All Block Management routes require authentication
router.use(authenticateToken);

// 1. GET /api/blocks/tree - Nested JSON hierarchy (must be declared before /:id)
router.get('/tree', blockController.getBlocksTree);

// 2. GET /api/blocks - Flat list with query filters (e.g. ?type=TASK&parent_id=...)
router.get('/', validate(blockQuerySchema, 'query'), blockController.getBlocks);

// 3. GET /api/blocks/:id - Get specific block with its child summary
router.get('/:id', blockController.getBlockById);

// 4. POST /api/blocks - Create a new block
router.post('/', validate(createBlockSchema), blockController.createBlock);

// 5. PUT /api/blocks/:id - Update an existing block (with JSON payload merging)
router.put('/:id', validate(updateBlockSchema), blockController.updateBlock);

// 6. DELETE /api/blocks/:id - Delete a block and cascade delete all child blocks
router.delete('/:id', blockController.deleteBlock);

module.exports = router;
