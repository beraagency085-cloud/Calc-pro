import { jsPDF } from 'jspdf';

export interface PdfMetric {
  label: string;
  value: string;
  subtext?: string;
}

export interface PdfParam {
  label: string;
  value: string;
}

export interface PdfBreakdownItem {
  label: string;
  value: string;
  percent?: string;
}

export interface PdfTableRow {
  period: string | number;
  col1: string | number;
  col2: string | number;
  col3?: string | number;
  col4?: string | number;
}

export interface PdfExportOptions {
  title: string;
  calculatorName: string;
  category: string;
  currency?: string;
  primaryMetric: PdfMetric;
  secondaryMetrics?: PdfMetric[];
  parameters: PdfParam[];
  breakdown?: PdfBreakdownItem[];
  tableHeaders?: string[];
  tableRows?: PdfTableRow[];
  notes?: string[];
}

/**
 * Generates and downloads a high-precision, executive-styled PDF report
 * directly to the user's mobile phone or computer.
 */
export function exportCalculationToPdf(options: PdfExportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let y = 14;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(79, 70, 229); // Royal Indigo #4F46E5
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Header Area
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text('CALCPRO.', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PRECISION ENGINE • ANALYTICAL REPORT', margin + 36, y - 1);

  // Date & Badge on top right
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr}, ${timeStr}`, pageWidth - margin, y - 1, { align: 'right' });
  if (options.currency) {
    doc.text(`Base Currency: ${options.currency}`, pageWidth - margin, y + 3, { align: 'right' });
  }

  y += 8;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;

  // 3. Document Title & Category
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(options.title.toUpperCase(), margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text(
    `[ ${options.category.toUpperCase()} MODULE • CLIENT-VERIFIED COMPUTE ]`,
    pageWidth - margin,
    y,
    { align: 'right' }
  );

  y += 7;

  // 4. Primary Executive Metric Box (Gloss-styled Container in Vector)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  // Accent left strip
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, y, 3.5, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(options.primaryMetric.label.toUpperCase(), margin + 8, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text(options.primaryMetric.value, margin + 8, y + 16);

  if (options.primaryMetric.subtext) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(options.primaryMetric.subtext, margin + 8, y + 22);
  }

  // Secondary metrics if any (aligned inside the executive box right side)
  if (options.secondaryMetrics && options.secondaryMetrics.length > 0) {
    let secX = margin + contentWidth / 2 + 10;
    const itemWidth = (contentWidth / 2 - 14) / options.secondaryMetrics.length;

    options.secondaryMetrics.forEach((sec, idx) => {
      const currentX = secX + idx * itemWidth;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(sec.label.toUpperCase(), currentX, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(sec.value, currentX, y + 16);

      if (sec.subtext) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(sec.subtext, currentX, y + 22);
      }
    });
  }

  y += 33;

  // 5. Input Configuration / Parameters Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('INPUT CONFIGURATION & PARAMETERS', margin, y);

  y += 4;

  const colWidth = (contentWidth - 6) / 2;
  const paramBoxHeight = Math.ceil(options.parameters.length / 2) * 8 + 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, paramBoxHeight, 2, 2, 'FD');

  doc.setFontSize(8.5);
  options.parameters.forEach((param, idx) => {
    const isRightCol = idx % 2 === 1;
    const row = Math.floor(idx / 2);
    const itemX = isRightCol ? margin + colWidth + 6 : margin + 4;
    const itemY = y + 7 + row * 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(param.label + ':', itemX, itemY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(param.value, itemX + 48, itemY);
  });

  y += paramBoxHeight + 8;

  // 6. Summary Breakdown (if present)
  if (options.breakdown && options.breakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('ANALYTICAL BREAKDOWN & DISTRIBUTION', margin, y);

    y += 4;

    const bdBoxHeight = options.breakdown.length * 7 + 6;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, bdBoxHeight, 2, 2, 'FD');

    options.breakdown.forEach((item, idx) => {
      const itemY = y + 6 + idx * 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(item.label, margin + 4, itemY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(item.value, margin + contentWidth - 4, itemY, { align: 'right' });

      if (item.percent) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`(${item.percent})`, margin + contentWidth - 40, itemY, { align: 'right' });
      }
    });

    y += bdBoxHeight + 8;
  }

  // 7. Schedule / Breakdown Table (if provided, e.g. Amortization / Years)
  if (options.tableHeaders && options.tableRows && options.tableRows.length > 0) {
    // Only print table if there is enough space on page or manage pagination
    if (y > pageHeight - 65) {
      doc.addPage();
      y = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('SCHEDULE & PROGRESSION (PREVIEW)', margin, y);

    y += 4;

    const numCols = options.tableHeaders.length;
    const cellWidth = contentWidth / numCols;
    const rowHeight = 6;

    // Header Row
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, rowHeight + 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    options.tableHeaders.forEach((th, cIdx) => {
      const align = cIdx === 0 ? 'left' : 'right';
      const cellX = cIdx === 0 ? margin + 2 : margin + (cIdx + 1) * cellWidth - 2;
      doc.text(th.toUpperCase(), cellX, y + 4.5, { align });
    });

    y += rowHeight + 1;

    // Table rows (Limit to first 12 rows to guarantee single page clean fit or clean wrap)
    const rowsToPrint = options.tableRows.slice(0, 14);
    doc.setFontSize(7.5);

    rowsToPrint.forEach((r, rIdx) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 16;
      }

      if (rIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      // Period
      doc.text(String(r.period), margin + 2, y + 4.2);

      // Col 1
      doc.text(String(r.col1), margin + 2 * cellWidth - 2, y + 4.2, { align: 'right' });

      // Col 2
      doc.text(String(r.col2), margin + 3 * cellWidth - 2, y + 4.2, { align: 'right' });

      // Col 3
      if (r.col3 !== undefined && numCols >= 4) {
        doc.text(String(r.col3), margin + 4 * cellWidth - 2, y + 4.2, { align: 'right' });
      }

      if (r.col4 !== undefined && numCols >= 5) {
        doc.text(String(r.col4), margin + 5 * cellWidth - 2, y + 4.2, { align: 'right' });
      }

      y += rowHeight;
    });

    if (options.tableRows.length > 14) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`+ ${options.tableRows.length - 14} additional periods calculated.`, margin, y + 4);
      y += 6;
    }
  }

  // 8. Footer (Disclaimer & Device Confirmation)
  const footerY = pageHeight - 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'CONFIDENTIAL REPORT • Processed directly inside device memory • CalcPro Precision Engine',
    margin,
    footerY + 1
  );

  doc.text('calcpro.app', pageWidth - margin, footerY + 1, { align: 'right' });

  // Generate safe filename
  const cleanName = options.calculatorName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `CalcPro_${cleanName}_report.pdf`;

  // Save triggers download directly onto user's phone / PC
  doc.save(fileName);
}
