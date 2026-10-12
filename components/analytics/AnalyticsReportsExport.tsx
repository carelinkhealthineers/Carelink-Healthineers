import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Package,
  MapPin,
  Globe,
  Mail,
  Code,
} from 'lucide-react';
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

  const getReportData = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `carelink_${reportType}_report_${timestamp}`;

    if (reportType === 'all_traffic') {
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
    } else if (reportType === 'products') {
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
    } else if (reportType === 'districts') {
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
    } else if (reportType === 'inquiries') {
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
    const data = getReportData();
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
    const data = getReportData();
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

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `carelink_${reportType}_report_${timestamp}.json`;

    let exportPayload: any = {};
    if (reportType === 'all_traffic') {
      exportPayload = {
        generatedAt: new Date().toISOString(),
        filter: currentDateFilter,
        totals: {
          pageViews: analytics?.totalPageViews || 0,
          productViews: analytics?.totalProductViews || 0,
          uniqueVisitors: analytics?.uniqueVisitors || 0,
          inquiries: analytics?.totalInquiries || inquiries.length,
          whatsappClicks: analytics?.totalWhatsappClicks || 0,
          phoneClicks: analytics?.totalPhoneClicks || 0,
        },
        dailyHistory: analytics?.dailyHistory || {},
      };
    } else if (reportType === 'products') {
      exportPayload = {
        generatedAt: new Date().toISOString(),
        products: catalogProducts.map((p) => ({
          id: p.id,
          name: p.name,
          model: p.model_number,
          metrics: analytics?.productViews[p.id] || null,
        })),
      };
    } else if (reportType === 'districts') {
      exportPayload = {
        generatedAt: new Date().toISOString(),
        districts: analytics?.districtStats || {},
      };
    } else if (reportType === 'inquiries') {
      exportPayload = {
        generatedAt: new Date().toISOString(),
        inquiries,
      };
    } else {
      exportPayload = {
        generatedAt: new Date().toISOString(),
        catalogSeo: catalogProducts.map((p) => ({
          name: p.name,
          metaTitle: p.meta_title,
          primaryKeyword: p.primary_keyword,
        })),
      };
    }

    const dataContent = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([dataContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportedMessage(`Successfully exported ${filename}`);
    setTimeout(() => setExportedMessage(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              Executive Analytics Reports &amp; Data Export
            </h3>
            <p className="text-xs text-slate-400">
              Generate structured, audit-ready Excel (.xlsx) spreadsheets and formatted PDF executive documents.
            </p>
          </div>
        </div>

        {exportedMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{exportedMessage}</span>
          </div>
        )}
      </div>

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

      {/* Export Action Card with PDF and Excel options */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white mb-0.5">
            Ready to generate: {reportType.replace('_', ' ').toUpperCase()} REPORT
          </div>
          <div className="text-xs text-slate-400">
            Source: Supabase Production Settings Telemetry · Admin Authorized Session
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Excel Option */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Export Excel (.xlsx)</span>
          </button>

          {/* PDF Option */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <FileText size={15} />
            <span>Export PDF (.pdf)</span>
          </button>

          {/* Raw JSON Option */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-[#1a202c] hover:bg-[#252d3d] border border-[#2d3748] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Code size={14} />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
