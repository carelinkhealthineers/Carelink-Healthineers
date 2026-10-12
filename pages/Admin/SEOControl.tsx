import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Save,
  Search,
  Globe,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  Edit3,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SEOSetting {
  id: string;
  page_path: string;
  title: string;
  meta_description: string;
  keywords: string[];
  og_image: string;
}

const DEFAULT_SEO_ROUTES: SEOSetting[] = [
  {
    id: 'seo-home',
    page_path: '/',
    title: 'Carelink Healthineers | Medical & Dental Equipment · Official Dürr Dental Distributor',
    meta_description: 'Carelink Healthineers supplies certified medical and dental equipment directly to hospitals and clinics. Official partner of Dürr Dental.',
    keywords: ['medical equipment', 'Dürr Dental', 'dental equipment', 'hospital equipment', 'Carelink Healthineers'],
    og_image: 'https://i.imgur.com/y0UvXGu.png',
  },
  {
    id: 'seo-portfolio',
    page_path: '/portfolio',
    title: 'Medical & Dental Equipment Catalog',
    meta_description: 'Browse certified diagnostic imaging, dental systems, ICU monitors, and surgical hardware.',
    keywords: ['medical catalog', 'dental xray', 'VistaPano', 'VistaVox', 'patient monitor'],
    og_image: 'https://i.imgur.com/y0UvXGu.png',
  },
  {
    id: 'seo-acquisition',
    page_path: '/acquisition',
    title: 'Request Equipment Quotation & Contact',
    meta_description: 'Get direct factory pricing and technical specifications for medical and dental equipment from Carelink Healthineers.',
    keywords: ['medical quote', 'dental equipment price', 'Dhaka medical supplier', 'Carelink contact'],
    og_image: 'https://i.imgur.com/y0UvXGu.png',
  },
  {
    id: 'seo-foundation',
    page_path: '/foundation',
    title: 'Corporate Foundation & Quality Guidelines',
    meta_description: 'Learn about Carelink Healthineers corporate mission, biomedical engineering support, and quality compliance.',
    keywords: ['about Carelink Healthineers', 'healthcare engineering', 'medical compliance'],
    og_image: 'https://i.imgur.com/y0UvXGu.png',
  },
];

export const SEOControl: React.FC = () => {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SEOSetting>>({});
  const [newRouteModal, setNewRouteModal] = useState(false);
  const [newPathInput, setNewPathInput] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  const persistSEOList = async (list: SEOSetting[]) => {
    const { data: existingRow } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'page_seo_matrix')
      .maybeSingle();

    if (existingRow?.id) {
      const { data, error } = await supabase
        .from('settings')
        .update({ value: JSON.stringify(list) })
        .eq('key', 'page_seo_matrix')
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Database update blocked by permissions.');
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert([{
          key: 'page_seo_matrix',
          value: JSON.stringify(list),
          category: 'seo',
          description: 'Global page meta titles, descriptions, and keywords matrix',
        }])
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Database insert blocked by permissions.');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'page_seo_matrix')
        .maybeSingle();

      if (data?.value) {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((item: any) => ({
            ...item,
            keywords: Array.from(
              new Set((item.keywords || []).map((k: string) => (k || '').trim()).filter(Boolean))
            ),
          }));
          setSettings(cleaned);
          setLoading(false);
          return;
        }
      }

      setSettings(DEFAULT_SEO_ROUTES);
      await persistSEOList(DEFAULT_SEO_ROUTES);
    } catch (err) {
      console.warn('SEO settings load notice:', err);
      setSettings(DEFAULT_SEO_ROUTES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (setting: SEOSetting) => {
    setEditingId(setting.id);
    setEditForm(setting);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    setSaving(true);
    try {
      const updatedList = settings.map(s =>
        s.id === editingId
          ? ({
              ...s,
              title: editForm.title || s.title,
              meta_description: editForm.meta_description || '',
              keywords: Array.from(
                new Set((editForm.keywords || []).map(k => (k || '').trim()).filter(Boolean))
              ),
              og_image: editForm.og_image || '',
            } as SEOSetting)
          : s
      );

      await persistSEOList(updatedList);
      setSettings(updatedList);
      setEditingId(null);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err: any) {
      alert('Error saving SEO settings: ' + (err.message || 'Database error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPathInput.trim()) return;
    const formattedPath = newPathInput.trim().startsWith('/') ? newPathInput.trim() : `/${newPathInput.trim()}`;

    const newEntry: SEOSetting = {
      id: `seo-${Date.now()}`,
      page_path: formattedPath,
      title: 'New Page Title',
      meta_description: 'Enter page meta description for search engines...',
      keywords: ['Carelink Healthineers', 'medical equipment'],
      og_image: 'https://i.imgur.com/y0UvXGu.png',
    };

    const nextList = [newEntry, ...settings];
    try {
      await persistSEOList(nextList);
      setSettings(nextList);
      setNewPathInput('');
      setNewRouteModal(false);
      handleEdit(newEntry);
    } catch (err: any) {
      alert('Failed to register SEO route: ' + (err.message || 'Database error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete SEO metadata for this page route?')) return;
    const nextList = settings.filter(s => s.id !== id);
    try {
      await persistSEOList(nextList);
      setSettings(nextList);
    } catch (err: any) {
      alert('Failed to delete SEO route: ' + (err.message || 'Database error'));
    }
  };

  const filteredSettings = settings.filter(s =>
    s.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Cute Header Card */}
      <header className="p-6 lg:p-8 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Globe size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                SEO &amp; Meta Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {settings.length} routes
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control search engine indexing, page titles, and meta keywords.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}

          <button
            onClick={fetchSettings}
            disabled={loading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh SEO Matrix"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin text-blue-400' : ''}
            />
          </button>

          <button
            onClick={() => setNewRouteModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Route</span>
          </button>
        </div>
      </header>

      {/* Add Route Form */}
      {newRouteModal && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-3xl bg-[#0d111a] border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-center gap-3"
        >
          <Globe className="text-blue-400 shrink-0 ml-1" size={18} />
          <input
            type="text"
            required
            placeholder="Route path (e.g. /portfolio or /insights)"
            className="flex-1 w-full px-4 py-2.5 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-blue-500"
            value={newPathInput}
            onChange={e => setNewPathInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewRouteModal(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/20"
            >
              Create Route
            </button>
          </div>
        </form>
      )}

      {/* Cute Search Bar */}
      <div className="p-3 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex items-center gap-3">
        <Search className="text-slate-500 ml-2 shrink-0" size={18} />
        <input
          type="text"
          placeholder="Search by page path or title..."
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

      {/* Routes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
            <span className="text-xs font-bold">Loading SEO matrix...</span>
          </div>
        ) : (
          filteredSettings.map(setting => (
            <div
              key={setting.id}
              className="p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] hover:border-blue-500/30 transition-all shadow-lg space-y-4"
            >
              {editingId === setting.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1d2436]">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
                      {setting.page_path}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        {saving ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Save size={13} />
                        )}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Page Title
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-blue-500"
                        value={editForm.title || ''}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        OG Share Image URL
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-blue-500"
                        value={editForm.og_image || ''}
                        onChange={e => setEditForm({ ...editForm, og_image: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Meta Description
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-2.5 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-medium text-white placeholder-slate-600 outline-none focus:border-blue-500 resize-none"
                        value={editForm.meta_description || ''}
                        onChange={e => setEditForm({ ...editForm, meta_description: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Keywords (Comma separated)
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-[#07090e] border border-[#1d2436] rounded-2xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-blue-500"
                        value={editForm.keywords?.join(', ') || ''}
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-mono font-bold text-blue-400">
                        {setting.page_path}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate max-w-md">
                        {setting.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {setting.meta_description || 'No description provided.'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Array.from(
                        new Set((setting.keywords || []).map(k => (k || '').trim()).filter(Boolean))
                      ).map((k, idx) => (
                        <span
                          key={`${setting.id}-kw-${idx}-${k}`}
                          className="text-[10px] font-semibold text-slate-400 bg-white/[0.03] border border-[#21293d] px-2.5 py-0.5 rounded-lg"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#21293d] flex items-center gap-1.5"
                    >
                      <Edit3 size={13} className="text-blue-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(setting.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all cursor-pointer border border-rose-500/20"
                      title="Delete Route"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
