const prisma = require('../config/prisma');
const { buildBlockTree } = require('../utils/tree.util');

class BlockService {
  /**
   * Retrieve a flat list of blocks with optional filters
   */
  async getBlocks({ type, parent_id, status, schema_version, search } = {}) {
    const where = {};

    if (type) {
      where.type = type;
    }

    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === 'root') {
        where.parent_id = null;
      } else {
        where.parent_id = parent_id;
      }
    }

    if (status) {
      where.status = status;
    }

    if (schema_version !== undefined) {
      where.schema_version = Number(schema_version);
    }

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const blocks = await prisma.block.findMany({
      where,
      orderBy: [{ start_date: 'asc' }, { created_at: 'asc' }],
    });

    return blocks;
  }

  /**
   * Retrieve all blocks structured as a nested hierarchical JSON tree
   */
  async getBlocksTree() {
    const allBlocks = await prisma.block.findMany({
      orderBy: [{ start_date: 'asc' }, { created_at: 'asc' }],
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
            name: true,
            type: true,
          },
        },
        children: {
          orderBy: [{ start_date: 'asc' }, { created_at: 'asc' }],
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
   * Create a new polymorphic block
   */
  async createBlock({ parent_id, name, start_date, end_date, status = 'pending', type, schema_version = 1, payload = null }) {
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
        name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: status || 'pending',
        type,
        schema_version: schema_version ? Number(schema_version) : 1,
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

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.start_date !== undefined) data.start_date = new Date(updateData.start_date);
    if (updateData.end_date !== undefined) data.end_date = new Date(updateData.end_date);
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.type !== undefined) data.type = updateData.type;
    if (updateData.schema_version !== undefined) data.schema_version = Number(updateData.schema_version);
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
