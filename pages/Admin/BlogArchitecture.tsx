
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, X, Save, 
  RefreshCw, Loader2, BookOpen, FileText, 
  ImagePlus, Eye, Terminal, CheckCircle2,
  Calendar, User
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Blog } from '../../types';
import { slugify } from '../../utils/slugify';

export const BlogArchitecture: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Intelligence',
    author: 'Carelink Architect',
    is_published: true
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (data) setBlogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;
    setIsSaving(true);
    const slug = slugify(formData.title || '');
    const payload = { ...formData, slug };

    try {
      if (editingId) {
        await supabase.from('blogs').update(payload).eq('id', editingId);
      } else {
        await supabase.from('blogs').insert([payload]);
      }
      await fetchBlogs();
      setIsEditorOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditor = (blog: Blog | null = null) => {
    if (blog) {
      setEditingId(blog.id);
      setFormData(blog);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'Intelligence',
        author: 'Carelink Architect',
        is_published: true
      });
    }
    setIsEditorOpen(true);
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-blue-500 flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <BookOpen size={32} />
           </div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Editorial Registry</h1>
             <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Intel Control // Publishing Node</p>
           </div>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchBlogs} className="p-4 bg-white border rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => toggleEditor()} className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 transition-all">
            <Plus size={24} /> New Intel Briefing
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-[3rem] border mb-12 flex items-center gap-6 shadow-sm">
        <Search className="text-slate-300 ml-4" size={24} />
        <input 
          type="text" 
          placeholder="Query Briefing Archives..." 
          className="flex-1 py-4 bg-transparent outline-none font-bold text-slate-900"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(blog => (
          <motion.div layout key={blog.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
             <div className="aspect-video rounded-[2rem] overflow-hidden bg-slate-100 mb-8 border relative">
                <img src={blog.featured_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[8px] font-black text-blue-600 uppercase tracking-widest">
                      {blog.category}
                   </span>
                </div>
             </div>
             <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${blog.is_published ? 'text-emerald-500' : 'text-amber-500'}`}>
                   <CheckCircle2 size={12} /> {blog.is_published ? 'Published' : 'Internal'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">{new Date(blog.published_at).toLocaleDateString()}</div>
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{blog.title}</h3>
             <div className="flex gap-3">
                <button onClick={() => toggleEditor(blog)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Modify Intel</button>
                <button onClick={async () => { if(confirm('Purge?')) { await supabase.from('blogs').delete().eq('id', blog.id); fetchBlogs(); } }} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={20} /></button>
             </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[4rem] shadow-4xl flex flex-col overflow-hidden">
               <header className="p-10 border-b flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-blue-500 flex items-center justify-center shadow-xl">
                       <FileText size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">Compose Briefing</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sovereign Editorial System</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditorOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all"><X /></button>
               </header>

               <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Intel Title</label>
                        <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-black text-lg text-slate-900" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Category Marker</label>
                        <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-blue-600" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Visual Source (URL)</label>
                     <div className="flex gap-4">
                        <input className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none font-mono text-xs" value={formData.featured_image} onChange={e => setFormData({...formData, featured_image: e.target.value})} />
                        <button className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest"><ImagePlus size={18} /></button>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Editorial Excerpt (Abstract)</label>
                     <textarea rows={2} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-medium italic text-slate-500" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Content Dossier</label>
                     <textarea rows={12} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-medium leading-relaxed" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                  </div>
               </div>

               <footer className="p-10 border-t bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <button 
                       onClick={() => setFormData({...formData, is_published: !formData.is_published})}
                       className={`w-12 h-6 rounded-full relative transition-all ${formData.is_published ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? 'left-7' : 'left-1'}`} />
                     </button>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Publish Node: {formData.is_published ? 'LIVE_PUBLIC' : 'INTERNAL_DRAFT'}</span>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setIsEditorOpen(false)} className="px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Abort</button>
                     <button onClick={handleSave} disabled={isSaving} className="px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        Commit Intel
                     </button>
                  </div>
               </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
