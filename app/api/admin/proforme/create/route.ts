import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating proforma with data:', body);

    const {
      customer_name,
      customer_email,
      customer_company,
      customer_cui,
      customer_address,
      notes,
      items = [],
    } = body;

    // Validation
    if (!customer_name || !customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);

    // VAT calculation (assuming 19% VAT rate)
    const vat_rate = 19;
    const vat_amount = subtotal * (vat_rate / 100);
    const total = subtotal + vat_amount;

    // Generate proforma number
    const proformaNumber = `PF-${Date.now()}`;

    // Insert proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .insert({
        proforma_number: proformaNumber,
        customer_name,
        customer_email,
        customer_company,
        customer_cui,
        customer_address,
        notes,
        subtotal,
        vat_rate,
        vat_amount,
        total,
        status: 'draft',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (proformaError) {
      console.error('Error creating proforma:', proformaError);
      return NextResponse.json(
        { success: false, error: proformaError.message },
        { status: 500 }
      );
    }

    // Insert proforma items
    const itemsWithProformaId = items.map((item: any) => ({
      proforma_id: proforma.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('proforme_items')
      .insert(itemsWithProformaId)
      .select();

    if (itemsError) {
      console.error('Error creating proforma items:', itemsError);
      // Rollback proforma creation
      await supabase.from('proforme').delete().eq('id', proforma.id);
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        proforma,
        items: insertedItems,
      },
    });
  } catch (error: any) {
    console.error('Error in proforme/create:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
