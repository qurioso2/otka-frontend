import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Using supabase from import
    const body = await request.json();

    const { name, rate, active, is_default, description, effective_from, sort_order } = body;

    // Validate required fields
    if (!name || rate === undefined || rate === null) {
      return NextResponse.json(
        { success: false, error: 'Name and rate are required' },
        { status: 400 }
      );

    // If this is being set as default, unset other defaults
    if (is_default) {
      await supabase
        .from('tax_rates')
        .update({ is_default: false })
        .eq('is_default', true);

    // Create tax rate
    const { data, error } = await supabase
      .from('tax_rates')
      .insert({
        name,
        rate: parseFloat(rate),
        active: active ?? true,
        is_default: is_default ?? false,
        description: description || null,
        effective_from: effective_from || null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tax rate:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in tax-rates/create:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
