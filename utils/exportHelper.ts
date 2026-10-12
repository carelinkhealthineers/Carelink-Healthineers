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

  // Set column widths dynamically
  const colWidths = headers.map((header, i) => {
    let maxLen = header.length;
    rows.slice(0, 100).forEach(row => {
      const cellVal = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
      if (cellVal.length > maxLen) {
        maxLen = Math.min(cellVal.length, 40);
      }
    });
    return { wch: Math.max(maxLen + 3, 12) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, safeFilename);
};

/**
 * Export tabular data as a styled PDF document with Carelink Healthineers branding
 */
export const exportToPDF = ({
  filename,
  title,
  subtitle,
  headers,
  rows,
}: ExportDataPayload) => {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  
  // Create landscape PDF if there are more than 5 columns for readability
  const orientation = headers.length > 5 ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Carelink Branding
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Carelink Healthineers', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Official Dürr Dental Distribution · Biomedical Operations Registry', 14, 17);

  // Report Title and Timestamp
  const nowStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(`Generated: ${nowStr}`, pageWidth - 14, 14, { align: 'right' });

  // Document Title
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 30);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 35);
  }

  const startY = subtitle ? 39 : 34;

  // Generate Table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    didDrawPage: (data) => {
      // Footer page number
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${pageNumber} · Confidential Healthcare Record`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(safeFilename);
};
