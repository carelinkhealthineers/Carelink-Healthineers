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
    rows.slice(0, 100).forEach(row => {
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
  
  // Always use landscape for optimal text and table column spacing
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Carelink Branding
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Carelink Healthineers', 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Official Dürr Dental Distribution · Biomedical Operations Registry', 14, 18);

  // Timestamp
  const nowStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.setFontSize(8.5);
  doc.text(`Generated: ${nowStr}`, pageWidth - 14, 15, { align: 'right' });

  // Document Title
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 33);

  if (subtitle) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 39);
  }

  const startY = subtitle ? 44 : 38;

  // Clean, readable autoTable configuration with text wrapping
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 9.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 28 }, // ID / Date
      1: { cellWidth: 55 }, // Name / Hospital
      2: { cellWidth: 45 }, // Contact / Model
      3: { cellWidth: 55 }, // Email / Category
      4: { cellWidth: 35 }, // Date / Views
      5: { cellWidth: 30 }, // Status / Inquiries
    },
    didDrawPage: (data) => {
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${pageNumber} · Carelink Healthineers Confidential Healthcare Record`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(safeFilename);
};
