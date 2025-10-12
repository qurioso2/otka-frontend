import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type ProformaData = {
  full_number: string;
  issue_date: string;
  client_name: string;
  client_email?: string;
  client_cui?: string;
  client_reg_com?: string;
  client_address?: string;
  client_city?: string;
  client_county?: string;
  currency: string;
  subtotal_no_vat: number;
  total_vat: number;
  total_with_vat: number;
};

type ProformaItem = {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate_value: number;
};

type CompanySettings = {
  company_name?: string;
  cui?: string;
  reg_com?: string;
  address?: string;
  city?: string;
  county?: string;
  iban_ron?: string;
  iban_eur?: string;
  bank_name?: string;
};

// Helper function to remove Romanian diacritics
function removeDiacritics(text: string): string {
  if (!text) return '';
  return text
    .replace(/[ăâ]/gi, 'a')
    .replace(/[î]/gi, 'i')
    .replace(/[ș]/gi, 's')
    .replace(/[ț]/gi, 't')
    .replace(/[Ă]/gi, 'A')
    .replace(/[Â]/gi, 'A')
    .replace(/[Î]/gi, 'I')
    .replace(/[Ș]/gi, 'S')
    .replace(/[Ț]/gi, 'T');
}

export async function generateProformaPDF(
  proforma: ProformaData,
  items: ProformaItem[],
  companySettings: CompanySettings = {}
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;

  // Header - Company Name (remove diacritics)
  page.drawText(removeDiacritics(companySettings.company_name || 'MERCURY VC S.R.L.'), {
    x: 50,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.5),
  });
  y -= 30;

  // Document Title
  page.drawText('PROFORMA', {
    x: width - 180,
    y: height - 50,
    size: 24,
    font: boldFont,
    color: rgb(0.8, 0, 0),
  });

  page.drawText(removeDiacritics(proforma.full_number), {
    x: width - 180,
    y: height - 75,
    size: 14,
    font: boldFont,
  });

  // Calculate VAT rate from data
  const calculatedVatRate = proforma.subtotal_no_vat > 0 
    ? Math.round((proforma.total_vat / proforma.subtotal_no_vat) * 100)
    : 19;

  page.drawText(`Cota TVA: ${calculatedVatRate}%`, {
    x: width - 180,
    y: height - 92,
    size: 10,
    font: regularFont,
  });

  page.drawText(`Data emiterii: ${new Date(proforma.issue_date).toLocaleDateString('ro-RO')}`, {
    x: width - 180,
    y: height - 107,
    size: 9,
    font: regularFont,
  });

  // Supplier Section
  page.drawText('Furnizor:', {
    x: 50,
    y,
    size: 12,
    font: boldFont,
  });
  y -= 15;

  const supplierInfo = [
    removeDiacritics(companySettings.company_name || 'MERCURY VC S.R.L.'),
    `CIF: ${removeDiacritics(companySettings.cui || 'RO48801623')}`,
    `Reg. com.: ${removeDiacritics(companySettings.reg_com || 'J2023003937126')}`,
    `Adresa: ${removeDiacritics(companySettings.address || 'Bld. Eroilor, Nr.42, Et.I, Ap.9, Cluj-Napoca, Jud.: Cluj')}`,
    `IBAN(RON) ${companySettings.iban_ron || 'RO87BTRLRONCRT0CX2815301'}`,
    `Banca: ${removeDiacritics(companySettings.bank_name || 'BANCA TRANSILVANIA')}`,
  ];

  supplierInfo.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y,
      size: 9,
      font: regularFont,
    });
    y -= 12;
  });

  y -= 10;

  // Client Section
  page.drawText('Client:', {
    x: 50,
    y,
    size: 12,
    font: boldFont,
  });
  y -= 15;

  const clientInfo = [
    removeDiacritics(proforma.client_name),
    `CIF: ${proforma.client_cui ? removeDiacritics(proforma.client_cui) : ''}`,
    proforma.client_address ? `Adresa: ${removeDiacritics(proforma.client_address)}${proforma.client_city ? ', ' + removeDiacritics(proforma.client_city) : ''}${proforma.client_county ? ', Judet: ' + removeDiacritics(proforma.client_county) : ''}` : '',
  ].filter(line => line && line !== 'CIF: ');

  clientInfo.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y,
      size: 9,
      font: regularFont,
    });
    y -= 12;
  });

  y -= 20;

  // Table Header
  const tableTop = y;
  const colX = {
    nr: 50,
    description: 90,
    um: 300,
    qty: 340,
    price: 390,
    value: 460,
    vat: 510,
  };

  // Draw table header background
  page.drawRectangle({
    x: 45,
    y: y - 5,
    width: width - 90,
    height: 20,
    color: rgb(0.9, 0.9, 0.9),
  });

  const headers = [
    { text: 'Nr. crt', x: colX.nr },
    { text: '', x: colX.sku },
    { text: 'Denumirea produselor sau a serviciilor', x: colX.description },
    { text: 'U.M.', x: colX.um },
    { text: 'Cant.', x: colX.qty },
    { text: 'Pret unitar (fara TVA) -Lei-', x: colX.price },
    { text: 'Valoarea -Lei-', x: colX.value },
  ];

  headers.forEach((header) => {
    page.drawText(header.text, {
      x: header.x,
      y: y + 5,
      size: 9,
      font: boldFont,
    });
  });

  y -= 25;

  // Draw items (remove diacritics from product names)
  items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unit_price;

    page.drawText(`${index + 1}`, {
      x: colX.nr,
      y,
      size: 8,
      font: regularFont,
    });

    // SKU column
    const sku = removeDiacritics((item as any).sku || 'N/A');
    page.drawText(sku.substring(0, 10), {
      x: colX.sku,
      y,
      size: 7,
      font: regularFont,
    });

    // Product name with wrapping (2 lines) and diacritics removed
    const productName = removeDiacritics(item.name);
    if (productName.length > 30) {
      const line1 = productName.substring(0, 30);
      const line2 = productName.substring(30, 60);
      page.drawText(line1, {
        x: colX.description,
        y,
        size: 7,
        font: regularFont,
      });
      page.drawText(line2, {
        x: colX.description,
        y: y - 8,
        size: 7,
        font: regularFont,
      });
    } else {
      page.drawText(productName, {
        x: colX.description,
        y,
        size: 8,
        font: regularFont,
      });
    }

    page.drawText('buc', {
      x: colX.um,
      y,
      size: 8,
      font: regularFont,
    });

    page.drawText(item.quantity.toString(), {
      x: colX.qty,
      y,
      size: 8,
      font: regularFont,
    });

    page.drawText(item.unit_price.toFixed(2), {
      x: colX.price,
      y,
      size: 8,
      font: regularFont,
    });

    page.drawText(itemTotal.toFixed(2), {
      x: colX.value,
      y,
      size: 8,
      font: regularFont,
    });

    y -= productName.length > 30 ? 20 : 15;

    // Add new page if needed
    if (y < 150) {
      const newPage = pdfDoc.addPage([595, 842]);
      y = height - 50;
    }
  });

  y -= 10;

  // Draw line separator
  page.drawLine({
    start: { x: 45, y },
    end: { x: width - 45, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  y -= 30;

  // Totals section - draw subtotal row with gray background
  page.drawRectangle({
    x: 45,
    y: y - 5,
    width: width - 90,
    height: 20,
    color: rgb(0.93, 0.93, 0.93),
  });

  page.drawText('Total', {
    x: 50,
    y: y + 5,
    size: 10,
    font: boldFont,
  });

  page.drawText(`${proforma.subtotal_no_vat.toFixed(2)}`, {
    x: 470,
    y: y + 5,
    size: 10,
    font: regularFont,
  });

  page.drawText(`${proforma.total_vat.toFixed(2)}`, {
    x: width - 70,
    y: y + 5,
    size: 10,
    font: regularFont,
  });

  y -= 30;

  // Purple banner for TOTAL PLATA
  page.drawRectangle({
    x: 0,
    y: y - 5,
    width: width,
    height: 30,
    color: rgb(0.45, 0.33, 0.68), // Purple color
  });

  page.drawText('TOTAL PLATA', {
    x: 50,
    y: y + 8,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${proforma.total_with_vat.toFixed(2)} Lei`, {
    x: width - 150,
    y: y + 8,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  y -= 50;

  // Footer
  y = 80;
  
  // Left footer - company info
  page.drawText(removeDiacritics(companySettings.company_name || 'MERCURY VC S.R.L.'), {
    x: 50,
    y: y + 10,
    size: 8,
    font: regularFont,
  });
  
  page.drawText('Capital social: 200 Lei', {
    x: 50,
    y,
    size: 8,
    font: regularFont,
  });
  
  page.drawText(`IBAN(EUR) ${companySettings.iban_eur || 'RO34BTRLEURCRT0CX2815301'} ; Banca: ${removeDiacritics(companySettings.bank_name || 'BANCA TRANSILVANIA')}`, {
    x: 50,
    y: y - 10,
    size: 7,
    font: regularFont,
  });

  // Right footer - SmartBill reference
  page.drawText('Facturez cu SmartBill.ro, standardul facturarii electronice', {
    x: width - 300,
    y,
    size: 7,
    font: regularFont,
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
