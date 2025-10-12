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
  vat_rate?: number;
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

  // Header - Company Name
  page.drawText(companySettings.company_name || 'MERCURY VC S.R.L.', {
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

  page.drawText(`Nr: ${proforma.full_number}`, {
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
    companySettings.company_name || 'MERCURY VC S.R.L.',
    `CIF: ${companySettings.cui || 'RO48801623'}`,
    `Reg. Com: ${companySettings.reg_com || 'J2023003937126'}`,
    `Adresa: ${companySettings.address || 'Bld. Eroilor, Nr.42, Et.I, Ap.9'}`,
    `${companySettings.city || 'Cluj-Napoca'}, Jud.: ${companySettings.county || 'Cluj'}`,
    `Banca: ${companySettings.bank_name || 'BANCA TRANSILVANIA'}`,
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
    proforma.client_name,
    proforma.client_cui ? `CIF: ${proforma.client_cui}` : '',
    proforma.client_reg_com ? `Reg. Com: ${proforma.client_reg_com}` : '',
    proforma.client_address || '',
    proforma.client_city && proforma.client_county ? `${proforma.client_city}, Jud.: ${proforma.client_county}` : '',
    proforma.client_email ? `Email: ${proforma.client_email}` : '',
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
    description: 80,
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
    { text: 'Denumirea produselor', x: colX.description },
    { text: 'U.M.', x: colX.um },
    { text: 'Cant.', x: colX.qty },
    { text: 'Pret/u (EUR)', x: colX.price },
    { text: 'Valoare (EUR)', x: colX.value },
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

  // Draw items
  items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unit_price;

    page.drawText(`${index + 1}`, {
      x: colX.nr,
      y,
      size: 8,
      font: regularFont,
    });

    // Product name with wrapping
    const productName = item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name;
    page.drawText(productName, {
      x: colX.description,
      y,
      size: 8,
      font: regularFont,
    });

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

    y -= 15;

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
  const vatRate = proforma.vat_rate || 19;
  
  // Total without VAT
  page.drawText('Total fara TVA:', {
    x: 350,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText(`${proforma.subtotal_no_vat.toFixed(2)} EUR`, {
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
  page.drawText(`${proforma.total_vat.toFixed(2)} EUR`, {
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
  page.drawText(`${proforma.total_with_vat.toFixed(2)} EUR`, {
    x: 470,
    y: y + 5,
    size: 12,
    font: boldFont,
    color: rgb(0.8, 0, 0),
  });
  y -= 30;

  // RON equivalent
  const totalRON = proforma.total_with_vat * EUR_TO_RON;
  page.drawText(`Echivalent: ${totalRON.toFixed(2)} RON`, {
    x: 470,
    y,
    size: 9,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(`(Curs: 1 EUR = ${EUR_TO_RON} Lei)`, {
    x: 470,
    y: y - 12,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Footer
  y = 80;
  page.drawText('Intocmit de: Vasile Marian HOTCA', {
    x: 50,
    y,
    size: 8,
    font: regularFont,
  });

  page.drawText('Facturez cu SmartBill.ro, standardul facturarii electronice', {
    x: 50,
    y: 50,
    size: 7,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
