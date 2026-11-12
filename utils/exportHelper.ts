import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportDataPayload {
  filename: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  sheetName?: string;
}

/**
 * Sanitize text for jsPDF standard Helvetica (WinAnsi encoding)
 * Replaces unsupported Unicode currency/arrows/dashes with clean ASCII equivalents
 */
function sanitizePdfText(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/৳/g, 'Tk ')
    .replace(/Tk\s{2,}/g, 'Tk ')
    .replace(/[—–]/g, '-')
    .replace(/[→➔]/g, '->')
    .replace(/↳/g, '  -')
    .replace(/·/g, '|')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+\n/g, '\n');
}

/**
 * Export tabular data as a formatted Microsoft Excel (.xlsx) file
 */
export const exportToExcel = ({
  filename,
  sheetName = 'Report',
  headers,
  rows,
}: {
  filename: string;
  sheetName?: string;
  headers: string[];
  rows: (string | number)[][];
}) => {
  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const colWidths = headers.map((header, i) => {
    let maxLen = header.length;
    rows.slice(0, 100).forEach((row) => {
      const cellVal = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
      if (cellVal.length > maxLen) {
        maxLen = Math.min(cellVal.length, 45);
      }
    });
    return { wch: Math.max(maxLen + 4, 15) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, safeFilename);
};

/**
 * Compute proportional, non-crushing column widths for A4 Landscape tables
 * so right-most columns (e.g. Paid, Due, Status) never collapse to 1-char vertical stacks.
 */
function computeAutoColumnStyles(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  usableWidth: number,
  bodyFontSize: number,
  headFontSize: number,
  cellPadding: number
): Record<number, { cellWidth: number; halign?: 'left' | 'right' | 'center' }> {
  const colCount = headers.length;
  if (colCount === 0) return {};

  const padExtra = cellPadding * 2 + 2.5;
  const floors: number[] = [];
  const desired: number[] = [];
  const isNumericCols: boolean[] = [];

  for (let i = 0; i < colCount; i++) {
    const header = headers[i] || '';

    // Measure header full width & longest single token
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(headFontSize);
    const fullHeaderW = doc.getTextWidth(header) + padExtra;
    const headerTokens = header.split(/\s+/).filter(Boolean);
    const maxHeaderTokenW =
      headerTokens.reduce((max, t) => Math.max(max, doc.getTextWidth(t)), 0) + padExtra;

    // Measure cell contents
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(bodyFontSize);

    let maxShortCellW = 0;
    const cellWidths: number[] = [];
    let numericLikeCount = 0;
    let nonEmptyCount = 0;

    const sampleRows = rows.slice(0, 120);
    for (const r of sampleRows) {
      const val = (r[i] ?? '').trim();
      if (!val || val === '-' || val === '—') continue;
      nonEmptyCount += 1;
      const w = doc.getTextWidth(val) + padExtra;
      cellWidths.push(w);

      // Keep compact values (dates, currency like "Tk 2,200", status badges) unwrapped
      if (val.length <= 16) {
        maxShortCellW = Math.max(maxShortCellW, Math.min(w, 38));
      }

      if (/^(Tk\s*)?-?[\d,]+(\.\d+)?%?$/.test(val)) {
        numericLikeCount += 1;
      }
    }

    cellWidths.sort((a, b) => a - b);
    const p90Idx = cellWidths.length > 0 ? Math.min(cellWidths.length - 1, Math.floor(cellWidths.length * 0.9)) : 0;
    const p90CellW = cellWidths.length > 0 ? cellWidths[p90Idx] : 0;

    const floorW = Math.max(15, maxHeaderTokenW, maxShortCellW, Math.min(fullHeaderW, 34));
    const idealW = Math.max(floorW, Math.min(Math.max(fullHeaderW, p90CellW), 78));

    floors.push(floorW);
    desired.push(idealW);

    const lowerHeader = header.toLowerCase();
    const headerNumericHint =
      lowerHeader.includes('(bdt)') ||
      lowerHeader === 'qty' ||
      lowerHeader === 'paid' ||
      lowerHeader === 'due' ||
      lowerHeader.includes('amount') ||
      lowerHeader.includes('value') ||
      lowerHeader.includes('total') ||
      lowerHeader.includes('%');

    isNumericCols.push(
      headerNumericHint || (nonEmptyCount > 0 && numericLikeCount / nonEmptyCount >= 0.7)
    );
  }

  const finalWidths: number[] = new Array(colCount).fill(usableWidth / colCount);
  const sumDesired = desired.reduce((a, b) => a + b, 0);
  const sumFloors = floors.reduce((a, b) => a + b, 0);

  if (sumDesired <= usableWidth) {
    // Everything fits comfortably: distribute extra breathing space proportionally
    const ratio = usableWidth / (sumDesired || 1);
    for (let i = 0; i < colCount; i++) {
      finalWidths[i] = Number((desired[i] * ratio).toFixed(2));
    }
  } else if (sumFloors <= usableWidth) {
    // Guarantee every column meets its non-breaking floor, then split slack proportionally
    const slack = usableWidth - sumFloors;
    const totalFlex = desired.reduce((acc, d, i) => acc + Math.max(0, d - floors[i]), 0);
    for (let i = 0; i < colCount; i++) {
      const flex = Math.max(0, desired[i] - floors[i]);
      const extra = totalFlex > 0 ? (flex / totalFlex) * slack : slack / colCount;
      finalWidths[i] = Number((floors[i] + extra).toFixed(2));
    }
  } else {
    // Ultra-wide table (many columns): scale proportionally while keeping fair ratios
    const ratio = usableWidth / (sumFloors || 1);
    for (let i = 0; i < colCount; i++) {
      finalWidths[i] = Number(Math.max(11, floors[i] * ratio).toFixed(2));
    }
  }

  const columnStyles: Record<number, { cellWidth: number; halign?: 'left' | 'right' | 'center' }> = {};
  for (let i = 0; i < colCount; i++) {
    columnStyles[i] = {
      cellWidth: finalWidths[i],
      halign: isNumericCols[i] ? 'right' : 'left',
    };
  }
  return columnStyles;
}

/**
 * Export tabular data as a clean, professionally styled PDF document with Carelink Healthineers branding
 */
export const exportToPDF = ({
  filename,
  title,
  subtitle,
  headers,
  rows,
}: ExportDataPayload) => {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  const colCount = headers.length;
  const sideMargin = colCount > 10 ? 8 : colCount >= 8 ? 10 : 12;
  const usableWidth = pageWidth - sideMargin * 2;
  const bodyFontSize = colCount > 10 ? 7.5 : colCount >= 8 ? 8.5 : 9;
  const headFontSize = colCount > 10 ? 8 : colCount >= 8 ? 8.5 : 9.5;
  const cellPadding = colCount > 10 ? 2.2 : colCount >= 8 ? 2.8 : 3.2;

  const cleanHeaders = headers.map((h) => sanitizePdfText(h));
  const cleanRows = rows.map((r) => r.map((cell) => sanitizePdfText(cell)));
  const cleanTitle = sanitizePdfText(title);
  const cleanSubtitle = subtitle ? sanitizePdfText(subtitle) : '';

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Carelink Branding
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Carelink Healthineers', sideMargin, 11.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Official Durr Dental Distribution | Biomedical Operations Registry', sideMargin, 17.5);

  // Timestamp
  const nowStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.setFontSize(8.5);
  doc.text(`Generated: ${nowStr}`, pageWidth - sideMargin, 14.5, { align: 'right' });

  // Document Title & Wrapped Subtitle
  doc.setFontSize(13.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(cleanTitle, usableWidth);
  doc.text(titleLines, sideMargin, 32);

  let cursorY = 32 + (titleLines.length - 1) * 5.5;
  if (cleanSubtitle) {
    cursorY += 5.5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const subLines = doc.splitTextToSize(cleanSubtitle, usableWidth);
    doc.text(subLines, sideMargin, cursorY);
    cursorY += (subLines.length - 1) * 4.2 + 4.5;
  } else {
    cursorY += 5;
  }

  const dynamicColumnStyles = computeAutoColumnStyles(
    doc,
    cleanHeaders,
    cleanRows,
    usableWidth,
    bodyFontSize,
    headFontSize,
    cellPadding
  );

  // Match head alignment cleanly to column alignment
  const headStylesByCol: Record<number, { halign?: 'left' | 'right' | 'center' }> = {};
  Object.entries(dynamicColumnStyles).forEach(([idx, st]) => {
    headStylesByCol[Number(idx)] = { halign: st.halign || 'left' };
  });

  autoTable(doc, {
    head: [cleanHeaders],
    body: cleanRows,
    startY: cursorY,
    tableWidth: usableWidth,
    margin: { left: sideMargin, right: sideMargin, top: 14, bottom: 14 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: bodyFontSize,
      cellPadding,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: headFontSize,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: dynamicColumnStyles,
    didParseCell: (data) => {
      if (data.section === 'head' && headStylesByCol[data.column.index]) {
        data.cell.styles.halign = headStylesByCol[data.column.index].halign;
      }
      // Highlight TOTAL SUMMARY rows cleanly in dark slate
      if (data.section === 'body') {
        const firstCellText = String(data.row.raw?.[0] ?? '').toUpperCase();
        if (
          firstCellText.includes('TOTAL SUMMARY') ||
          firstCellText.includes('ALL TOTAL EXPENSES') ||
          firstCellText.includes('NET CASH BALANCE')
        ) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
        }
      }
    },
  });

  // Stamp exact Page X of Y footer across all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${p} of ${totalPages} | Carelink Healthineers Confidential Healthcare Record`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
  }

  doc.save(safeFilename);
};
