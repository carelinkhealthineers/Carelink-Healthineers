import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mail,
  CheckCircle,
  Clock,
  Archive,
  Building2,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Package,
  Loader2,
  Check,
} from 'lucide-react';
import { Inquiry } from '../../types';
import { supabase } from '../../supabaseClient';

export const InquiryFlow: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'archived'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update blocked by database permissions.');
      }
      setInquiries(prev =>
        prev.map(inq => (inq.id === id ? { ...inq, status } : inq))
      );
    } catch (err: any) {
      console.error('Update Error:', err);
      alert(`Failed to update inquiry status: ${err?.message || 'Database error'}`);
    }
  };

  const uniqueProducts = Array.from(
    new Set(
      inquiries
        .map(inq => {
          const match = inq.message.match(/\[Product:\s*(.*?)\]/);
          return match ? match[1] : null;
        })
        .filter(Boolean)
    )
  ) as string[];

  const filteredInquiries = inquiries.filter(inq => {
    const productMatch = inq.message.match(/\[Product:\s*(.*?)\]/);
    const inqProduct = productMatch ? productMatch[1] : null;

    const matchesFilter = filter === 'all' || inq.status === filter;
    const matchesProduct = productFilter === 'all' || inqProduct === productFilter;
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesProduct && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Cute Header Card */}
      <header className="p-6 lg:p-8 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Mail size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Inquiries &amp; Quotes
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {inquiries.length} total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and respond to client inquiries and procurement quotes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchInquiries}
            disabled={isLoading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin text-blue-400' : ''}
            />
          </button>

          {/* Product Filter */}
          {uniqueProducts.length > 0 && (
            <select
              className="bg-[#07090e] border border-[#21293d] rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              {uniqueProducts.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-2xl border border-[#21293d]">
            {(['all', 'pending', 'reviewed', 'archived'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Cute Search Bar */}
      <div className="p-3 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex items-center gap-3">
        <Search className="text-slate-500 ml-2 shrink-0" size={18} />
        <input
          type="text"
          placeholder="Search by client name, organization, or message..."
          className="flex-1 py-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Inquiries Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
            <span className="text-xs font-bold">Loading inquiries...</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredInquiries.map(inq => {
              const productMatch = inq.message.match(/\[Product:\s*(.*?)\]/);
              const interestMatch = inq.message.match(/\[Interest:\s*(.*?)\]/);
              const inqProduct = productMatch ? productMatch[1] : null;
              const inqInterest = interestMatch ? interestMatch[1] : 'General';
              const cleanMessage = inq.message
                .replace(/\[.*?\]/g, '')
                .replace(/^ - /, '')
                .trim();

              return (
                <motion.div
                  key={inq.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-5 lg:p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] hover:border-blue-500/30 transition-all shadow-lg space-y-4 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Client Info */}
                    <div className="lg:w-1/3 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {inq.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">
                            {inq.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Building2 size={12} className="text-slate-500" />
                            <span className="truncate">{inq.company || 'Direct Buyer'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-blue-400 font-medium">
                          <Mail size={12} />
                          <span className="truncate">{inq.email}</span>
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <span>Phone: {inq.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Clock size={11} />
                          <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inquiry Message & Product */}
                    <div className="flex-1 lg:border-l lg:border-[#1d2436] lg:pl-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {inqProduct && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-300 rounded-xl text-xs font-semibold border border-blue-500/20">
                            <Package size={12} /> {inqProduct}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/[0.03] text-slate-400 rounded-lg text-[10px] font-medium border border-[#21293d]">
                          <MessageSquare size={10} /> {inqInterest}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            inq.status === 'reviewed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : inq.status === 'archived'
                              ? 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-[#07090e]/60 p-4 rounded-2xl border border-[#1d2436]">
                        &ldquo;{cleanMessage}&rdquo;
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => updateStatus(inq.id, 'reviewed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            inq.status === 'reviewed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/[0.04] text-slate-300 hover:text-emerald-400 border border-[#21293d]'
                          }`}
                        >
                          <CheckCircle size={13} />
                          <span>{inq.status === 'reviewed' ? 'Reviewed' : 'Mark Reviewed'}</span>
                        </button>

                        <button
                          onClick={() => updateStatus(inq.id, 'archived')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            inq.status === 'archived'
                              ? 'bg-slate-800 text-slate-200 border border-slate-700'
                              : 'bg-white/[0.04] text-slate-300 hover:text-rose-400 border border-[#21293d]'
                          }`}
                        >
                          <Archive size={13} />
                          <span>{inq.status === 'archived' ? 'Archived' : 'Archive'}</span>
                        </button>

                        <a
                          href={`mailto:${inq.email}?subject=Regarding your inquiry about ${
                            inqProduct || inqInterest
                          }`}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                        >
                          <span>Reply Email</span>
                          <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!isLoading && filteredInquiries.length === 0 && (
          <div className="text-center py-20 bg-[#0d111a] rounded-3xl border border-dashed border-[#1d2436]">
            <Mail className="mx-auto text-slate-600 mb-3" size={36} />
            <p className="text-slate-400 font-bold text-xs">No inquiries found in this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
