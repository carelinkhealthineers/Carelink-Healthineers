
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mail, Filter, CheckCircle, Clock, 
  Archive, MoreVertical, ExternalLink, User,
  Building2, MessageSquare, ArrowUpRight, RefreshCw, Package
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
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
    } catch (err) {
      console.error('Update Error:', err);
    }
  };

  // Extract unique products dynamically from the embedded message payload
  const uniqueProducts = Array.from(new Set(
    inquiries.map(inq => {
      const match = inq.message.match(/\[Product:\s*(.*?)\]/);
      return match ? match[1] : null;
    }).filter(Boolean)
  )) as string[];

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
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inquiry Flow</h1>
          <p className="text-gray-500 font-medium">Manage clinical procurement requests and RFQs</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={fetchInquiries}
            className="p-3 bg-white border rounded-xl text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          
          {/* Target Asset Filter */}
          <select 
            className="bg-white border rounded-xl px-4 py-2 text-xs font-black text-gray-500 uppercase tracking-widest outline-none shadow-sm hover:border-blue-500 transition-colors"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="all">All Assets</option>
            {uniqueProducts.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <div className="flex gap-2 bg-white p-1 rounded-2xl border shadow-sm">
            {['all', 'pending', 'reviewed', 'archived'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-white p-4 rounded-2xl border mb-8 flex items-center gap-4 shadow-sm">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Filter inquiries by client, organization, or clinical interest..." 
          className="flex-1 py-2 bg-transparent outline-none font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-40 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Supabase Registry...</p>
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {filteredInquiries.map((inq) => {
              // Parse out specific embedded data logic
              const productMatch = inq.message.match(/\[Product:\s*(.*?)\]/);
              const interestMatch = inq.message.match(/\[Interest:\s*(.*?)\]/);
              const inqProduct = productMatch ? productMatch[1] : null;
              const inqInterest = interestMatch ? interestMatch[1] : 'General';
              const cleanMessage = inq.message.replace(/\[.*?\]/g, '').replace(/^ - /, '').trim();

              return (
                <motion.div
                  key={inq.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                     <div className="lg:w-1/3">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                             {inq.name.charAt(0)}
                           </div>
                           <div>
                             <h3 className="font-black text-gray-900 text-lg">{inq.name}</h3>
                             <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                               <Building2 size={12} /> {inq.company}
                             </div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-sm text-blue-600 font-bold">
                             <Mail size={14} /> {inq.email}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                             <Clock size={12} /> {new Date(inq.created_at).toLocaleDateString()}
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 lg:border-l lg:pl-8">
                        {/* Target Product Badge */}
                        {inqProduct && (
                          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                            <Package size={14} /> Target Asset: {inqProduct}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                          <MessageSquare size={12} /> Interest: {inqInterest}
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium italic mb-6">"{cleanMessage}"</p>
                        
                        <div className="flex flex-wrap gap-3">
                           <button 
                             onClick={() => updateStatus(inq.id, 'reviewed')}
                             className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                               inq.status === 'reviewed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                             }`}
                           >
                             <CheckCircle size={14} /> {inq.status === 'reviewed' ? 'Reviewed' : 'Mark Reviewed'}
                           </button>
                           <button 
                             onClick={() => updateStatus(inq.id, 'archived')}
                             className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                               inq.status === 'archived' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600'
                             }`}
                           >
                             <Archive size={14} /> {inq.status === 'archived' ? 'Archived' : 'Archive'}
                           </button>
                           <a href={`mailto:${inq.email}?subject=Regarding your inquiry about ${inqProduct || inqInterest}`} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-2 transition-all">
                             Respond <ArrowUpRight size={14} />
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
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed">
            <Mail className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No clinical inquiries found in this matrix</p>
          </div>
        )}
      </div>
    </div>
  );
};
