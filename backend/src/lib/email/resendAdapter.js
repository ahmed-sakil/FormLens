import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

export async function send({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Mock Email]', { to, subject });
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'FormLens <noreply@formlens.app>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}
