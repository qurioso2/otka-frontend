import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../auth/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { r2Client, R2_CONFIG } from '../../../../../lib/r2-client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { version = 'v1', accept_terms, accept_gdpr, confirm_data } = body || {};

  // Fetch partner profile
  const { data: profile, error: profErr } = await supabase.from('users').select('company_name, vat_id, contact_name, email').eq('email', user.email).maybeSingle();
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  // Load partner-terms HTML (simplified: we hash it, but we generate a simple PDF with key fields)
  const termsUrl = new URL('/legal/partner-terms/v1.html', process.env.NEXT_PUBLIC_URL || 'https://otka.ro').toString();
  const termsRes = await fetch(termsUrl);
  const termsHtml = termsRes.ok ? await termsRes.text() : 'Partner Terms';
  const docHash = crypto.createHash('sha256').update(termsHtml).digest('hex');

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const drawText = (text: string, x: number, y: number, size = 12) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  };

  let y = height - 50;
  drawText('TERMENI ȘI CONDIȚII - PROGRAM DE PARTENERIAT OTKA', 50, y, 14); y -= 24;
  drawText(`Versiune: ${version}`, 50, y); y -= 18;
  drawText(`Data: ${new Date().toLocaleString('ro-RO')}`, 50, y); y -= 24;

  drawText('Date Partener:', 50, y, 13); y -= 18;
  drawText(`Companie: ${profile?.company_name || '-'}`, 50, y); y -= 16;
  drawText(`CIF: ${profile?.vat_id || '-'}`, 50, y); y -= 16;
  drawText(`Reprezentant: ${profile?.contact_name || '-'}`, 50, y); y -= 16;
  drawText(`Email: ${profile?.email || user.email}`, 50, y); y -= 24;

  drawText('Declarații:', 50, y, 13); y -= 18;
  drawText(`- Accept termeni: ${accept_terms ? 'DA' : 'NU'}`, 50, y); y -= 16;
  drawText(`- Accept GDPR: ${accept_gdpr ? 'DA' : 'NU'}`, 50, y); y -= 16;
  drawText(`- Confirm date reale: ${confirm_data ? 'DA' : 'NU'}`, 50, y); y -= 24;

  drawText(`Hash document: ${docHash.substring(0, 32)}...`, 50, y); y -= 16;
  drawText(`IP: (setează din request headers X-Forwarded-For)`, 50, y); y -= 16;

  const pdfBytes = await pdfDoc.save();

  const key = `agreements/${user.email.replace(/[^a-zA-Z0-9-_\.]/g, '_')}_${Date.now()}.pdf`;
  const put = new PutObjectCommand({ Bucket: R2_CONFIG.bucketName, Key: key, Body: Buffer.from(pdfBytes), ContentType: 'application/pdf' });
  await r2Client.send(put);
  const pdfUrl = `${R2_CONFIG.publicUrl}/${key}`;

  // Save agreement record
  const ip = request.headers.get('x-forwarded-for') || '';
  await supabase.from('partner_agreements').insert({ email: user.email, version, ip, doc_hash: docHash, pdf_url: pdfUrl, accept_terms, accept_gdpr, confirm_data });

  return NextResponse.json({ ok: true, pdfUrl });
}
