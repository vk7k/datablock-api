const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt.util');
const mailService = require('./mail.service');

class AuthService {
  /**
   * Register a new user
   */
  async register({ email, password, role = 'user' }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password_hash,
        role: role || 'user',
      },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Generate JWT token
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // Trigger welcome email asynchronously
    mailService.sendWelcomeEmail(user.email, { role: user.role }).catch((err) => {
      console.error('[AuthService] Failed to send welcome email:', err.message);
    });

    return { user, token };
  }

  /**
   * Authenticate user with email and password
   */
  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return { user: safeUser, token };
  }

  /**
   * Generate password reset token and send email
   */
  async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return success response to prevent email enumeration attacks
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetExpiry,
      },
    });

    await mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In dev environment or testing, return token helper if needed
      ...(process.env.NODE_ENV === 'development' ? { dev_token: resetToken } : {}),
    };
  }

  /**
   * Reset user password using the token
   */
  async resetPassword({ token, password }) {
    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      const error = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
  }
}

const authService = new AuthService();
module.exports = authService;
