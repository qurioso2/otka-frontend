import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('manual_orders')
    .select('status,total_net,created_at')
    .eq('partner_email', user.email);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const map: Record<string, { net: number; com: number }> = {};
  (data || []).forEach((row: any) => {
    if (row.status !== 'completed') return;
    const ym = new Date(row.created_at).toISOString().slice(0,7);
    if (!map[ym]) map[ym] = { net: 0, com: 0 };
    map[ym].net += Number(row.total_net || 0);
    map[ym].com += Number(row.total_net || 0) * 0.05;
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText('Situație comisioane', { x: 50, y: 800, size: 18, font, color: rgb(0,0,0) });
  page.drawText(`Partener: ${user.email}`, { x: 50, y: 780, size: 10, font });
  let y = 760;
  page.drawText('Lună', { x: 50, y, size: 12, font });
  page.drawText('Total net (RON)', { x: 250, y, size: 12, font });
  page.drawText('Comision 5% (RON)', { x: 400, y, size: 12, font });
  y -= 20;

  let totalNet = 0, totalCom = 0;
  Object.entries(map).forEach(([m, v]) => {
    totalNet += v.net; totalCom += v.com;
    page.drawText(m, { x: 50, y, size: 10, font });
    page.drawText(v.net.toFixed(2), { x: 250, y, size: 10, font });
    page.drawText(v.com.toFixed(2), { x: 400, y, size: 10, font });
    y -= 16;
  });

  y -= 10;
  page.drawText('TOTAL', { x: 50, y, size: 12, font });
  page.drawText(totalNet.toFixed(2), { x: 250, y, size: 12, font });
  page.drawText(totalCom.toFixed(2), { x: 400, y, size: 12, font });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="comisioane-partener.pdf"' } });
}