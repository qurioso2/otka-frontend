import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const company_name = formData.get('company_name') as string;
    const vat_id = formData.get('vat_id') as string;
    const contact_name = formData.get('contact_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const business_type = formData.get('business_type') as string;
    const address = formData.get('address') as string;
    const annual_volume = formData.get('annual_volume') as string;
    const motivation = formData.get('motivation') as string;
    const accept_terms = formData.get('accept_terms') as string;

    // Validare de bază
    if (!company_name || !vat_id || !contact_name || !email || !accept_terms) {
      return NextResponse.redirect(new URL('/parteneri/solicita-cont?error=Câmpurile obligatorii trebuie completate', request.url));
    }

    const supabase = await getServerSupabase();

    // Verifică dacă email-ul există deja
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.redirect(new URL('/parteneri/solicita-cont?error=Email-ul este deja înregistrat', request.url));
    }

    // Generează magic token pentru primul login
    const magic_token = nanoid(32);

    // Creează înregistrarea în tabelul users
    const { error } = await supabase.from('users').insert({
      email,
      company_name,
      vat_id,
      contact_name,
      phone,
      business_type,
      address,
      annual_volume,
      motivation,
      role: 'partner',
      partner_status: 'pending', // În așteptare pentru aprobare
      magic_token,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error creating partner request:', error);
      return NextResponse.redirect(new URL('/parteneri/solicita-cont?error=Eroare la procesarea cererii', request.url));
    }

    // Redirecționează către pagina de confirmare
    return NextResponse.redirect(new URL('/parteneri/solicita-cont/confirmare', request.url));

  } catch (error) {
    console.error('Error processing partner request:', error);
    return NextResponse.redirect(new URL('/parteneri/solicita-cont?error=Eroare de sistem', request.url));
  }
}