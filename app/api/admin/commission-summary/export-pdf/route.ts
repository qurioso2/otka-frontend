import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const end = new Date(start); end.setMonth(start.getMonth() + 1);

  const { data, error } = await supabase
    .from('manual_orders')
    .select('partner_email,total_net,status,created_at')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const map: Record<string, { net: number; orders: number }> = {};
  (data || []).forEach((row: any) => {
    if (row.status !== 'completed') return;
    const k = row.partner_email as string;
    if (!map[k]) map[k] = { net: 0, orders: 0 };
    map[k].net += Number(row.total_net || 0);
    map[k].orders += 1;
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const title = `Comisioane — ${start.toISOString().slice(0,7)}`;
  page.drawText(title, { x: 50, y: 800, size: 18, font, color: rgb(0,0,0) });

  let y = 770;
  page.drawText('Partener', { x: 50, y, size: 12, font });
  page.drawText('Comenzi', { x: 280, y, size: 12, font });
  page.drawText('Total Net (RON)', { x: 350, y, size: 12, font });
  page.drawText('Comision 5% (RON)', { x: 470, y, size: 12, font });
  y -= 20;

  let totalNet = 0;
  let totalCom = 0;

  Object.entries(map).forEach(([email, v]) => {
    const commission = v.net * 0.05;
    totalNet += v.net; totalCom += commission;
    if (y < 50) {
      y = 800; pdf.addPage();
    page.drawText(email, { x: 50, y, size: 10, font });
    page.drawText(String(v.orders), { x: 280, y, size: 10, font });
    page.drawText(v.net.toFixed(2), { x: 350, y, size: 10, font });
    page.drawText(commission.toFixed(2), { x: 470, y, size: 10, font });
    y -= 16;
  });

  y -= 10;
  page.drawText('TOTAL', { x: 50, y, size: 12, font });
  page.drawText(totalNet.toFixed(2), { x: 350, y, size: 12, font });
  page.drawText(totalCom.toFixed(2), { x: 470, y, size: 12, font });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comisioane-${start.toISOString().slice(0,7)}.pdf"`
  });
