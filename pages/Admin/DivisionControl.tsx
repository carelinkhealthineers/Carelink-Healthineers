
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Save, RefreshCw, Loader2, Database, Layers } from 'lucide-react';
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
    icon_name: 'Activity'
  });

  const fetchDivisions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('divisions').select('*').order('order_index');
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
    if (!formData.name) return;
    setIsSaving(true);
    const slug = slugify(formData.name);
    try {
      if (editingId) {
        const { error } = await supabase.from('divisions').update({ ...formData, slug }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('divisions').insert([{ ...formData, slug }]);
        if (error) throw error;
      }
      await fetchDivisions();
      setIsEditorOpen(false);
    } catch (err: any) {
      alert(err.message);
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
      setFormData({ name: '', description: '', hero_gradient: 'from-blue-600 to-indigo-700', icon_name: 'Activity' });
    }
    setIsEditorOpen(true);
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Division Control</h1>
          <p className="text-gray-500 font-medium">Configure Clinical Infrastructure Hubs</p>
        </div>
        <button onClick={() => toggleEditor()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">
          <Plus size={20} /> Create Division
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">Hydrating Nodes...</span>
          </div>
        ) : (
          divisions.map(div => (
            <motion.div key={div.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm group hover:border-blue-500 transition-all">
               <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${div.hero_gradient} mb-6 flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform`}>
                  <Layers size={28} />
               </div>
               <h3 className="text-xl font-black mb-2">{div.name}</h3>
               <p className="text-gray-400 text-sm mb-8 line-clamp-2">{div.description}</p>
               <div className="flex gap-2">
                 <button onClick={() => toggleEditor(div)} className="flex-1 py-3 bg-gray-50 rounded-xl font-bold text-gray-500 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                   <Edit3 size={16} /> Edit
                 </button>
                 <button className="p-3 bg-gray-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                   <Trash2 size={18} />
                 </button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-2xl font-black mb-8">{editingId ? 'Modify Division' : 'New Division Hub'}</h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Department Name</label>
                   <input className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold mt-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Gradient Theme</label>
                   <input className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none font-mono text-xs mt-1" value={formData.hero_gradient} onChange={e => setFormData({...formData, hero_gradient: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                   <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none mt-1" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button onClick={() => setIsEditorOpen(false)} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Cancel</button>
                   <button onClick={handleSave} disabled={isSaving} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2">
                     {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} Commit Hub
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
