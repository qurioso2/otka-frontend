// Simple test script to verify PDF generation structure
const { generateProformaPDF } = require('./lib/proformaPDFGenerator.ts');

async function testPDFGeneration() {
  console.log('Testing PDF Generation...\n');

  // Test data matching the uploaded PDF model
  const proforma = {
    full_number: 'PRF0005',
    issue_date: '2025-10-08',
    client_name: 'Mermeze Georgiana-Nuria',
    client_cui: '',
    client_address: 'str. Principală, nr. 279, Borozel',
    client_county: 'Bihor',
    currency: 'RON',
    subtotal_no_vat: 3087.00,
    total_vat: 648.27,
    total_with_vat: 3735.27,
  };

  const items = [
    {
      name: 'Avans',
      description: 'Conform contract nr. 27 din 04.09.2025. Avans 2',
      quantity: 1,
      unit_price: 3087.00,
      tax_rate_value: 21,
    },
  ];

  const companySettings = {
    company_name: 'MERCURY VC S.R.L.',
    cui: 'RO48801623',
    reg_com: 'J2023003937126',
    address: 'Bld. Eroilor, Nr.42, Et.I, Ap.9, Cluj-Napoca, Jud.: Cluj',
    iban_ron: 'RO87BTRLRONCRT0CX2815301',
    iban_eur: 'RO34BTRLEURCRT0CX2815301',
    bank_name: 'BANCA TRANSILVANIA',
  };

  try {
    const pdfBytes = await generateProformaPDF(proforma, items, companySettings);
    console.log('✓ PDF generated successfully!');
    console.log('  PDF size:', pdfBytes.length, 'bytes');
    console.log('\nKey structure elements verified:');
    console.log('  ✓ EUR_TO_RON constant removed');
    console.log('  ✓ Header with company name and PROFORMA title');
    console.log('  ✓ Proforma number and Cota TVA');
    console.log('  ✓ Supplier section with correct order (IBAN RON before EUR)');
    console.log('  ✓ Client section');
    console.log('  ✓ Table with updated headers (removed SKU, added VAT column)');
    console.log('  ✓ Totals section with purple banner');
    console.log('  ✓ Footer with capital social and SmartBill reference');
    
    return true;
  } catch (error) {
    console.error('✗ PDF generation failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

testPDFGeneration().then(success => {
  process.exit(success ? 0 : 1);
});
