
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, X, Save, 
  Database, MapPin, Award, RefreshCw, Loader2, ShieldCheck
} from 'lucide-react';
import { Alliance } from '../../types';
import { supabase } from '../../supabaseClient';
import { slugify } from '../../utils/slugify';

export const AllianceControl: React.FC = () => {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Alliance>>({
    name: '',
    country: '',
    category: 'Imaging',
    specialization: '',
    description: '',
    logo_url: '',
    website_url: '',
    certifications: [],
    is_featured: false
  });

  const fetchAlliances = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('alliances').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAlliances(data || []);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlliances();
  }, []);

  const handleSave = async () => {
    if (!formData.name) return;
    setIsSaving(true);
    const slug = slugify(formData.name);
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('alliances')
          .update({ ...formData, slug })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alliances')
          .insert([{ ...formData, slug }]);
        if (error) throw error;
      }
      await fetchAlliances();
      setIsEditorOpen(false);
    } catch (err: any) {
      alert('Persistence Failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditor = (alliance: Alliance | null = null) => {
    if (alliance) {
      setEditingId(alliance.id);
      setFormData(alliance);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        country: '',
        category: 'Imaging',
        specialization: '',
        description: '',
        logo_url: '',
        website_url: '',
        certifications: [],
        is_featured: false
      });
    }
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate alliance record?")) return;
    try {
      const { error } = await supabase.from('alliances').delete().eq('id', id);
      if (error) throw error;
      setAlliances(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Deletion Failed: ' + err.message);
    }
  };

  const filtered = alliances.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Alliance Matrix</h1>
          <p className="text-gray-500 font-medium">Manage global strategic manufacturing partnerships</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchAlliances} className="p-3 bg-white border rounded-xl text-gray-400 hover:text-blue-600">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => toggleEditor()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <Plus size={20} /> Register New Alliance
          </button>
        </div>
      </header>

      <div className="bg-white p-4 rounded-2xl border mb-8 flex items-center gap-4 shadow-sm">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Query alliance by name or specialization..." 
          className="flex-1 py-2 bg-transparent outline-none font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-40 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={40} className="animate-spin mb-4" />
            <span className="text-xs font-black uppercase tracking-widest">Accessing Partners...</span>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <tr>
                <th className="px-8 py-5">Alliance Identity</th>
                <th className="px-8 py-5">Specialization</th>
                <th className="px-8 py-5">Geography</th>
                <th className="px-8 py-5 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(alliance => (
                <tr key={alliance.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg border bg-gray-50 flex items-center justify-center p-2">
                         <img src={alliance.logo_url} alt="" className="max-w-full h-auto grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{alliance.name}</div>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{alliance.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-gray-600">{alliance.specialization}</td>
                  <td className="px-8 py-6 text-xs font-bold text-gray-400">
                     <div className="flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> {alliance.country}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleEditor(alliance)} className="p-2 text-gray-400 hover:text-blue-600"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(alliance.id)} className="p-2 text-gray-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
               <header className="p-8 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black">{editingId ? 'Modify Strategic Alliance' : 'Register New Alliance'}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Partner Onboarding</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X /></button>
               </header>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Identity</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Sector</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                         <option value="Diagnostic">Diagnostic</option>
                         <option value="Imaging">Imaging</option>
                         <option value="Surgical">Surgical</option>
                         <option value="Infrastructure">Infrastructure</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Geography</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo URL</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none font-mono text-xs" value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Specialization</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                          className={`w-10 h-6 rounded-full relative transition-all ${formData.is_featured ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_featured ? 'left-5' : 'left-1'}`} />
                        </button>
                        <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Tier 1 Sovereign Status</span>
                     </div>
                     <Award className={formData.is_featured ? 'text-amber-500' : 'text-gray-300'} />
                  </div>
               </div>

               <footer className="p-8 border-t bg-gray-50 flex justify-end gap-4">
                  <button onClick={() => setIsEditorOpen(false)} className="px-6 py-3 font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest text-[10px]">Cancel</button>
                  <button onClick={handleSave} disabled={isSaving} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 flex items-center gap-2">
                    {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    Commit Alliance
                  </button>
               </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
