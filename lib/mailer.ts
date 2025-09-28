import nodemailer from 'nodemailer';

export function getMailer() {
  const host = process.env.ZOHO_SMTP_HOST;
  const port = Number(process.env.ZOHO_SMTP_PORT || 465);
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;
  const from = process.env.ZOHO_FROM_EMAIL || user;

  if (!host || !user || !pass) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
  });

  const send = async (to: string, subject: string, html: string) => {
    try {
      await transporter.sendMail({ from, to, subject, html });
      return { ok: true };
    } catch (e:any) {
      console.error('Email send error:', e?.message || e);
      return { ok: false, error: e?.message || 'send failed' };
    }
  };

  return { send };
}