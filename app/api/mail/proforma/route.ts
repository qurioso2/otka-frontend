import { NextResponse } from 'next/server';
import { sendZohoMail } from '../../../../lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, pdfUrl } = body || {};
    if (!to || !subject || !html) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    let attachments: { filename: string; content: Buffer }[] | undefined = undefined;
    if (pdfUrl) {
      const res = await fetch(pdfUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        attachments = [{ filename: 'proforma.pdf', content: buf }];
      }
    }

    await sendZohoMail({ to, subject, html, attachments });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Mail send failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
