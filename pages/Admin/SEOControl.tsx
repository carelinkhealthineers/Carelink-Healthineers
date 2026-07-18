import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Search, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SEOSetting {
  id: string;
  page_path: string;
  title: string;
  meta_description: string;
  keywords: string[];
  og_image: string;
}

export const SEOControl: React.FC = () => {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SEOSetting>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('page_seo_settings')
      .select('*')
      .order('page_path');
    
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleEdit = (setting: SEOSetting) => {
    setEditingId(setting.id);
    setEditForm(setting);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;

    const { error } = await supabase
      .from('page_seo_settings')
      .update({
        title: editForm.title,
        meta_description: editForm.meta_description,
        keywords: editForm.keywords,
        og_image: editForm.og_image
      })
      .eq('id', editingId);

    if (!error) {
      setSettings(settings.map(s => s.id === editingId ? { ...s, ...editForm } as SEOSetting : s));
      setEditingId(null);
    } else {
      alert('Error saving SEO settings');
    }
  };

  const handleCreate = async () => {
    const newPath = prompt("Enter new page path (e.g., /about):");
    if (!newPath) return;

    const { data, error } = await supabase
      .from('page_seo_settings')
      .insert([{
        page_path: newPath,
        title: 'New Page Title',
        meta_description: 'Description...',
        keywords: ['keyword1']
      }])
      .select()
      .single();

    if (data) {
      setSettings([...settings, data]);
      handleEdit(data);
    }
  };

  const filteredSettings = settings.filter(s => 
    s.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SEO Command Center</h1>
          <p className="text-slate-500 text-sm font-medium">Manage global meta tags and search engine visibility.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-md"
        >
          + Add Route
        </button>
      </div>

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
                  <span className="text-blue-600 font-mono text-xs">{setting.page_path}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500">
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Title</label>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors shadow-sm"
                      value={editForm.title}
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
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors h-24 resize-none shadow-sm"
                      value={editForm.meta_description || ''}
                      onChange={e => setEditForm({...editForm, meta_description: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords (Comma Separated)</label>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:border-blue-500 outline-none transition-colors shadow-sm"
                      value={editForm.keywords?.join(', ') || ''}
                      onChange={e => setEditForm({...editForm, keywords: e.target.value.split(',').map(s => s.trim())})}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
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
                <button 
                  onClick={() => handleEdit(setting)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm"
                >
                  Edit Metadata
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
