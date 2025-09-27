import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = {
      company_name: formData.get('company_name') as string,
      vat_id: formData.get('vat_id') as string,
      contact_name: formData.get('contact_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      business_type: formData.get('business_type') as string,
      address: formData.get('address') as string,
      annual_volume: formData.get('annual_volume') as string,
      motivation: formData.get('motivation') as string,
    };
    
    const { 
      company_name, 
      vat_id, 
      contact_name, 
      email, 
      phone, 
      business_type, 
      address, 
      annual_volume, 
      motivation 
    } = data;

    // Validare de bază
    if (!company_name || !vat_id || !contact_name || !email) {
      return NextResponse.json('Câmpurile obligatorii trebuie completate', { status: 400 });
    }

    // Validare email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json('Format email invalid', { status: 400 });
    }

    // Pentru simplicitate, salvez datele într-un fișier sau le trimit prin email
    // În producție, aici ar fi logica pentru salvarea în baza de date
    
    const partnerData = {
      company_name,
      vat_id,
      contact_name,
      email,
      phone: phone || '',
      business_type: business_type || '',
      address: address || '',
      annual_volume: annual_volume || '',
      motivation: motivation || '',
      submitted_at: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Cerere parteneriat primită:', partnerData);

    // Aici poți adăuga logica pentru:
    // 1. Salvarea în baza de date
    // 2. Trimiterea unui email de notificare către admin
    // 3. Trimiterea unui email de confirmare către solicitant

    // Simulez o întârziere pentru UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      message: 'Cererea a fost înregistrată cu succes' 
    });

  } catch (error) {
    console.error('Eroare la procesarea cererii de parteneriat:', error);
    return NextResponse.json('Eroare de sistem. Încercați din nou.', { status: 500 });
  }
}