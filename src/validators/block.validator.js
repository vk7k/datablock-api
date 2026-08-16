const { z } = require('zod');

const dateValidation = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid ISO-8601 date string',
});

const createBlockSchema = z.object({
  parent_id: z.string().uuid('Parent ID must be a valid UUID').nullable().optional(),
  name: z.string().min(1, 'Name is required and cannot be empty'),
  start_date: dateValidation,
  end_date: dateValidation,
  status: z.string().min(1).default('pending'),
  type: z.string().min(1, 'Type is required (e.g. PROJECT, STAGE, TASK, ASSET, CONTRACT)'),
  payload: z.record(z.any()).nullable().optional(),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end >= start;
}, {
  message: 'end_date cannot be earlier than start_date',
  path: ['end_date'],
});

const updateBlockSchema = z.object({
  parent_id: z.string().uuid('Parent ID must be a valid UUID').nullable().optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  start_date: dateValidation.optional(),
  end_date: dateValidation.optional(),
  status: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  payload: z.record(z.any()).nullable().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  }
  return true;
}, {
  message: 'end_date cannot be earlier than start_date',
  path: ['end_date'],
});

const blockQuerySchema = z.object({
  type: z.string().optional(),
  parent_id: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

module.exports = {
  createBlockSchema,
  updateBlockSchema,
  blockQuerySchema,
};
