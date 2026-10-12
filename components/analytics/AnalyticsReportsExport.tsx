import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  Package,
  MapPin,
  Globe,
  Mail,
  Archive,
  Loader2,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { SiteTrafficAnalytics } from '../../utils/analyticsTracker';
import { Product, Inquiry } from '../../types';
import { BANGLADESH_64_DISTRICTS } from '../../utils/bangladeshDistricts';
import { AnalyticsDateFilter } from '../../utils/analyticsCalculations';
import { exportToExcel, exportToPDF } from '../../utils/exportHelper';

interface AnalyticsReportsExportProps {
  analytics: SiteTrafficAnalytics | null;
  catalogProducts: Product[];
  inquiries: Inquiry[];
  currentDateFilter: AnalyticsDateFilter;
}

export const AnalyticsReportsExport: React.FC<AnalyticsReportsExportProps> = ({
  analytics,
  catalogProducts,
  inquiries,
  currentDateFilter,
}) => {
  const [reportType, setReportType] = useState<
    'all_traffic' | 'products' | 'districts' | 'inquiries' | 'seo'
  >('all_traffic');
  const [exportedMessage, setExportedMessage] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const generateReportPayload = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `carelink_${type}_report_${timestamp}`;

    if (type === 'all_traffic') {
      const headers = ['Date', 'Page Views', 'Unique Visitors', 'Product Views', 'Inquiries'];
      const rows = Object.entries(analytics?.dailyHistory || {}).map(([d, snap]) => {
        const s = snap as any;
        return [
          d,
          s?.pageViews || 0,
          s?.uniqueVisitors || 0,
          s?.productViews || 0,
          s?.inquiries || 0,
        ];
      });
      return {
        filename,
        sheetName: 'Traffic History',
        title: 'Platform Traffic & Daily Telemetry Report',
        subtitle: `Time Range: ${currentDateFilter} · Total Page Views: ${analytics?.totalPageViews || 0}`,
        headers,
        rows,
      };
    } else if (type === 'products') {
      const headers = ['Product ID', 'Name', 'Model Number', 'Category', 'Views', 'Inquiries'];
      const rows = catalogProducts.map((p) => {
        const m = analytics?.productViews[p.id];
        return [
          p.id,
          p.name,
          p.model_number || '—',
          p.category_tag || 'General',
          m?.views || 0,
          m?.inquiries || 0,
        ];
      });
      return {
        filename,
        sheetName: 'Product Performance',
        title: 'Product Catalog Performance Report',
        subtitle: `Catalog Size: ${catalogProducts.length} items`,
        headers,
        rows,
      };
    } else if (type === 'districts') {
      const headers = [
        'District ID',
        'District Name',
        'Division',
        'Page Views',
        'Product Views',
        'Inquiries',
      ];
      const rows = BANGLADESH_64_DISTRICTS.map((d) => {
        const s = analytics?.districtStats[d.id];
        return [
          d.id,
          d.name,
          d.division,
          s?.pageViews || 0,
          s?.productViews || 0,
          s?.inquiries || 0,
        ];
      });
      return {
        filename,
        sheetName: '64 Districts',
        title: 'Bangladesh 64 Districts Healthcare Sourcing Distribution',
        subtitle: 'Territorial demand across 8 Administrative Divisions',
        headers,
        rows,
      };
    } else if (type === 'inquiries') {
      const headers = ['ID', 'Hospital / Institution', 'Contact Person', 'Email', 'Date', 'Status'];
      const rows = inquiries.map((i) => [
        i.id,
        i.company || '—',
        i.name,
        i.email,
        new Date(i.created_at).toLocaleDateString(),
        i.status,
      ]);
      return {
        filename,
        sheetName: 'Procurement Inquiries',
        title: 'Medical Procurement Inquiries & RFQ Report',
        subtitle: `Total Inquiries Logged: ${inquiries.length}`,
        headers,
        rows,
      };
    } else {
      const headers = ['Product Name', 'Primary Keyword', 'Meta Title', 'Meta Description'];
      const rows = catalogProducts.map((p) => [
        p.name,
        p.primary_keyword || '—',
        p.meta_title || '—',
        p.meta_description || '—',
      ]);
      return {
        filename,
        sheetName: 'SEO Matrix',
        title: 'SEO Matrix & Search Engine Visibility Audit',
        subtitle: `Catalog Size: ${catalogProducts.length} items`,
        headers,
        rows,
      };
    }
  };

  const handleExportExcel = () => {
    const data = generateReportPayload(reportType);
    exportToExcel({
      filename: data.filename,
      sheetName: data.sheetName,
      headers: data.headers,
      rows: data.rows,
    });
    setExportedMessage(`Successfully exported ${data.filename}.xlsx`);
    setTimeout(() => setExportedMessage(null), 3500);
  };

  const handleExportPDF = () => {
    const data = generateReportPayload(reportType);
    exportToPDF({
      filename: data.filename,
      title: data.title,
      subtitle: data.subtitle,
      headers: data.headers,
      rows: data.rows,
    });
    setExportedMessage(`Successfully exported ${data.filename}.pdf`);
    setTimeout(() => setExportedMessage(null), 3500);
  };

  const generatePdfBlob = (title: string, subtitle: string, headers: string[], rows: (string | number)[][]) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Carelink Healthineers', 14, 12);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Official Dürr Dental Distribution · Biomedical Operations Registry', 14, 18);

    const nowStr = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    doc.setFontSize(8.5);
    doc.text(`Generated: ${nowStr}`, pageWidth - 14, 15, { align: 'right' });

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
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 9.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didDrawPage: () => {
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

    return doc.output('arraybuffer');
  };

  const generateExcelBuffer = (sheetName: string, headers: string[], rows: (string | number)[][]) => {
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    setExportedMessage(null);
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      const types = ['all_traffic', 'products', 'districts', 'inquiries', 'seo'];

      types.forEach((type) => {
        const rep = generateReportPayload(type);
        // Include both Excel (.xlsx) and PDF (.pdf) for each report in the ZIP
        const excelBuffer = generateExcelBuffer(rep.sheetName, rep.headers, rep.rows);
        const pdfBuffer = generatePdfBlob(rep.title, rep.subtitle || '', rep.headers, rep.rows);

        zip.file(`${rep.filename}.xlsx`, excelBuffer);
        zip.file(`${rep.filename}.pdf`, pdfBuffer);
      });

      zip.file(
        'README.txt',
        `Carelink Healthineers Enterprise Analytics & Telemetry Archive\nGenerated on: ${new Date().toUTCString()}\n\nContents:\n- Full Platform Traffic Telemetry (Excel & PDF)\n- Product Catalog Performance (Excel & PDF)\n- Bangladesh 64 Districts Demand Breakdown (Excel & PDF)\n- Hospital Procurement Inquiries & RFQs (Excel & PDF)\n- SEO Matrix Audit (Excel & PDF)\n\nAuthorized Admin Export`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `carelink_complete_analytics_bundle_${timestamp}.zip`);
      setExportedMessage('Successfully downloaded complete analytics ZIP bundle with Excel & PDF files!');
    } catch (err: any) {
      console.error('ZIP generation failed:', err);
      alert('Failed to generate ZIP archive: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsZipping(false);
      setTimeout(() => setExportedMessage(null), 4500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header with One-Click ZIP Download */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              Executive Analytics Reports &amp; Data Export
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose to export individual reports as Excel (.xlsx) or PDF (.pdf), or download the complete bundle containing both Excel &amp; PDF files for all reports as a ZIP.
            </p>
          </div>
        </div>

        {/* Master One-Click ZIP Button */}
        <button
          type="button"
          onClick={handleDownloadAllZip}
          disabled={isZipping}
          className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-blue-500/25 transition-all cursor-pointer shrink-0"
        >
          {isZipping ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Archive size={16} />
          )}
          <span>{isZipping ? 'Packaging ZIP Bundle...' : 'Download All Analytics (.ZIP)'}</span>
        </button>
      </div>

      {exportedMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{exportedMessage}</span>
        </div>
      )}

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            id: 'all_traffic' as const,
            title: 'Full Platform Traffic',
            desc: 'Daily timeline of page views, visitors, and conversions',
            icon: Calendar,
          },
          {
            id: 'products' as const,
            title: 'Product Performance',
            desc: 'Views, inquiries, and conversion breakdown per model',
            icon: Package,
          },
          {
            id: 'districts' as const,
            title: 'Bangladesh 64 Districts',
            desc: 'Regional healthcare equipment demand across 8 divisions',
            icon: MapPin,
          },
          {
            id: 'inquiries' as const,
            title: 'Hospital Procurement Inquiries',
            desc: 'Complete log of clinic RFQs, emails, and lead statuses',
            icon: Mail,
          },
          {
            id: 'seo' as const,
            title: 'Catalog SEO Matrix',
            desc: 'Primary keywords, meta titles, and descriptions',
            icon: Globe,
          },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setReportType(item.id)}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              reportType === item.id
                ? 'bg-blue-600/10 border-blue-500/40 text-white shadow-lg shadow-blue-500/10'
                : 'bg-[#0f1115] border-[#222731] text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <div>
              <item.icon
                size={20}
                className={reportType === item.id ? 'text-blue-400 mb-3' : 'text-slate-500 mb-3'}
              />
              <div className="text-xs font-bold text-white mb-1">{item.title}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1a1f29] flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">FORMATS</span>
              <span className="text-emerald-400 font-bold">XLSX · PDF</span>
            </div>
          </button>
        ))}
      </div>

      {/* Export Action Card with Excel and PDF options */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white mb-0.5">
            Ready to generate: {reportType.replace('_', ' ').toUpperCase()} REPORT
          </div>
          <div className="text-xs text-slate-400">
            Source: Supabase Production Settings Telemetry · Authorized Admin Session
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Excel Option */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel (.xlsx)</span>
          </button>

          {/* PDF Option */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <FileText size={16} />
            <span>Export PDF (.pdf)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
