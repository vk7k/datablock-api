const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

class UserService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, { email, password }) {
    const updateData = {};

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id: userId },
        },
      });

      if (existing) {
        const error = new Error('This email is already in use by another account');
        error.statusCode = 409;
        throw error;
      }

      updateData.email = normalizedEmail;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return updatedUser;
  }
}

const userService = new UserService();
module.exports = userService;
