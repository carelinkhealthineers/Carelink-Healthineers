import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Check,
  Sparkles,
  Sliders,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Setting } from '../../types';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category', { ascending: false })
        .order('key');
      if (error) {
        setStatus('offline');
        throw error;
      }
      setSettings(data || []);
      setStatus('online');
    } catch (err) {
      console.error('Settings load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (id: string, keyName: string, value: string) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({ value })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update blocked by database permissions.');
      }
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, value } : s))
      );
      setSavedKey(keyName);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err: any) {
      alert(`Save failed: ${err?.message || 'Database error'}`);
      await fetchSettings();
    } finally {
      setIsSaving(false);
    }
  };

  const categories = Array.from(
    new Set(settings.map((s) => s.category || 'general'))
  );

  const filteredSettings =
    selectedCategory === 'all'
      ? settings
      : settings.filter((s) => (s.category || 'general') === selectedCategory);

  return (
    <div className="space-y-8 text-slate-100">
      {/* Cute Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 lg:p-8 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Settings size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Settings
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Variables
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage configuration variables and website settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedKey && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span>Saved</span>
            </motion.div>
          )}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-[#21293d] text-xs font-semibold text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            <span className="capitalize">{status}</span>
          </div>

          <button
            onClick={fetchSettings}
            disabled={isLoading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh Settings"
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin text-blue-400' : ''}
            />
          </button>
        </div>
      </header>

      {/* Cute Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
          }`}
        >
          All Settings ({settings.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Settings Grid */}
      {isLoading ? (
        <div className="py-28 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
          <span className="text-xs font-bold">Loading settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSettings.map((setting) => (
            <motion.div
              key={setting.id}
              layout
              className="p-5 lg:p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] hover:border-blue-500/30 transition-all space-y-4 shadow-lg group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <Sliders size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {setting.key}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      {setting.category || 'General'}
                    </span>
                  </div>
                </div>

                {savedKey === setting.key && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={10} /> Saved
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-medium text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  value={setting.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettings((prev) =>
                      prev.map((s) =>
                        s.id === setting.id ? { ...s, value: val } : s
                      )
                    );
                  }}
                  onBlur={(e) =>
                    handleUpdate(setting.id, setting.key, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder="Enter value..."
                />
                {setting.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                    {setting.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
