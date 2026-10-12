import React, { useState, useMemo } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Inquiry, Product } from '../../types';
import { SiteTrafficAnalytics } from '../../utils/analyticsTracker';
import { ExportActionMenu } from '../common/ExportActionMenu';

interface MedicalBusinessInquiriesTabProps {
  inquiries: Inquiry[];
  analytics: SiteTrafficAnalytics | null;
  catalogProducts: Product[];
  onUpdateInquiryStatus?: (id: string, status: Inquiry['status']) => Promise<void>;
}

export const MedicalBusinessInquiriesTab: React.FC<MedicalBusinessInquiriesTabProps> = ({
  inquiries,
  analytics,
  catalogProducts,
  onUpdateInquiryStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Contact method preference breakdown
  const contactPreferences = useMemo(() => {
    const wa = analytics?.totalWhatsappClicks || 0;
    const tel = analytics?.totalPhoneClicks || 0;
    const em = analytics?.totalEmailClicks || 0;
    const qf = inquiries.length || analytics?.totalQuoteSubmits || 0;
    const total = wa + tel + em + qf || 1;

    return [
      { name: 'Quote Forms', count: qf, pct: Math.round((qf / total) * 100), color: '#3B82F6' },
      { name: 'WhatsApp Clicks', count: wa, pct: Math.round((wa / total) * 100), color: '#10B981' },
      { name: 'Phone Calls', count: tel, pct: Math.round((tel / total) * 100), color: '#F59E0B' },
      { name: 'Direct Email', count: em, pct: Math.round((em / total) * 100), color: '#8B5CF6' },
    ];
  }, [analytics, inquiries]);

  // Traffic channel attribution for inquiries
  const channelAttribution = useMemo(() => {
    const channels = analytics?.channelViews || {
      'Organic Search': 0,
      Direct: 0,
      Referral: 0,
      Social: 0,
      Campaign: 0,
    };
    const totalViews = Math.max(1, analytics?.totalPageViews || 1);

    return Object.entries(channels).map(([chan, views]) => ({
      channel: chan,
      views: Number(views) || 0,
      pct: Math.round(((Number(views) || 0) / totalViews) * 100),
    }));
  }, [analytics]);

  // Filtered inquiries list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = filter === 'all' || inq.status === filter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.company.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, filter, searchQuery]);

  const getExportData = () => {
    const headers = [
      'Inquiry ID',
      'Hospital / Clinic',
      'Contact Person',
      'Email',
      'Date',
      'Status',
      'Message',
    ];
    const rows = filteredInquiries.map((inq) => [
      inq.id,
      inq.company || '—',
      inq.name,
      inq.email,
      new Date(inq.created_at).toLocaleDateString(),
      inq.status,
      inq.message.replace(/\[.*?\]/g, '').trim(),
    ]);

    return {
      filename: `medical_inquiries_report_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Inquiries',
      title: 'Carelink Healthineers Medical Procurement Inquiries',
      subtitle: `Filtered Inquiries Count: ${filteredInquiries.length}`,
      headers,
      rows,
    };
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards: Procurement Inquiries, Contact Methods, Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1115] border border-[#222731]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Inquiries / RFQs
          </div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {inquiries.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-bold">
              {inquiries.filter((i) => i.status === 'pending').length} Pending
            </span>
            <span>· From hospital procurement</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1115] border border-[#222731]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            WhatsApp Inquiries
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {analytics?.totalWhatsappClicks || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Direct WhatsApp chats initiated
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1115] border border-[#222731]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Direct Phone Calls
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
            {analytics?.totalPhoneClicks || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Tel clicks from mobile buyers
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1115] border border-[#222731]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Quote Form Conversion
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono mt-1">
            {analytics && analytics.totalPageViews > 0
              ? `${Number(((inquiries.length / analytics.totalPageViews) * 100).toFixed(1))}%`
              : '0.0%'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Inquiries per 100 visits
          </div>
        </div>
      </div>

      {/* Contact Method Preferences & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Preferences Bar */}
        <div className="p-6 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Procurement Contact Channel Preferences
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How doctors, clinics, and hospital executives choose to reach out
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {contactPreferences.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="font-mono text-slate-400">
                    {c.count} leads ({c.pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#1b2029] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, c.pct)}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Channels Source for Inquiries */}
        <div className="p-6 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Inbound Traffic Channels &amp; Origins
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Referrer classification tracking visitor acquisition
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {channelAttribution.map((ch) => (
              <div key={ch.channel} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{ch.channel}</span>
                  <span className="font-mono text-slate-400">
                    {ch.views} visits ({ch.pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#1b2029] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.max(4, ch.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Inquiries Table & Management */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hospital Procurement Inquiries &amp; RFQs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secured RFQs submitted through the public acquisition portal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search hospital or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-[#141822] border border-[#232938] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 bg-[#141822] border border-[#232938] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>

            <ExportActionMenu label="Export Inquiries" getData={getExportData} />
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-[#07090d] rounded-2xl border border-[#1e232e]">
            No inquiries match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222731] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Institution / Buyer</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Equipment Message</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1f29]">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className="hover:bg-[#141822] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-white">{inq.company}</div>
                      <div className="text-[10px] text-slate-400">{inq.name}</div>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-300 font-mono text-[11px]">
                      {inq.email}
                    </td>
                    <td className="py-3.5 pr-3 text-slate-400 truncate max-w-xs">
                      {inq.message}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          inq.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : inq.status === 'reviewed'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-[11px] font-mono text-slate-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1115] border border-[#222731] rounded-3xl w-full max-w-xl p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#222731] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Procurement Requisition
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedInquiry.company}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1b2029]">
                <span className="text-slate-500">Contact Officer:</span>
                <span className="font-bold text-white">{selectedInquiry.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b2029]">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-blue-400">{selectedInquiry.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b2029]">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedInquiry.created_at).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1 pt-2">
                <span className="text-slate-500">Inquiry Message:</span>
                <div className="p-4 rounded-xl bg-[#07090d] border border-[#1e232e] text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#222731] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {onUpdateInquiryStatus && (
                  <>
                    <button
                      onClick={async () => {
                        await onUpdateInquiryStatus(selectedInquiry.id, 'reviewed');
                        setSelectedInquiry(null);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={async () => {
                        await onUpdateInquiryStatus(selectedInquiry.id, 'archived');
                        setSelectedInquiry(null);
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold"
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 bg-[#171b24] hover:bg-[#202634] text-slate-300 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
