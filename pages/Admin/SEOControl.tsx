import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Search, Globe, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';

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
    id: 'seo-alliances',
    page_path: '/alliances',
    title: 'Our Partners | Global Distributors & Dürr Dental',
    meta_description: 'Strategic manufacturing alliances and official distribution partnerships including Dürr Dental Germany.',
    keywords: ['Dürr Dental Bangladesh', 'medical partners', 'global healthcare distributors'],
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
  const [saveToast, setSaveToast] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SEOSetting>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [newRouteModal, setNewRouteModal] = useState(false);
  const [newPathInput, setNewPathInput] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const persistSEOList = async (list: SEOSetting[]) => {
    const { error } = await supabase.from('settings').upsert(
      {
        key: 'page_seo_matrix',
        value: JSON.stringify(list),
        category: 'seo',
        description: 'Global route-level SEO metadata registry',
      },
      { onConflict: 'key' }
    );
    if (error) throw error;
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
          setSettings(parsed);
          setLoading(false);
          return;
        }
      }

      // Initialize default SEO routes in database if not yet present
      setSettings(DEFAULT_SEO_ROUTES);
      await persistSEOList(DEFAULT_SEO_ROUTES);
    } catch (err) {
      console.warn('SEO settings load notice:', err);
      setSettings(DEFAULT_SEO_ROUTES);
    } finally {
      setLoading(false);
    }
  };

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
              keywords: editForm.keywords || [],
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
      alert('Error saving SEO settings: ' + (err.message || 'Unknown error'));
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
    setSettings(nextList);
    setNewRouteModal(false);
    setNewPathInput('');
    handleEdit(newEntry);
    try {
      await persistSEOList(nextList);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this route from SEO Matrix?')) return;
    const nextList = settings.filter(s => s.id !== id);
    setSettings(nextList);
    try {
      await persistSEOList(nextList);
    } catch {}
  };

  const filteredSettings = settings.filter(s => 
    s.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SEO Command Center</h1>
          <p className="text-slate-500 text-sm font-medium">Manage global meta tags and search engine visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Saved Successfully
            </span>
          )}
          <button
            onClick={fetchSettings}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
            title="Refresh SEO Matrix"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setNewRouteModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-md cursor-pointer"
          >
            + Add Route
          </button>
        </div>
      </div>

      {newRouteModal && (
        <form onSubmit={handleCreate} className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <Globe className="text-blue-600 shrink-0" size={20} />
          <input
            type="text"
            required
            placeholder="Enter route path (e.g. /portfolio or /privacypolicy)"
            className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
            value={newPathInput}
            onChange={e => setNewPathInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setNewRouteModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer">
              Create Route
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-4 bg-[#f4f4f5] p-4 rounded-2xl border border-slate-200">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="SEARCH ROUTES..." 
          className="bg-transparent border-none outline-none text-slate-800 text-sm font-bold uppercase tracking-wider w-full placeholder:text-slate-400"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6">
        {filteredSettings.map(setting => (
          <div key={setting.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-500/20 transition-all group shadow-sm">
            {editingId === setting.id ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-blue-600 font-mono text-xs font-bold">{setting.page_path}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase cursor-pointer">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 cursor-pointer">
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Title</label>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors shadow-sm"
                      value={editForm.title || ''}
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OG Image URL</label>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors shadow-sm"
                      value={editForm.og_image || ''}
                      onChange={e => setEditForm({...editForm, og_image: e.target.value})}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors h-24 resize-none shadow-sm"
                      value={editForm.meta_description || ''}
                      onChange={e => setEditForm({...editForm, meta_description: e.target.value})}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords (Comma Separated)</label>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors shadow-sm"
                      value={editForm.keywords?.join(', ') || ''}
                      onChange={e => setEditForm({...editForm, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-mono text-blue-600 shadow-sm w-max">{setting.page_path}</span>
                    <h3 className="text-lg font-bold text-slate-900">{setting.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm max-w-2xl line-clamp-2">{setting.meta_description}</p>
                  <div className="flex flex-wrap gap-2">
                    {setting.keywords?.map(k => (
                      <span key={k} className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border border-slate-200 bg-white px-2 py-1 rounded shadow-sm">{k}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleEdit(setting)}
                    className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm cursor-pointer"
                  >
                    Edit Metadata
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="p-2 border border-slate-200 bg-white rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm cursor-pointer"
                    title="Delete Route"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
