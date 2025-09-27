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

    // Validare completă
    const errors: string[] = [];

    // Validare câmpuri obligatorii
    if (!company_name?.trim()) errors.push('Numele companiei este obligatoriu');
    if (!vat_id?.trim()) errors.push('CUI/CIF este obligatoriu');
    if (!contact_name?.trim()) errors.push('Numele persoanei de contact este obligatoriu');
    if (!email?.trim()) errors.push('Email-ul este obligatoriu');

    // Validare email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Format email invalid');
    }

    // Validare CUI/CIF format (România)
    if (vat_id) {
      const vatRegex = /^(RO)?[0-9]{2,10}$/;
      if (!vatRegex.test(vat_id.replace(/\s/g, ''))) {
        errors.push('Format CUI/CIF invalid (ex: RO12345678)');
      }
    }

    // Validare nume companie (minim 3 caractere)
    if (company_name && company_name.trim().length < 3) {
      errors.push('Numele companiei trebuie să aibă minim 3 caractere');
    }

    // Validare nume contact (minim 2 cuvinte)
    if (contact_name && contact_name.trim().split(' ').length < 2) {
      errors.push('Numele persoanei de contact trebuie să conțină prenume și nume');
    }

    // Validare telefon (dacă este completat)
    if (phone) {
      const phoneRegex = /^(\+4|4|0)[0-9]{8,9}$/;
      if (!phoneRegex.test(phone.replace(/\s|-/g, ''))) {
        errors.push('Format telefon invalid (ex: +40123456789)');
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(`Erori de validare: ${errors.join(', ')}`, { status: 400 });
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

    // Redirecționez către pagina de confirmare
    return NextResponse.redirect(new URL('/parteneri/solicita-cont/confirmare', request.url));

  } catch (error) {
    console.error('Eroare la procesarea cererii de parteneriat:', error);
    return NextResponse.json('Eroare de sistem. Încercați din nou.', { status: 500 });
  }
}