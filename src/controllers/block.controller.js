const blockService = require('../services/block.service');
const { successResponse } = require('../utils/response.util');

class BlockController {
  async getBlocks(req, res, next) {
    try {
      const blocks = await blockService.getBlocks(req.query);
      return successResponse(res, blocks, 'Blocks retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getBlocksTree(req, res, next) {
    try {
      const tree = await blockService.getBlocksTree();
      return successResponse(res, tree, 'Hierarchical block tree retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getBlockById(req, res, next) {
    try {
      const block = await blockService.getBlockById(req.params.id);
      return successResponse(res, block, 'Block retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async createBlock(req, res, next) {
    try {
      const newBlock = await blockService.createBlock(req.body);
      return successResponse(res, newBlock, 'Block created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateBlock(req, res, next) {
    try {
      const updatedBlock = await blockService.updateBlock(req.params.id, req.body);
      return successResponse(res, updatedBlock, 'Block updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async deleteBlock(req, res, next) {
    try {
      const result = await blockService.deleteBlock(req.params.id);
      return successResponse(res, result, 'Block and nested children deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

const blockController = new BlockController();
module.exports = blockController;
