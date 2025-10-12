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

const EUR_TO_RON = 5.0639; // Exchange rate

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

  page.drawText(`Nr: ${removeDiacritics(proforma.full_number)}`, {
    x: width - 180,
    y: height - 75,
    size: 12,
    font: regularFont,
  });

  page.drawText(`Data: ${new Date(proforma.issue_date).toLocaleDateString('ro-RO')}`, {
    x: width - 180,
    y: height - 90,
    size: 10,
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
    `Reg. Com: ${removeDiacritics(companySettings.reg_com || 'J2023003937126')}`,
    `Adresa: ${removeDiacritics(companySettings.address || 'Bld. Eroilor, Nr.42, Et.I, Ap.9')}`,
    `${removeDiacritics(companySettings.city || 'Cluj-Napoca')}, Jud.: ${removeDiacritics(companySettings.county || 'Cluj')}`,
    `Banca: ${removeDiacritics(companySettings.bank_name || 'BANCA TRANSILVANIA')}`,
    `IBAN (EUR): ${companySettings.iban_eur || 'RO34BTRLEURCRT0CX2815301'}`,
    `IBAN (RON): ${companySettings.iban_ron || 'RO87BTRLRONCRT0CX2815301'}`,
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
    proforma.client_cui ? `CIF: ${removeDiacritics(proforma.client_cui)}` : '',
    proforma.client_reg_com ? `Reg. Com: ${removeDiacritics(proforma.client_reg_com)}` : '',
    proforma.client_address ? removeDiacritics(proforma.client_address) : '',
    proforma.client_city && proforma.client_county ? `${removeDiacritics(proforma.client_city)}, Jud.: ${removeDiacritics(proforma.client_county)}` : '',
    proforma.client_email || '',
  ].filter(Boolean);

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
    sku: 70,
    description: 130,
    um: 320,
    qty: 360,
    price: 410,
    value: 480,
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
    { text: 'Nr.', x: colX.nr },
    { text: 'SKU', x: colX.sku },
    { text: 'Denumirea produselor', x: colX.description },
    { text: 'U.M.', x: colX.um },
    { text: 'Cant.', x: colX.qty },
    { text: 'Pret/u (LEI)', x: colX.price },
    { text: 'Valoare (LEI)', x: colX.value },
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

  // Totals section
  const vatRate = 19; // Fixed VAT rate as default
  
  // Total without VAT
  page.drawText('Total fara TVA:', {
    x: 350,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText(`${proforma.subtotal_no_vat.toFixed(2)} LEI`, {
    x: 470,
    y,
    size: 10,
    font: regularFont,
  });
  y -= 15;

  // VAT
  page.drawText(`TVA (${vatRate}%):`, {
    x: 350,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText(`${proforma.total_vat.toFixed(2)} LEI`, {
    x: 470,
    y,
    size: 10,
    font: regularFont,
  });
  y -= 20;

  // Total with VAT
  page.drawRectangle({
    x: 345,
    y: y - 5,
    width: 200,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText('TOTAL PLATA:', {
    x: 350,
    y: y + 5,
    size: 12,
    font: boldFont,
  });
  page.drawText(`${proforma.total_with_vat.toFixed(2)} LEI`, {
    x: 470,
    y: y + 5,
    size: 12,
    font: boldFont,
    color: rgb(0.8, 0, 0),
  });
  y -= 30;

  // Remove RON equivalent (we're already in RON/LEI)

  // Footer
  y = 80;
  page.drawText('Intocmit de: Vasile Marian HOTCA', {
    x: 50,
    y,
    size: 8,
    font: regularFont,
  });

  // Removed SmartBill text as requested

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
