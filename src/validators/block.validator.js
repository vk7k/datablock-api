const { z } = require('zod');

/**
 * Zod schema for creating a generic polymorphic block
 */
const createBlockSchema = z.object({
  parent_id: z.string().uuid('parent_id must be a valid UUID').nullable().optional(),
  payload_type: z.string().min(1, 'payload_type is required').max(50).default('GENERIC'),
  payload_type_version: z.number().int().min(1, 'payload_type_version must be at least 1').default(1),
  payload: z.record(z.any()).nullable().optional(),
});

/**
 * Zod schema for updating a polymorphic block (partial updates & payload merge)
 */
const updateBlockSchema = z.object({
  parent_id: z.string().uuid('parent_id must be a valid UUID').nullable().optional(),
  payload_type: z.string().min(1).max(50).optional(),
  payload_type_version: z.number().int().min(1).optional(),
  payload: z.record(z.any()).nullable().optional(),
});

/**
 * Zod schema for querying blocks
 */
const blockQuerySchema = z.object({
  payload_type: z.string().optional(),
  payload_type_version: z.coerce.number().int().min(1).optional(),
  parent_id: z.string().optional(),
  search: z.string().optional(),
});

module.exports = {
  createBlockSchema,
  updateBlockSchema,
  blockQuerySchema,
};
