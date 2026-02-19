
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Loader2, Globe, ShieldAlert, Database, Settings, Server, Terminal, Info, Layout } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Setting } from '../../types';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'nominal' | 'degraded' | 'offline'>('nominal');

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*').order('category', { ascending: false }).order('key');
      if (error) {
        setStatus('offline');
        throw error;
      }
      setSettings(data || []);
      setStatus('nominal');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (id: string, value: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('settings').update({ value }).eq('id', id);
      if (error) throw error;
      setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
    } catch (err) {
      alert('Registry Sync Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = Array.from(new Set(settings.map(s => s.category || 'general')));

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-blue-500 flex items-center justify-center shadow-2xl">
              <Settings size={32} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Configuration</h1>
             <p className="text-gray-500 font-medium">Manage Site-Wide Registry Variables</p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 px-6 rounded-2xl border shadow-sm">
           <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'nominal' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status: <span className={status === 'nominal' ? 'text-emerald-500' : 'text-rose-500'}>{status.toUpperCase()}</span></span>
           <button onClick={fetchSettings} className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Settings Grid */}
        <div className="lg:col-span-7 space-y-12">
          {isLoading ? (
            <div className="py-40 flex flex-col items-center justify-center text-slate-300">
               <Loader2 className="animate-spin mb-4" size={40} />
               <span className="text-[10px] font-black uppercase tracking-widest">Accessing Neural Config...</span>
            </div>
          ) : (
            categories.map(category => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600" />
                   <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">{category} Commands</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {settings.filter(s => s.category === category).map(setting => (
                    <div key={setting.key} className="bg-white p-8 rounded-[2.5rem] border shadow-sm group hover:border-blue-500 transition-all">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                            <Terminal size={14} className="text-blue-500" />
                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{setting.key}</div>
                         </div>
                         <div className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg">Live Node</div>
                      </div>
                      <input 
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 font-bold mb-4 transition-all text-slate-900"
                        value={setting.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
                        }}
                        onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                      />
                      <div className="flex items-start gap-2 px-2">
                         <Info size={14} className="text-slate-300 mt-0.5 shrink-0" />
                         <p className="text-xs text-gray-400 font-medium leading-relaxed">{setting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Diagnostics */}
        <div className="lg:col-span-5 space-y-8">
           <div className="sticky top-24 space-y-8">
              <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-4xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform">
                    <ShieldAlert size={240} />
                 </div>
                 <div className="relative z-10">
                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                      <ShieldAlert size={32} />
                   </div>
                   <h3 className="text-3xl font-black mb-6 tracking-tight">Security & Governance</h3>
                   <p className="text-gray-400 mb-10 leading-relaxed font-medium">System state is governed by RBAC (Role-Based Access Control) injected via Supabase Auth metadata. All registry modifications are telemetrically logged for audit.</p>
                   <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
                      <Globe className="text-blue-500" size={24} />
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global API Connectivity: <span className="text-emerald-500">STABLE_ENCRYPTED</span></div>
                   </div>
                 </div>
              </div>
              
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col items-center text-center group">
                 <div className="w-20 h-20 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Layout size={36} />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 mb-4">Footer Architecture</h4>
                 <p className="text-sm text-slate-400 leading-relaxed mb-8">Changes to the 'footer' category are immediately reflected in the public clinical portal. Use for updating physical headquarters and technical contact nodes.</p>
                 <div className="w-full h-[2px] bg-slate-50 mb-8" />
                 <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <RefreshCw size={14} className="animate-spin-slow" /> Hot Reloading: Active
                 </div>
              </div>

              <div className="p-12 border-4 border-dashed rounded-[4rem] text-center bg-white/50 group hover:bg-white transition-all">
                 <Server className="mx-auto text-slate-200 mb-6 group-hover:text-blue-500 transition-colors" size={64} />
                 <h4 className="font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest text-sm">Advanced Infrastructure</h4>
                 <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-xs mx-auto">Extended technical config and neural routing parameters are locked until v2.0 stable deployment cycle.</p>
                 <button className="mt-8 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Initialize Root Access</button>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
