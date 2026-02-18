
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mail, Filter, CheckCircle, Clock, 
  Archive, MoreVertical, ExternalLink, User,
  Building2, MessageSquare, ArrowUpRight
} from 'lucide-react';
import { Inquiry } from '../../types';

export const InquiryFlow: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: '1',
      name: 'Dr. Aris Varma',
      email: 'a.varma@citygeneral.com',
      company: 'City General Hospital',
      message: 'Interested in a fleet acquisition of 5 XT-Series Hematology Analyzers. Please provide bulk pricing.',
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'schen@alphadiag.org',
      company: 'Alpha Diagnostics',
      message: 'Need technical dossier for the DRX-900 Digital X-Ray system for a new facility setup.',
      status: 'reviewed',
      created_at: new Date().toISOString()
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const updateStatus = (id: string, status: Inquiry['status']) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesFilter = filter === 'all' || inq.status === filter;
    const matchesSearch = inq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inq.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inquiry Flow</h1>
          <p className="text-gray-500 font-medium">Manage clinical procurement requests and RFQs</p>
        </div>
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
      </header>

      <div className="bg-white p-4 rounded-2xl border mb-8 flex items-center gap-4 shadow-sm">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Filter inquiries by client or organization..." 
          className="flex-1 py-2 bg-transparent outline-none font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence mode='popLayout'>
          {filteredInquiries.map((inq) => (
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
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                         {inq.name.charAt(0)}
                       </div>
                       <div>
                         <h3 className="font-black text-gray-900">{inq.name}</h3>
                         <div className="flex items-center gap-1 text-xs text-gray-400 font-bold">
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
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
                      <MessageSquare size={12} /> Clinical Requirement
                    </div>
                    <p className="text-gray-600 leading-relaxed italic mb-6">"{inq.message}"</p>
                    
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
                         className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 transition-all"
                       >
                         <Archive size={14} /> Archive
                       </button>
                       <a href={`mailto:${inq.email}`} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-2 transition-all">
                         Respond <ArrowUpRight size={14} />
                       </a>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredInquiries.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed">
            <Mail className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No clinical inquiries found in this matrix</p>
          </div>
        )}
      </div>
    </div>
  );
};
