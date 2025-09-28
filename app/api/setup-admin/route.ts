import { getServerSupabase } from '@/app/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    
    // Check if admin users already exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('role', 'admin');
    
    if (checkError) {
      return NextResponse.json({ 
        error: 'Failed to check existing admins', 
        details: checkError.message 
      }, { status: 500 });
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ 
        message: 'Admin users already exist', 
        adminCount: existingAdmins.length,
        admins: existingAdmins.map(admin => admin.email)
      });
    }
    
    // Create default admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@otka.ro',
          role: 'admin',
          partner_status: 'active',
          company_name: 'MERCURY VC S.R.L.',
          contact_name: 'Administrator OTKA',
          phone: '+40 700 000 000',
          vat_id: 'RO48801623'
        }
      ])
      .select();
    
    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to create admin user', 
        details: insertError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Admin user created successfully',
      admin: newAdmin?.[0] || null
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Setup failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    
    // Just check current admin users
    const { data: admins, error } = await supabase
      .from('users')
      .select('email, role, partner_status, company_name')
      .eq('role', 'admin');
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch admin users', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      adminCount: admins?.length || 0,
      admins: admins || []
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Check failed', 
      details: error.message 
    }, { status: 500 });
  }
}