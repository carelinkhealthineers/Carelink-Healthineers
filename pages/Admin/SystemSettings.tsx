
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Loader2, Globe, ShieldAlert, Database, Settings, Server, Terminal, Info, Layout, Activity } from 'lucide-react';
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
    <div className="p-10 lg:p-16 text-white min-h-screen">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Core_Registry: System_Config</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">System <span className="text-slate-700 italic">Configuration.</span></h1>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 px-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
           <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${status === 'nominal' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node Status: <span className={status === 'nominal' ? 'text-emerald-500' : 'text-rose-500'}>{status.toUpperCase()}</span></span>
           <button onClick={fetchSettings} className="ml-4 p-2 text-slate-700 hover:text-white transition-colors">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Settings Terminal Area */}
        <div className="lg:col-span-7 space-y-16">
          {isLoading ? (
            <div className="py-40 flex flex-col items-center justify-center opacity-30">
               <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
               <span className="text-[9px] font-black uppercase tracking-widest">Accessing Neural Config...</span>
            </div>
          ) : (
            categories.map(category => (
              <div key={category} className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-6 h-px bg-blue-600/30" />
                   <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{category} Protocol</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {settings.filter(s => s.category === category).map(setting => (
                    <div key={setting.key} className="bg-white/[0.01] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4">
                            <Terminal size={14} className="text-blue-500" />
                            <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{setting.key}</div>
                         </div>
                         <div className="px-3 py-1 bg-white/5 text-[8px] font-black text-slate-700 uppercase tracking-widest rounded-lg border border-white/5">Active_Node</div>
                      </div>
                      <input 
                        className="w-full px-8 py-5 bg-black border border-white/5 rounded-2xl outline-none font-black text-white placeholder:text-slate-800 focus:border-blue-600 transition-all mb-4"
                        value={setting.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
                        }}
                        onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                      />
                      <div className="flex items-start gap-3 px-2">
                         <Info size={14} className="text-slate-800 mt-0.5 shrink-0" />
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed italic opacity-60">{setting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Diagnostic Sidebar */}
        <div className="lg:col-span-5 space-y-10">
           <div className="sticky top-24 space-y-10">
              <div className="bg-[#05070a] p-12 rounded-[4rem] border border-white/5 shadow-4xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform pointer-events-none">
                    <ShieldAlert size={240} className="text-blue-600" />
                 </div>
                 <div className="relative z-10">
                   <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-10 border border-blue-500/20">
                      <ShieldAlert size={32} />
                   </div>
                   <h3 className="text-3xl font-black mb-6 tracking-tight">Security & Policy</h3>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed mb-12 italic opacity-80">All registry modifications are telemetrically logged for audit within the Command Nexus ecosystem. System state is governed by RBAC protocols injected via Supabase Auth.</p>
                   <div className="flex items-center gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5 backdrop-blur-md">
                      <Globe className="text-blue-500" size={24} />
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Api_Link: <span className="text-emerald-500">STABLE_ENCRYPTED</span></div>
                   </div>
                 </div>
              </div>
              
              <div className="p-12 border-2 border-dashed border-white/5 rounded-[4rem] text-center bg-white/[0.01] group hover:bg-white/[0.02] transition-all">
                 <Server className="mx-auto text-slate-900 mb-8 group-hover:text-blue-500 transition-colors" size={64} />
                 <h4 className="font-black text-slate-700 group-hover:text-white transition-colors uppercase tracking-[0.4em] text-xs">Infrastructure Layer</h4>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6 leading-relaxed max-w-xs mx-auto opacity-50 italic">Extended technical config and neural routing parameters are locked until v2.0 cycle.</p>
                 <button className="mt-10 px-10 py-5 bg-white/5 text-slate-800 rounded-3xl text-[9px] font-black uppercase tracking-[0.2em] cursor-not-allowed border border-white/5">Initialize_Root_Access</button>
              </div>

              <div className="flex items-center justify-between px-10 py-6 bg-white/[0.01] rounded-full border border-white/5 text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">
                 <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ISO_13485: SECURE</div>
                 <Activity size={14} className="text-slate-800" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
