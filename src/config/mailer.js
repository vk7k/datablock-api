const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const env = require('./env');

class MailerService {
  constructor() {
    this.provider = 'none';
    this.resendClient = null;
    this.smtpTransport = null;

    this.init();
  }

  init() {
    if (env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
      this.provider = 'resend';
      console.log('[Mailer] Initialized with Resend API');
    } else if (env.SMTP_HOST) {
      this.smtpTransport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_USER
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
      });
      this.provider = 'smtp';
      console.log(`[Mailer] Initialized with SMTP (${env.SMTP_HOST}:${env.SMTP_PORT})`);
    } else {
      this.provider = 'console';
      console.log('[Mailer] No email provider configured. Running in Development Console mode.');
    }
  }

  async sendMail({ to, subject, html, text, from }) {
    const fromAddress = from || env.MAIL_FROM;

    try {
      if (this.provider === 'resend' && this.resendClient) {
        const response = await this.resendClient.emails.send({
          from: fromAddress,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ''),
        });

        if (response.error) {
          console.error('[Mailer:Resend Error]', response.error);
          throw new Error(`Resend delivery failed: ${response.error.message}`);
        }

        console.log(`[Mailer:Resend] Email sent to ${to}. ID: ${response.data?.id}`);
        return { success: true, provider: 'resend', id: response.data?.id };
      }

      if (this.provider === 'smtp' && this.smtpTransport) {
        const info = await this.smtpTransport.sendMail({
          from: fromAddress,
          to,
          subject,
          text: text || html.replace(/<[^>]*>?/gm, ''),
          html,
        });

        console.log(`[Mailer:SMTP] Email sent to ${to}. MessageId: ${info.messageId}`);
        return { success: true, provider: 'smtp', messageId: info.messageId };
      }

      // Development / Console Fallback
      console.log('\n================== [OUTGOING EMAIL (DEV LOG)] ==================');
      console.log(`From:    ${fromAddress}`);
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('----------------------------------------------------------------');
      console.log(text || html.replace(/<[^>]*>?/gm, ''));
      console.log('================================================================\n');

      return { success: true, provider: 'console', simulated: true };
    } catch (err) {
      console.error('[Mailer Error]', err.message);
      // In development or test, don't crash the entire request if mail delivery fails
      return { success: false, error: err.message };
    }
  }
}

const mailer = new MailerService();
module.exports = mailer;
