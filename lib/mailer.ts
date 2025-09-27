import nodemailer from 'nodemailer';

export async function getZohoTransport() {
  const host = process.env.ZOHO_SMTP_HOST;
  const port = Number(process.env.ZOHO_SMTP_PORT || 465);
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;
  if (!host || !user || !pass) throw new Error('Zoho SMTP not configured');
  const secure = port === 465;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendZohoMail({ to, subject, html, attachments }: { to: string; subject: string; html: string; attachments?: { filename: string; content: Buffer }[]; }) {
  const transporter = await getZohoTransport();
  const from = process.env.ZOHO_FROM_EMAIL || process.env.ZOHO_SMTP_USER!;
  await transporter.sendMail({ from, to, subject, html, attachments });
}
