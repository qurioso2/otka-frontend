import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../auth/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { r2Client, R2_CONFIG } from '../../../../../lib/r2-client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|li|ul|ol)>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wrapText(text: string, maxChars = 95) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + (line ? ' ' : '') + w).length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { version = 'v1', accept_terms, accept_gdpr, confirm_data } = body || {};

  // Fetch partner profile
  const { data: profile, error: profErr } = await supabase.from('users').select('company_name, vat_id, contact_name, email').eq('email', user.email).maybeSingle();
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  // Load full terms HTML and hash
  const termsUrl = new URL('/legal/partner-terms/v1.html', process.env.NEXT_PUBLIC_URL || 'https://otka.ro').toString();
  const termsRes = await fetch(termsUrl);
  const termsHtml = termsRes.ok ? await termsRes.text() : 'Partner Terms';
  const docHash = crypto.createHash('sha256').update(termsHtml).digest('hex');
  const termsText = stripHtml(termsHtml);

  // Create PDF with header + partner data + full terms text (wrapped, paginated)
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const addPage = () => pdfDoc.addPage([595, 842]); // A4
  let page = addPage();
  let y = 792; // top margin
  const left = 50;

  const draw = (text: string, size = 11, color = rgb(0, 0, 0)) => {
    page.drawText(text, { x: left, y, size, font, color });
    y -= size + 4;
    if (y < 60) { page = addPage(); y = 792; }
  };

  // Header
  draw('TERMENI ȘI CONDIȚII - PROGRAM DE PARTENERIAT OTKA', 14);
  draw(`Versiune: ${version}`);
  draw(`Data: ${new Date().toLocaleString('ro-RO')}`);
  draw('');

  // Partner details
  draw('Date Partener:', 12);
  draw(`Companie: ${profile?.company_name || '-'}`);
  draw(`CIF: ${profile?.vat_id || '-'}`);
  draw(`Reprezentant: ${profile?.contact_name || '-'}`);
  draw(`Email: ${profile?.email || user.email}`);
  draw('');

  // Declarations
  draw('Declarații:', 12);
  draw(`- Accept termeni: ${accept_terms ? 'DA' : 'NU'}`);
  draw(`- Accept GDPR: ${accept_gdpr ? 'DA' : 'NU'}`);
  draw(`- Confirm date reale: ${confirm_data ? 'DA' : 'NU'}`);
  draw(`Hash document: ${docHash}`);
  draw(`IP: ${request.headers.get('x-forwarded-for') || '-'}`);
  draw('');
  draw('Conținut integral termeni:', 12);

  // Full terms wrapped
  const lines = termsText.split('\n').flatMap(par => wrapText(par, 95).concat(''));
  for (const ln of lines) draw(ln);

  const pdfBytes = await pdfDoc.save();

  const key = `agreements/${user.email.replace(/[^a-zA-Z0-9-_\.]/g, '_')}_${Date.now()}.pdf`;
  const put = new PutObjectCommand({ Bucket: R2_CONFIG.bucketName, Key: key, Body: Buffer.from(pdfBytes), ContentType: 'application/pdf' });
  await r2Client.send(put);
  const pdfUrl = `${R2_CONFIG.publicUrl}/${key}`;

  // Save agreement record
  const ip = request.headers.get('x-forwarded-for') || '';
  await supabase.from('partner_agreements').insert({ email: user.email, version, ip, doc_hash: docHash, pdf_url: pdfUrl, accept_terms, accept_gdpr, confirm_data });

  return NextResponse.json({ ok: true, pdfUrl, version });
}
