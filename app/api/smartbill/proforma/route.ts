import { NextResponse } from 'next/server';
import { r2Client, R2_CONFIG } from '../../../../lib/r2-client';
import { nanoid } from 'nanoid';
import { PutObjectCommand } from '@aws-sdk/client-s3';

type Product = { name: string; sku: string; quantity: number; price: number };

type Payload = {
  clientType: 'individual' | 'company';
  clientName: string;
  companyName?: string;
  regCom?: string;
  clientCIF?: string;
  address: string;
  email: string;
  phone?: string;
  products: Product[];
};

export async function POST(request: Request) {
  const username = process.env.SMARTBILL_USERNAME;
  const token = process.env.SMARTBILL_TOKEN;
  if (!username || !token) {
    return NextResponse.json({ error: 'SmartBill credentials missing' }, { status: 500 });
  }

  const body = (await request.json()) as Payload;

  const clientName = body.clientType === 'company' ? (body.companyName || body.clientName) : body.clientName;
  const vatCode = body.clientType === 'company' ? (body.clientCIF || '') : '';

  const proformaData = {
    companyVatCode: 'RO48801623',
    client: {
      name: clientName,
      vatCode: vatCode,
      address: body.address,
      email: body.email,
      phone: body.phone || '',
    },
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    seriesName: 'PF',
    products: (body.products || []).map((p) => ({
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

    // Try to download the PDF
    let pdfUrl: string | null = null;
    try {
      if (result.url) {
        const pdfRes = await fetch(result.url);
        if (pdfRes.ok) {
          const arrayBuffer = await pdfRes.arrayBuffer();
          const key = `proforme/${nanoid()}.pdf`;
          const put = new PutObjectCommand({ Bucket: R2_CONFIG.bucketName, Key: key, Body: Buffer.from(arrayBuffer), ContentType: 'application/pdf' });
          await r2Client.send(put);
          pdfUrl = `${R2_CONFIG.publicUrl}/${key}`;
        }
      }
    } catch {}

    // Save order JSON mirror (for audit)
    try {
      const orderKey = `orders/${nanoid()}.json`;
      const orderBlob = Buffer.from(JSON.stringify({
        createdAt: new Date().toISOString(),
        clientType: body.clientType,
        clientName,
        vatCode,
        address: body.address,
        email: body.email,
        phone: body.phone || '',
        products: body.products,
        smartbill: { number: result.number, url: result.url },
        pdfUrl,
      }, null, 2));
      const putOrder = new PutObjectCommand({ Bucket: R2_CONFIG.bucketName, Key: orderKey, Body: orderBlob, ContentType: 'application/json' });
      await r2Client.send(putOrder);
    } catch {}

    return NextResponse.json({ success: true, number: result.number, url: result.url, pdfUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
