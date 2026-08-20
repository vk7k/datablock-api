const prisma = require('../config/prisma');
const { buildBlockTree } = require('../utils/tree.util');

class BlockService {
  /**
   * Retrieve a flat list of blocks with optional filters
   */
  async getBlocks({ payload_type, payload_type_version, parent_id, search } = {}) {
    const where = {};

    if (payload_type) {
      where.payload_type = payload_type;
    }

    if (payload_type_version !== undefined) {
      where.payload_type_version = Number(payload_type_version);
    }

    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === 'root') {
        where.parent_id = null;
      } else {
        where.parent_id = parent_id;
      }
    }

    let blocks = await prisma.block.findMany({
      where,
      orderBy: { created_at: 'asc' },
    });

    // In-memory filter for search if searching inside JSON payload
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      blocks = blocks.filter(b => {
        if (!b.payload) return false;
        const payloadStr = JSON.stringify(b.payload).toLowerCase();
        return payloadStr.includes(q);
      });
    }

    return blocks;
  }

  /**
   * Retrieve all blocks structured as a nested hierarchical JSON tree
   */
  async getBlocksTree() {
    const allBlocks = await prisma.block.findMany({
      orderBy: { created_at: 'asc' },
    });

    return buildBlockTree(allBlocks);
  }

  /**
   * Retrieve a specific block by its ID
   */
  async getBlockById(id) {
    const block = await prisma.block.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            payload_type: true,
            payload_type_version: true,
            payload: true,
          },
        },
        children: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!block) {
      const error = new Error(`Block with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return block;
  }

  /**
   * Create a new generic polymorphic block
   */
  async createBlock({ parent_id, payload_type = 'GENERIC', payload_type_version = 1, payload = null }) {
    // If parent_id is specified, verify that parent block exists
    if (parent_id) {
      const parentExists = await prisma.block.findUnique({
        where: { id: parent_id },
      });

      if (!parentExists) {
        const error = new Error(`Parent block with ID '${parent_id}' does not exist`);
        error.statusCode = 400;
        throw error;
      }
    }

    const newBlock = await prisma.block.create({
      data: {
        parent_id: parent_id || null,
        payload_type: payload_type || 'GENERIC',
        payload_type_version: payload_type_version ? Number(payload_type_version) : 1,
        payload: payload || null,
      },
    });

    return newBlock;
  }

  /**
   * Update an existing block, merging payload JSON if provided
   */
  async updateBlock(id, updateData) {
    const existing = await prisma.block.findUnique({
      where: { id },
    });

    if (!existing) {
      const error = new Error(`Block with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Prevent a block from being its own parent
    if (updateData.parent_id !== undefined && updateData.parent_id === id) {
      const error = new Error('A block cannot be set as its own parent');
      error.statusCode = 400;
      throw error;
    }

    // Validate parent_id existence if changing parent
    if (updateData.parent_id) {
      const parentExists = await prisma.block.findUnique({
        where: { id: updateData.parent_id },
      });

      if (!parentExists) {
        const error = new Error(`Parent block with ID '${updateData.parent_id}' does not exist`);
        error.statusCode = 400;
        throw error;
      }
    }

    const data = {};

    if (updateData.payload_type !== undefined) data.payload_type = updateData.payload_type;
    if (updateData.payload_type_version !== undefined) data.payload_type_version = Number(updateData.payload_type_version);
    if (updateData.parent_id !== undefined) data.parent_id = updateData.parent_id;

    // Merge JSON payload if updating payload
    if (updateData.payload !== undefined) {
      if (updateData.payload === null) {
        data.payload = null;
      } else {
        const currentPayload = (typeof existing.payload === 'object' && existing.payload !== null)
          ? existing.payload
          : {};
        data.payload = {
          ...currentPayload,
          ...updateData.payload,
        };
      }
    }

    const updated = await prisma.block.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete a block and cascade deletion to all children
   */
  async deleteBlock(id) {
    const existing = await prisma.block.findUnique({
      where: { id },
    });

    if (!existing) {
      const error = new Error(`Block with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Cascade delete is handled by database foreign key constraint and Prisma relation
    await prisma.block.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}

const blockService = new BlockService();
module.exports = blockService;
