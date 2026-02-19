
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Loader2, Globe, ShieldAlert, Database, Settings } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Setting } from '../../types';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*').order('key');
      if (error) throw error;
      setSettings(data || []);
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
    try {
      await supabase.from('settings').update({ value }).eq('id', id);
      setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
    } catch (err) {
      alert('Sync Failed');
    }
  };

  return (
    <div className="p-8">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Configuration</h1>
        <p className="text-gray-500 font-medium">Manage Site-Wide Registry Variables</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            settings.map(setting => (
              <div key={setting.key} className="bg-white p-8 rounded-[2.5rem] border shadow-sm group">
                <div className="flex items-center justify-between mb-4">
                   <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{setting.key}</div>
                   <Database size={14} className="text-gray-200" />
                </div>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold mb-4"
                  value={setting.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
                  }}
                  onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                />
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{setting.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <ShieldAlert className="absolute top-0 right-0 p-10 opacity-10" size={200} />
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-6">Security & Auth</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">System state is governed by RBAC (Role-Based Access Control) injected via Supabase Auth metadata.</p>
                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                   <Globe className="text-blue-500" size={24} />
                   <div className="text-sm font-bold">Public API Connectivity: <span className="text-emerald-500">NOMINAL</span></div>
                </div>
              </div>
           </div>
           
           <div className="p-10 border border-dashed rounded-[3rem] text-center">
              <Settings className="mx-auto text-gray-300 mb-4" size={40} />
              <h4 className="font-bold text-gray-400">Advanced Parameters</h4>
              <p className="text-xs text-gray-300 mt-2">Extended technical config locked until v2.0 deployment.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
