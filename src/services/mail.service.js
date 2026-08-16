const mailer = require('../config/mailer');
const env = require('../config/env');

class MailService {
  /**
   * Send a welcome email after successful registration
   */
  async sendWelcomeEmail(userEmail, { role = 'user' } = {}) {
    const subject = 'Welcome to UXC Block Manager';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e2e8f0; }
            h1 { color: #0f172a; font-size: 24px; margin-top: 0; }
            p { font-size: 15px; line-height: 1.6; color: #334155; }
            .badge { display: inline-block; padding: 4px 10px; background: #e0e7ff; color: #3730a3; border-radius: 4px; font-weight: 600; font-size: 13px; }
            .btn { display: inline-block; margin-top: 16px; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to UXC Block Manager!</h1>
            <p>Hello,</p>
            <p>Your account has been successfully created. You can now manage your projects, stages, tasks, and assets with our polymorphic block management system.</p>
            <p><strong>Account Email:</strong> ${userEmail}<br>
               <strong>Assigned Role:</strong> <span class="badge">${role}</span></p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} UXC Block Manager. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Welcome to UXC Block Manager!\n\nYour account (${userEmail}) with role '${role}' has been created.\nLog in to manage your polymorphic blocks and projects.`;

    return mailer.sendMail({
      to: userEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Send a password reset email containing the secure token & reset link
   */
  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const subject = 'Password Reset Request - UXC Block Manager';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e2e8f0; }
            h1 { color: #0f172a; font-size: 24px; margin-top: 0; }
            p { font-size: 15px; line-height: 1.6; color: #334155; }
            .btn { display: inline-block; margin-top: 16px; margin-bottom: 16px; padding: 12px 24px; background-color: #ef4444; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
            .token-box { background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; word-break: break-all; margin: 12px 0; }
            .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>You requested a password reset for your UXC Block Manager account (${userEmail}).</p>
            <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            <p>Or use this reset token directly in the API / client application:</p>
            <div class="token-box">${resetToken}</div>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} UXC Block Manager. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Password Reset Request\n\nTo reset your password for ${userEmail}, visit:\n${resetUrl}\n\nOr use this reset token: ${resetToken}\n(Valid for 1 hour). If you did not request this, ignore this email.`;

    return mailer.sendMail({
      to: userEmail,
      subject,
      html,
      text,
    });
  }
}

const mailService = new MailService();
module.exports = mailService;
