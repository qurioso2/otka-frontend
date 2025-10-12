import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ProformaData {
  id: number;
  series: string;
  number: number;
  full_number: string;
  issue_date: string;
  due_date?: string;
  client_type: 'PF' | 'PJ';
  client_name: string;
  client_cui?: string;
  client_reg_com?: string;
  client_address?: string;
  client_city?: string;
  client_county?: string;
  client_country?: string;
  client_phone?: string;
  client_email?: string;
  currency: string;
  subtotal_no_vat: number;
  total_vat: number;
  total_with_vat: number;
  client_notes?: string;
  items: ProformaItem[];
}

interface ProformaItem {
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate_value: number;
  subtotal: number;
  vat_amount: number;
  total: number;
}

interface CompanySettings {
  company_name: string;
  cui?: string;
  reg_com?: string;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  phone?: string;
  email?: string;
  iban_ron?: string;
  iban_eur?: string;
  bank_name?: string;
  terms_and_conditions?: string;
}

export async function generateProformaPDF(
  proformaData: ProformaData,
  companySettings: CompanySettings
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const primaryColor = rgb(37 / 255, 99 / 255, 235 / 255); // #2563EB
  const textColor = rgb(15 / 255, 23 / 255, 42 / 255); // #0F172A
  const mutedColor = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B

  let yPosition = height - 60;

  // ====== HEADER ======
  // Company name (large, bold)
  page.drawText(companySettings.company_name || 'OTKA', {
    x: 50,
    y: yPosition,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });

  yPosition -= 20;

  // Company details (right-aligned)
  const companyDetails = [
    companySettings.cui ? `CUI: ${companySettings.cui}` : null,
    companySettings.reg_com ? `Reg. Com.: ${companySettings.reg_com}` : null,
    companySettings.address || null,
    companySettings.city
      ? `${companySettings.city}${companySettings.county ? ', ' + companySettings.county : ''}`
      : null,
    companySettings.phone ? `Tel: ${companySettings.phone}` : null,
    companySettings.email ? `Email: ${companySettings.email}` : null,
  ].filter(Boolean);

  for (const detail of companyDetails) {
    if (detail) {
      page.drawText(detail, {
        x: 50,
        y: yPosition,
        size: 9,
        font: fontRegular,
        color: mutedColor,
      });
      yPosition -= 12;
    }
  }

  yPosition -= 20;

  // ====== PROFORMA TITLE ======
  page.drawText('FACTURĂ PROFORMĂ', {
    x: 50,
    y: yPosition,
    size: 18,
    font: fontBold,
    color: textColor,
  });

  // Proforma number (right-aligned)
  const proformaNumberText = `${proformaData.full_number}`;
  const proformaNumberWidth = fontBold.widthOfTextAtSize(proformaNumberText, 18);
  page.drawText(proformaNumberText, {
    x: width - 50 - proformaNumberWidth,
    y: yPosition,
    size: 18,
    font: fontBold,
    color: primaryColor,
  });

  yPosition -= 30;

  // ====== DATES ======
  page.drawText(`Data emiterii: ${new Date(proformaData.issue_date).toLocaleDateString('ro-RO')}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: fontRegular,
    color: textColor,
  });

  if (proformaData.due_date) {
    page.drawText(
      `Scadență: ${new Date(proformaData.due_date).toLocaleDateString('ro-RO')}`,
      {
        x: width - 200,
        y: yPosition,
        size: 10,
        font: fontRegular,
        color: textColor,
      }
    );
  }

  yPosition -= 30;

  // ====== CLIENT DETAILS ======
  page.drawText('CLIENT:', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: textColor,
  });

  yPosition -= 18;

  // Client name
  page.drawText(proformaData.client_name, {
    x: 50,
    y: yPosition,
    size: 11,
    font: fontBold,
    color: textColor,
  });

  yPosition -= 14;

  // Client details
  const clientDetails = [
    proformaData.client_type === 'PJ' && proformaData.client_cui
      ? `CUI: ${proformaData.client_cui}`
      : null,
    proformaData.client_type === 'PJ' && proformaData.client_reg_com
      ? `Reg. Com.: ${proformaData.client_reg_com}`
      : null,
    proformaData.client_address || null,
    proformaData.client_city
      ? `${proformaData.client_city}${proformaData.client_county ? ', ' + proformaData.client_county : ''}`
      : null,
    proformaData.client_phone ? `Tel: ${proformaData.client_phone}` : null,
    proformaData.client_email ? `Email: ${proformaData.client_email}` : null,
  ].filter(Boolean);

  for (const detail of clientDetails) {
    if (detail) {
      page.drawText(detail, {
        x: 50,
        y: yPosition,
        size: 9,
        font: fontRegular,
        color: textColor,
      });
      yPosition -= 12;
    }
  }

  yPosition -= 20;

  // ====== PRODUCTS TABLE ======
  const tableStartY = yPosition;
  const tableHeaders = ['Nr.', 'Descriere', 'Cant.', 'Preț unitar', 'TVA %', 'Total'];
  const colWidths = [30, 220, 40, 80, 50, 75];
  let xPos = 50;

  // Table header background
  page.drawRectangle({
    x: 50,
    y: yPosition - 15,
    width: width - 100,
    height: 20,
    color: rgb(241 / 255, 245 / 255, 249 / 255), // #F1F5F9
  });

  // Table headers
  for (let i = 0; i < tableHeaders.length; i++) {
    page.drawText(tableHeaders[i], {
      x: xPos + 5,
      y: yPosition - 10,
      size: 9,
      font: fontBold,
      color: textColor,
    });
    xPos += colWidths[i];
  }

  yPosition -= 25;

  // Table rows
  proformaData.items.forEach((item, index) => {
    xPos = 50;

    // Row background (zebra striping)
    if (index % 2 === 1) {
      page.drawRectangle({
        x: 50,
        y: yPosition - 12,
        width: width - 100,
        height: 20,
        color: rgb(248 / 255, 250 / 255, 252 / 255), // #F8FAFC
      });
    }

    // Nr.
    page.drawText(`${index + 1}`, {
      x: xPos + 5,
      y: yPosition - 8,
      size: 8,
      font: fontRegular,
      color: textColor,
    });
    xPos += colWidths[0];

    // Descriere (with word wrap if needed)
    const itemName = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
    page.drawText(itemName, {
      x: xPos + 5,
      y: yPosition - 8,
      size: 8,
      font: fontRegular,
      color: textColor,
    });
    xPos += colWidths[1];

    // Cantitate
    page.drawText(`${item.quantity}`, {
      x: xPos + 5,
      y: yPosition - 8,
      size: 8,
      font: fontRegular,
      color: textColor,
    });
    xPos += colWidths[2];

    // Preț unitar
    page.drawText(`${item.unit_price.toFixed(2)} ${proformaData.currency}`, {
      x: xPos + 5,
      y: yPosition - 8,
      size: 8,
      font: fontRegular,
      color: textColor,
    });
    xPos += colWidths[3];

    // TVA %
    page.drawText(`${item.tax_rate_value}%`, {
      x: xPos + 5,
      y: yPosition - 8,
      size: 8,
      font: fontRegular,
      color: textColor,
    });
    xPos += colWidths[4];

    // Total
    page.drawText(`${item.total.toFixed(2)} ${proformaData.currency}`, {
      x: xPos + 5,
      y: yPosition - 8,
      size: 8,
      font: fontBold,
      color: textColor,
    });

    yPosition -= 20;
  });

  yPosition -= 10;

  // ====== TOTALS ======
  const totalsX = width - 200;

  // Subtotal fără TVA
  page.drawText('Subtotal (fără TVA):', {
    x: totalsX - 100,
    y: yPosition,
    size: 10,
    font: fontRegular,
    color: textColor,
  });
  page.drawText(`${proformaData.subtotal_no_vat.toFixed(2)} ${proformaData.currency}`, {
    x: totalsX + 50,
    y: yPosition,
    size: 10,
    font: fontRegular,
    color: textColor,
  });

  yPosition -= 16;

  // Total TVA
  page.drawText('TVA:', {
    x: totalsX - 100,
    y: yPosition,
    size: 10,
    font: fontRegular,
    color: textColor,
  });
  page.drawText(`${proformaData.total_vat.toFixed(2)} ${proformaData.currency}`, {
    x: totalsX + 50,
    y: yPosition,
    size: 10,
    font: fontRegular,
    color: textColor,
  });

  yPosition -= 20;

  // Line separator
  page.drawLine({
    start: { x: totalsX - 100, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: mutedColor,
  });

  yPosition -= 16;

  // Total cu TVA (bold, larger)
  page.drawText('TOTAL:', {
    x: totalsX - 100,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: textColor,
  });
  page.drawText(`${proformaData.total_with_vat.toFixed(2)} ${proformaData.currency}`, {
    x: totalsX + 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });

  yPosition -= 40;

  // ====== BANK DETAILS ======
  if (companySettings.iban_ron || companySettings.iban_eur) {
    page.drawText('DATE BANCARE:', {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: textColor,
    });

    yPosition -= 14;

    if (companySettings.bank_name) {
      page.drawText(`Bancă: ${companySettings.bank_name}`, {
        x: 50,
        y: yPosition,
        size: 9,
        font: fontRegular,
        color: textColor,
      });
      yPosition -= 12;
    }

    if (proformaData.currency === 'RON' && companySettings.iban_ron) {
      page.drawText(`IBAN RON: ${companySettings.iban_ron}`, {
        x: 50,
        y: yPosition,
        size: 9,
        font: fontRegular,
        color: textColor,
      });
      yPosition -= 12;
    }

    if (proformaData.currency === 'EUR' && companySettings.iban_eur) {
      page.drawText(`IBAN EUR: ${companySettings.iban_eur}`, {
        x: 50,
        y: yPosition,
        size: 9,
        font: fontRegular,
        color: textColor,
      });
      yPosition -= 12;
    }

    yPosition -= 10;
  }

  // ====== TERMS & CONDITIONS ======
  if (companySettings.terms_and_conditions) {
    page.drawText('TERMENI ȘI CONDIȚII:', {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: textColor,
    });

    yPosition -= 14;

    // Split terms into lines (max 80 chars per line)
    const terms = companySettings.terms_and_conditions;
    const maxLineLength = 80;
    const lines: string[] = [];

    let currentLine = '';
    terms.split(' ').forEach((word) => {
      if ((currentLine + word).length > maxLineLength) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    if (currentLine.trim()) lines.push(currentLine.trim());

    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 8,
        font: fontRegular,
        color: mutedColor,
      });
      yPosition -= 10;
    }
  }

  // ====== FOOTER ======
  page.drawText(
    `Document generat automat de sistemul OTKA la ${new Date().toLocaleString('ro-RO')}`,
    {
      x: 50,
      y: 30,
      size: 7,
      font: fontRegular,
      color: mutedColor,
    }
  );

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
