const { z } = require('zod');

const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
}).refine((data) => data.email !== undefined || data.password !== undefined, {
  message: 'At least one field (email or password) must be provided for update',
});

module.exports = {
  updateProfileSchema,
};
