// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';

// ==================== SHARED HELPERS ====================

const COLORS = {
  primary: [30, 58, 138] as [number, number, number],     // indigo-900
  secondary: [71, 85, 105] as [number, number, number],    // slate-500
  accent: [79, 70, 229] as [number, number, number],       // indigo-600
  dark: [15, 23, 42] as [number, number, number],          // slate-900
  muted: [148, 163, 184] as [number, number, number],      // slate-400
  border: [226, 232, 240] as [number, number, number],     // slate-200
  bg: [248, 250, 252] as [number, number, number],         // slate-50
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],        // green-600
  amber: [217, 119, 6] as [number, number, number],        // amber-600
  red: [220, 38, 38] as [number, number, number],          // red-600
};

function drawLine(doc: jsPDF, y: number, x1 = 20, x2 = 190) {
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function addHeader(doc: jsPDF, builder: any, title: string): number {
  let y = 20;

  // Builder name
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(builder?.company_name || 'Builder', 20, y);

  // Title badge on right
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.accent);
  doc.setFont('helvetica', 'bold');
  const titleWidth = doc.getTextWidth(title);
  doc.setFillColor(...COLORS.bg);
  doc.setDrawColor(...COLORS.accent);
  doc.roundedRect(190 - titleWidth - 10, y - 8, titleWidth + 10, 12, 2, 2, 'FD');
  doc.text(title, 190 - titleWidth / 2 - 5, y - 1, { align: 'center' });

  y += 6;

  // Builder address / GSTIN
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.setFont('helvetica', 'normal');
  if (builder?.address) {
    doc.text(builder.address, 20, y);
    y += 4;
  }
  if (builder?.gstin) {
    doc.text(`GSTIN: ${builder.gstin}`, 20, y);
    y += 4;
  }

  y += 2;
  drawLine(doc, y);
  return y + 6;
}

function addFooter(doc: jsPDF, builder: any) {
  const pageHeight = doc.internal.pageSize.height;
  const y = pageHeight - 15;
  drawLine(doc, y - 4);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.setFont('helvetica', 'normal');

  const footerText = builder?.footer_text || 'This is a computer-generated document and does not require a physical signature.';
  doc.text(footerText, 105, y, { align: 'center', maxWidth: 170 });
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.accent);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, y);
  y += 2;
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(20, y, 20 + doc.getTextWidth(title), y);
  return y + 6;
}

function addInfoRow(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x, y);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'normal');
  doc.text(value || '-', x, y + 4.5);
  return y + 12;
}

// ==================== DEMAND LETTER PDF ====================

export function generateDemandLetterPDF(data: any): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const { builder, buyer, unit, tower, project, booking, payment_schedule } = data;

  let y = addHeader(doc, builder, 'DEMAND LETTER');

  // Date & Ref
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.text(`Date: ${formatDate(new Date().toISOString())}`, 190, y, { align: 'right' });
  y += 8;

  // ---- Buyer Info ----
  y = addSectionTitle(doc, 'Buyer Information', y);

  const buyerCol1 = 20;
  const buyerCol2 = 110;

  const buyerY1 = y;
  y = addInfoRow(doc, 'Name', buyer?.name || buyer?.lead_name || '-', buyerCol1, y);
  const buyerY2 = buyerY1;
  addInfoRow(doc, 'Phone', buyer?.phone || '-', buyerCol2, buyerY2);

  const buyerY3 = y;
  y = addInfoRow(doc, 'Email', buyer?.email || '-', buyerCol1, y);
  addInfoRow(doc, 'Address', buyer?.address || '-', buyerCol2, buyerY3);

  // ---- Unit / Property Info ----
  y = addSectionTitle(doc, 'Property Details', y);

  // Shaded box
  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(20, y - 2, 170, 26, 2, 2, 'F');

  const propRow1Y = y + 2;
  addInfoRow(doc, 'Project', project?.name || project?.project_name || '-', 22, propRow1Y);
  addInfoRow(doc, 'Tower', tower?.name || tower?.tower_name || '-', 72, propRow1Y);
  addInfoRow(doc, 'Unit No.', unit?.unit_number || '-', 122, propRow1Y);

  y = propRow1Y + 14;
  addInfoRow(doc, 'RERA No.', project?.rera_number || '-', 22, y);
  addInfoRow(doc, 'BHK', unit?.bhk || '-', 72, y);
  addInfoRow(doc, 'Carpet Area', unit?.carpet_area ? `${unit.carpet_area} sq.ft` : '-', 122, y);

  y += 16;

  // ---- Booking Info ----
  y = addSectionTitle(doc, 'Booking Details', y);

  const bookRow1Y = y;
  addInfoRow(doc, 'Booking Date', formatDate(booking?.booking_date), 20, bookRow1Y);
  addInfoRow(doc, 'Total Amount', formatCurrency(booking?.total_amount || '0'), 80, bookRow1Y);
  addInfoRow(doc, 'Payment Plan', booking?.payment_plan_type || '-', 140, bookRow1Y);
  y = bookRow1Y + 14;

  // ---- Payment Schedule Table ----
  if (payment_schedule && payment_schedule.length > 0) {
    y = addSectionTitle(doc, 'Payment Schedule', y);

    // Table header
    const colX = [20, 75, 105, 140, 170];
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(20, y - 2, 170, 8, 1, 1, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text('Milestone', colX[0] + 2, y + 3);
    doc.text('Due Date', colX[1] + 2, y + 3);
    doc.text('Amount', colX[2] + 2, y + 3);
    doc.text('%', colX[3] + 2, y + 3);
    doc.text('Status', colX[4] - 5, y + 3);
    y += 9;

    // Table rows
    payment_schedule.forEach((ms: any, i: number) => {
      // Check if we need a new page
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const isEven = i % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y - 3, 170, 8, 'F');
      }

      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.dark);
      doc.setFont('helvetica', 'normal');
      doc.text(ms.milestone_name || `Milestone ${i + 1}`, colX[0] + 2, y + 2, { maxWidth: 52 });
      doc.text(formatDate(ms.due_date), colX[1] + 2, y + 2);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(ms.amount), colX[2] + 2, y + 2);
      doc.setFont('helvetica', 'normal');
      doc.text(ms.percentage ? `${ms.percentage}%` : '-', colX[3] + 2, y + 2);

      // Status badge
      const status = ms.status || 'PENDING';
      const statusColor = status === 'PAID' ? COLORS.green : status === 'OVERDUE' ? COLORS.red : COLORS.amber;
      doc.setTextColor(...statusColor);
      doc.setFont('helvetica', 'bold');
      doc.text(status, colX[4] - 5, y + 2);

      y += 8;
    });

    y += 4;
  }

  // Signature area
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  drawLine(doc, y);
  y += 12;

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.text('Authorized Signatory', 20, y);
  doc.text(builder?.company_name || 'Builder', 20, y + 5);

  if (builder?.signature) {
    // If there's a signature image, it would go here
  }

  addFooter(doc, builder);

  doc.save(`Demand_Letter_${unit?.unit_number || 'Booking'}.pdf`);
}

// ==================== PAYMENT RECEIPT PDF ====================

export function generateReceiptPDF(data: any): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const { builder, buyer, unit, payment, booking_summary, receipt_number } = data;

  let y = addHeader(doc, builder, 'PAYMENT RECEIPT');

  // Receipt number & date
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${receipt_number || '-'}`, 20, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.secondary);
  doc.text(`Date: ${formatDate(payment?.received_date || new Date().toISOString())}`, 190, y, { align: 'right' });
  y += 10;

  // ---- Received From ----
  y = addSectionTitle(doc, 'Received From', y);

  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(20, y - 2, 170, 18, 2, 2, 'F');

  addInfoRow(doc, 'Name', buyer?.name || '-', 22, y);
  addInfoRow(doc, 'Phone', buyer?.phone || '-', 90, y);
  addInfoRow(doc, 'Email', buyer?.email || '-', 150, y);
  y += 20;

  // ---- Property ----
  y = addSectionTitle(doc, 'Property', y);

  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(20, y - 2, 170, 14, 2, 2, 'F');

  addInfoRow(doc, 'Unit', unit?.unit_number || '-', 22, y);
  addInfoRow(doc, 'Tower / Project', `${unit?.tower || '-'} / ${unit?.project || '-'}`, 72, y);
  addInfoRow(doc, 'RERA', unit?.rera || '-', 142, y);
  y += 18;

  // ---- Payment Details ---- (Big highlighted box)
  y = addSectionTitle(doc, 'Payment Details', y);

  // Large amount box
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y - 2, 170, 42, 3, 3, 'FD');

  let pyOffset = y + 4;
  addInfoRow(doc, 'Milestone', payment?.milestone_name || '-', 25, pyOffset);
  addInfoRow(doc, 'Reference No.', payment?.reference_no || '-', 110, pyOffset);
  pyOffset += 14;

  // Received amount (large)
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text('Received Amount', 25, pyOffset);
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.green);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(payment?.received_amount || '0'), 25, pyOffset + 8);

  // Scheduled amount
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.text('Scheduled Amount', 110, pyOffset);
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(payment?.amount || payment?.scheduled_amount || '0'), 110, pyOffset + 8);

  y += 48;

  // ---- Booking Summary ----
  if (booking_summary) {
    y = addSectionTitle(doc, 'Booking Summary', y);

    doc.setFillColor(...COLORS.bg);
    doc.roundedRect(20, y - 2, 170, 14, 2, 2, 'F');

    addInfoRow(doc, 'Total Booking Amount', formatCurrency(booking_summary.total_amount || '0'), 22, y);
    addInfoRow(doc, 'Payment Plan', booking_summary.plan_type || '-', 110, y);
    y += 18;
  }

  // Signature
  y += 10;
  drawLine(doc, y);
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', 20, y);
  doc.text(builder?.company_name || 'Builder', 20, y + 5);

  addFooter(doc, builder);

  doc.save(`Payment_Receipt_${receipt_number || 'Receipt'}.pdf`);
}
