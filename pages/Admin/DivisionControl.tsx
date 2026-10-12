import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  RefreshCw,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Division } from '../../types';
import { slugify } from '../../utils/slugify';

export const DivisionControl: React.FC = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Division>>({
    name: '',
    description: '',
    hero_gradient: 'from-blue-600 to-indigo-700',
    icon_name: 'Activity',
  });

  const fetchDivisions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .order('order_index');
      if (error) throw error;
      setDivisions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const handleSave = async () => {
    if (!formData.name?.trim()) return;
    setIsSaving(true);
    const slug = slugify(formData.name);
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('divisions')
          .update({ ...formData, slug })
          .eq('id', editingId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0)
          throw new Error('Update blocked by database permissions.');
      } else {
        const { data, error } = await supabase
          .from('divisions')
          .insert([{ ...formData, slug }])
          .select();
        if (error) throw error;
        if (!data || data.length === 0)
          throw new Error('Insert blocked by database permissions.');
      }
      await fetchDivisions();
      setIsEditorOpen(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Database error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditor = (div: Division | null = null) => {
    if (div) {
      setEditingId(div.id);
      setFormData(div);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        hero_gradient: 'from-blue-600 to-indigo-700',
        icon_name: 'Activity',
      });
    }
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this division? Products assigned to it may be affected.')) return;
    try {
      const { data, error } = await supabase
        .from('divisions')
        .delete()
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error('Delete blocked by database permissions.');
      setDivisions((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert('Failed to delete division: ' + (err.message || 'Check database permissions'));
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Cute Header Card */}
      <header className="p-6 lg:p-8 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Product Divisions
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {divisions.length} active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Organize medical equipment by clinical category &amp; department.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDivisions}
            disabled={isLoading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh Divisions"
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin text-blue-400' : ''}
            />
          </button>

          <button
            onClick={() => toggleEditor()}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Division</span>
          </button>
        </div>
      </header>

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-28 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
            <span className="text-xs font-bold">Loading divisions...</span>
          </div>
        ) : (
          divisions.map((div) => (
            <motion.div
              key={div.id}
              layout
              className="p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] hover:border-blue-500/30 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                    div.hero_gradient || 'from-blue-600 to-indigo-700'
                  } mb-4 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform`}
                >
                  <Layers size={22} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {div.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-5">
                  {div.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#1d2436]">
                <button
                  onClick={() => toggleEditor(div)}
                  className="flex-1 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#21293d]"
                >
                  <Edit3 size={13} className="text-blue-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(div.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all cursor-pointer border border-rose-500/20"
                  title="Delete Division"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Cute Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0d111a] border border-[#1d2436] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1d2436]">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Division' : 'New Division'}
                </h3>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Division Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Imaging & Radiology"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Gradient Accent
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-mono text-slate-300 outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. from-blue-600 to-indigo-700"
                    value={formData.hero_gradient || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, hero_gradient: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-medium text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                    placeholder="Brief description of products in this division..."
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer border border-[#21293d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>Save Division</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
