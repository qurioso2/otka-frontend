import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const username = process.env.SMARTBILL_USERNAME;
  const token = process.env.SMARTBILL_TOKEN;
  if (!username || !token) {
    return NextResponse.json({ error: 'SmartBill credentials missing' }, { status: 500 });
  }

  const body = await request.json();
  const proformaData = {
    companyVatCode: 'RO48801623',
    client: {
      name: body.clientName,
      vatCode: body.clientCIF || '',
      address: body.address,
      email: body.email,
      phone: body.phone,
    },
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    seriesName: 'PF',
    products: (body.products || []).map((p: { name: string; sku: string; quantity: number; price: number }) => ({
      name: p.name,
      code: p.sku,
      quantity: p.quantity,
      price: p.price,
      vatPercentage: 19,
      measurementUnit: 'buc',
    })),
    language: 'RO',
    precision: 2,
    currency: 'RON',
  };

  try {
    const res = await fetch('https://ws.smartbill.ro/SBORO/api/estimate', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(username + ':' + token).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proformaData),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return NextResponse.json({ error: result.errorText || 'SmartBill error' }, { status: 400 });
    }
    return NextResponse.json({ success: true, number: result.number, url: result.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
