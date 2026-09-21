import * as resendAdapter from '../lib/email/resendAdapter.js';
import * as sendgridAdapter from '../lib/email/sendgridAdapter.js';
import * as smtpAdapter from '../lib/email/smtpAdapter.js';

function loadAdapter(provider) {
  if (provider === 'sendgrid') return sendgridAdapter;
  if (provider === 'smtp') return smtpAdapter;
  return resendAdapter;
}

class EmailService {
  constructor() {
    this.adapter = loadAdapter(process.env.EMAIL_PROVIDER || 'resend');
  }

  async sendDeadlineReminder({ to, userName, applicationTitle, deadline, daysRemaining }) {
    const html = `
      <h2>Deadline Reminder: ${applicationTitle}</h2>
      <p>Hi ${userName},</p>
      <p>Your application <strong>${applicationTitle}</strong> has a deadline in <strong>${daysRemaining} days</strong> (${deadline}).</p>
      <p>Log in to FormLens to check your readiness and complete any remaining requirements.</p>
    `;
    return this.adapter.send({ to, subject: `Deadline Reminder: ${applicationTitle}`, html });
  }
}

export const emailService = new EmailService();
