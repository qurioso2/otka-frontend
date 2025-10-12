import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    
    console.log('=== PROFORMA CREATE DEBUG ===');
    console.log('Body received:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.email || !body.clientName || !body.products || body.products.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Date incomplete: Email, nume și produse sunt obligatorii' 
      }, { status: 400 });
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

    console.log('Next proforma number:', fullNumber);

    // Calculate totals
    const defaultTaxRate = 19;
    let subtotalNoVat = 0;
    let totalVat = 0;

    body.products.forEach((p: any) => {
      const itemSubtotal = p.quantity * p.price;
      subtotalNoVat += itemSubtotal;
      totalVat += (itemSubtotal * defaultTaxRate) / 100;
    });

    const totalWithVat = subtotalNoVat + totalVat;

    console.log('Totals calculated:', { subtotalNoVat, totalVat, totalWithVat });

    // Prepare proforma data - MINIMAL VERSION
    const proformaData: any = {
      series: 'PRF',
      number: nextNumber,
      full_number: fullNumber,
      issue_date: new Date().toISOString().split('T')[0],
      client_type: body.clientType === 'company' ? 'PJ' : 'PF',
      client_name: body.clientType === 'company' ? (body.companyName || body.clientName) : body.clientName,
      client_email: body.email,
      currency: 'RON',
      subtotal_no_vat: subtotalNoVat,
      total_vat: totalVat,
      total_with_vat: totalWithVat,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Add optional fields only if they exist in schema
    if (body.clientCIF) proformaData.client_cui = body.clientCIF;
    if (body.regCom) proformaData.client_reg_com = body.regCom;
    if (body.phone) proformaData.client_phone = body.phone;
    if (body.billingAddress) proformaData.client_address = body.billingAddress;

    // Try to add new schema fields
    try {
      if (body.billingCity) proformaData.client_city = body.billingCity;
      if (body.billingCounty) proformaData.client_county = body.billingCounty;
      if (body.shippingAddress || body.billingAddress) {
        proformaData.shipping_address = body.sameAddress ? body.billingAddress : (body.shippingAddress || body.billingAddress);
      }
      if (body.shippingCity || body.billingCity) {
        proformaData.shipping_city = body.sameAddress ? body.billingCity : (body.shippingCity || body.billingCity);
      }
      if (body.shippingCounty || body.billingCounty) {
        proformaData.shipping_county = body.sameAddress ? body.billingCounty : (body.shippingCounty || body.billingCounty);
      }
    } catch (e) {
      console.log('New schema fields not available, using basic fields only');
    }

    console.log('Proforma data to insert:', JSON.stringify(proformaData, null, 2));

    // Insert proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .insert(proformaData)
      .select()
      .single();

    if (proformaError) {
      console.error('Proforma insert error:', proformaError);
      return NextResponse.json({ 
        success: false, 
        error: `Eroare la crearea proformei: ${proformaError.message}` 
      }, { status: 500 });
    }

    if (!proforma) {
      return NextResponse.json({ 
        success: false, 
        error: 'Proforma nu a fost creată (no data returned)' 
      }, { status: 500 });
    }

    console.log('Proforma created successfully:', proforma.id);

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
    const itemsToInsert = body.products.map((p: any) => ({
      proforma_id: proforma.id,
      sku: p.sku || 'N/A',
      name: p.name,
      quantity: p.quantity,
      unit_price: p.price,
      tax_rate_id: taxRateId,
      tax_rate_value: defaultTaxRate,
    }));

    console.log('Inserting items:', itemsToInsert.length);

    const { error: itemsError } = await supabase
      .from('proforma_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Items insert error:', itemsError);
      // Continue anyway - proforma is created
    }

    console.log('=== PROFORMA CREATED SUCCESSFULLY ===');

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
    console.error('=== CRITICAL ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      success: false, 
      error: `Eroare internă: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}
