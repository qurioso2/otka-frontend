import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

type Product = { 
  name: string; 
  sku: string; 
  quantity: number; 
  price: number;
  tax_rate?: number;
};

type Payload = {
  clientType: 'individual' | 'company';
  clientName: string;
  companyName?: string;
  regCom?: string;
  clientCIF?: string;
  billingAddress: string;
  billingCity: string;
  billingCounty: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCounty?: string;
  sameAddress?: boolean;
  email: string;
  phone?: string;
  products: Product[];
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = (await request.json()) as Payload;
    
    // Validate required fields
    if (!body.email || !body.clientName || body.products.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Date incomplete: Email, nume și produse sunt obligatorii' 
      }, { status: 400 });
    }

    // Get or create client
    let clientId: number | null = null;
    
    // Check if client exists
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('email', body.email)
      .limit(1);

    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id;
      
      // Update client info
      await supabase
        .from('clients')
        .update({
          name: body.clientName,
          company: body.companyName || null,
          cui: body.clientCIF || null,
          reg_com: body.regCom || null,
          phone: body.phone || null,
          billing_address: body.billingAddress,
          billing_city: body.billingCity,
          billing_county: body.billingCounty,
          shipping_address: body.sameAddress ? body.billingAddress : (body.shippingAddress || body.billingAddress),
          shipping_city: body.sameAddress ? body.billingCity : (body.shippingCity || body.billingCity),
          shipping_county: body.sameAddress ? body.billingCounty : (body.shippingCounty || body.billingCounty),
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: body.clientName,
          email: body.email,
          company: body.companyName || null,
          cui: body.clientCIF || null,
          reg_com: body.regCom || null,
          phone: body.phone || null,
          billing_address: body.billingAddress,
          billing_city: body.billingCity,
          billing_county: body.billingCounty,
          shipping_address: body.sameAddress ? body.billingAddress : (body.shippingAddress || body.billingAddress),
          shipping_city: body.sameAddress ? body.billingCity : (body.shippingCity || body.billingCity),
          shipping_county: body.sameAddress ? body.billingCounty : (body.shippingCounty || body.billingCounty),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (clientError) {
        console.error('Client creation error:', clientError);
      } else if (newClient) {
        clientId = newClient.id;
      }
    }

    // Get next proforma number
    const { data: lastProforma } = await supabase
      .from('proforme')
      .select('number')
      .eq('series', 'PRF')
      .order('number', { ascending: false })
      .limit(1);

    const nextNumber = lastProforma && lastProforma.length > 0 ? lastProforma[0].number + 1 : 1;
    const fullNumber = `PRF${String(nextNumber).padStart(6, '0')}`;

    // Calculate totals
    const defaultTaxRate = 19; // Default VAT rate
    let subtotalNoVat = 0;
    let totalVat = 0;

    body.products.forEach(p => {
      const itemSubtotal = p.quantity * p.price;
      subtotalNoVat += itemSubtotal;
      const taxRate = p.tax_rate || defaultTaxRate;
      totalVat += (itemSubtotal * taxRate) / 100;
    });

    const totalWithVat = subtotalNoVat + totalVat;

    // Create proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .insert({
        series: 'PRF',
        number: nextNumber,
        full_number: fullNumber,
        issue_date: new Date().toISOString().split('T')[0],
        client_type: body.clientType === 'company' ? 'PJ' : 'PF',
        client_name: body.clientType === 'company' ? (body.companyName || body.clientName) : body.clientName,
        client_cui: body.clientCIF || null,
        client_reg_com: body.regCom || null,
        client_email: body.email,
        client_phone: body.phone || null,
        client_address: body.billingAddress,
        client_city: body.billingCity,
        client_county: body.billingCounty,
        shipping_address: body.sameAddress ? body.billingAddress : (body.shippingAddress || body.billingAddress),
        shipping_city: body.sameAddress ? body.billingCity : (body.shippingCity || body.billingCity),
        shipping_county: body.sameAddress ? body.billingCounty : (body.shippingCounty || body.billingCounty),
        currency: 'RON',
        subtotal_no_vat: subtotalNoVat,
        total_vat: totalVat,
        total_with_vat: totalWithVat,
        vat_rate: defaultTaxRate,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (proformaError || !proforma) {
      console.error('Proforma creation error:', proformaError);
      return NextResponse.json({ 
        success: false, 
        error: 'Eroare la crearea proformei' 
      }, { status: 500 });
    }

    // Get default tax rate ID
    const { data: defaultTaxRateData } = await supabase
      .from('tax_rates')
      .select('id')
      .eq('rate', defaultTaxRate)
      .limit(1);

    const taxRateId = defaultTaxRateData && defaultTaxRateData.length > 0 
      ? defaultTaxRateData[0].id 
      : null;

    // Create proforma items
    const itemsToInsert = body.products.map(p => ({
      proforma_id: proforma.id,
      sku: p.sku,
      name: p.name,
      quantity: p.quantity,
      unit_price: p.price,
      tax_rate_id: taxRateId,
      tax_rate_value: p.tax_rate || defaultTaxRate,
    }));

    const { error: itemsError } = await supabase
      .from('proforma_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Proforma items error:', itemsError);
      // Continue anyway - proforma is created
    }

    return NextResponse.json({
      success: true,
      proforma: {
        id: proforma.id,
        number: fullNumber,
        total: totalWithVat,
        email: body.email,
      }
    });

  } catch (error: any) {
    console.error('Internal proforma creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Eroare internă' 
    }, { status: 500 });
  }
}
