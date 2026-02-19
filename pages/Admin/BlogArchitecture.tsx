
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, X, Save, 
  RefreshCw, Loader2, BookOpen, FileText, 
  ImagePlus, Eye, Terminal, CheckCircle2,
  Calendar, User, Hash, Globe, Layout, Image as ImageIcon,
  ArrowUpRight, Sparkles, Sliders, ChevronRight, UploadCloud,
  Layers, Zap, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Blog } from '../../types';
import { slugify } from '../../utils/slugify';

type BlogTab = 'composition' | 'visuals' | 'seo';

export const BlogArchitecture: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<BlogTab>('composition');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Intelligence',
    author: 'Carelink Architect',
    is_published: true,
    tags: [],
    gallery: []
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch blogs:', error);
    } else {
      setBlogs(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setUploadProgress(10);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Using the 'products' bucket as per existing setup, but under a 'blog-assets' folder
    const filePath = `blog-assets/${fileName}`;

    try {
      const { data, error } = await supabase.storage.from('products').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;
      
      setUploadProgress(70);
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
      return publicUrl;
    } catch (err) {
      console.error('Upload Protocol Fault:', err);
      alert('Asset Sync Failed. Check Storage Permissions.');
      setUploadProgress(null);
      return null;
    }
  };

  const onFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await handleFileUpload(e.target.files[0]);
      if (url) setFormData(prev => ({ ...prev, featured_image: url }));
    }
  };

  const onGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls: string[] = [];
      for (const file of files) {
        const url = await handleFileUpload(file);
        if (url) urls.push(url);
      }
      setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...urls] }));
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!formData.tags?.includes(cleanTag)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), cleanTag] }));
    }
    setTagInput('');
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Registry Error: Title and Content are mandatory.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create a unique slug for new posts to avoid silent unique constraint failures
      const baseSlug = slugify(formData.title || '');
      const slug = editingId ? baseSlug : `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Strip 'id' and 'created_at' to prevent collision errors
      const { id, created_at, ...safeData } = formData as any;
      const payload = { ...safeData, slug };

      if (editingId) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        payload.published_at = payload.published_at || new Date().toISOString();
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
      }
      
      await fetchBlogs();
      setIsEditorOpen(false);
    } catch (err: any) {
      console.error('Save Error:', err);
      alert(`Failed to commit briefing: ${err.message || 'Unknown database error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditor = (blog: Blog | null = null) => {
    if (blog) {
      setEditingId(blog.id);
      setFormData({
        ...blog,
        tags: blog.tags || [],
        gallery: blog.gallery || []
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'Intelligence',
        author: 'Carelink Architect',
        is_published: true,
        tags: ['Healthcare', 'Innovation', 'FutureTech'],
        gallery: []
      });
    }
    setActiveTab('composition');
    setIsEditorOpen(true);
  };

  return (
    <div className="p-10 lg:p-16 bg-[#020408] min-h-screen text-white selection:bg-blue-600">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Node_Status: Editorial_Active</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Briefing <span className="text-slate-700 italic">Archive.</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchBlogs} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => toggleEditor()} className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-3">
             <Plus size={18} /> Initialize New Briefing
          </button>
        </div>
      </header>

      {/* Modern Search */}
      <div className="relative group mb-16">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="SEARCH INTEL REGISTRY..." 
          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-[10px] font-black text-white placeholder:text-slate-800 uppercase tracking-widest outline-none focus:border-blue-600 focus:bg-white/[0.04] transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Blog Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-[3rem] bg-white/[0.01] border border-white/5 animate-pulse" />
          ))
        ) : (
          blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((blog) => (
            <motion.div layout key={blog.id} className="bg-white/[0.01] rounded-[3rem] p-8 border border-white/5 group hover:border-blue-500/50 transition-all duration-500 shadow-2xl flex flex-col h-full relative overflow-hidden">
               <div className="aspect-video rounded-[2rem] overflow-hidden bg-black mb-8 border border-white/5 relative">
                  <img src={blog.featured_image || ''} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[7px] font-black text-white uppercase tracking-widest border border-white/10">
                    {blog.category}
                  </div>
               </div>
               
               <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${blog.is_published ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${blog.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 opacity-30'}`} />
                    {blog.is_published ? 'LIVE_STREAM' : 'INTERNAL_DRAFT'}
                  </div>
                  <span className="text-[8px] font-mono text-slate-700">{new Date(blog.published_at).toLocaleDateString()}</span>
               </div>
               
               <h3 className="text-xl font-black text-white mb-4 tracking-tight group-hover:text-blue-500 transition-colors line-clamp-2 h-14 leading-tight">{blog.title}</h3>
               
               <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[7px] font-black text-slate-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">#{tag}</span>
                  ))}
               </div>

               <div className="mt-auto flex gap-3 pt-6 border-t border-white/5">
                  <button onClick={() => toggleEditor(blog)} className="flex-1 py-4 bg-white/5 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Modify_Intel</button>
                  <button onClick={async () => { 
                    if(confirm('Purge from Archive?')) { 
                      const { error } = await supabase.from('blogs').delete().eq('id', blog.id); 
                      if (error) { alert('Deletion failed: ' + error.message); }
                      fetchBlogs(); 
                    } 
                  }} className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Editorial Commander Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-[#020408]/95 backdrop-blur-3xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 30 }} 
              className="relative w-full max-w-[1500px] h-full bg-[#05070a] rounded-[3.5rem] border border-white/10 shadow-4xl flex flex-col overflow-hidden"
            >
              <header className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.01]">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/20">
                       <BookOpen size={36} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{editingId ? 'Modify Briefing' : 'Initialize Editorial Node'}</h2>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">{formData.title || 'UNINITIALIZED'}</span>
                        <ChevronRight size={10} className="text-slate-800" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">{activeTab} TERMINAL</span>
                      </div>
                    </div>
                 </div>

                 <nav className="flex bg-white/5 p-2 rounded-full border border-white/5">
                    {[
                      { id: 'composition', label: 'Composition', icon: <FileText size={14} /> },
                      { id: 'visuals', label: 'Visual Matrix', icon: <ImageIcon size={14} /> },
                      { id: 'seo', label: 'SEO & Viral', icon: <Sparkles size={14} /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as BlogTab)}
                        className={`px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                          activeTab === tab.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                 </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <AnimatePresence mode='wait'>
                  {activeTab === 'composition' && (
                    <motion.div key="comp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Briefing Title</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-black text-xl text-white focus:border-blue-600 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Enter headline..." />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Intel Category</label>
                             <select className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-bold text-slate-300 focus:border-blue-600 transition-all cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="Intelligence">Intelligence Briefing</option>
                                <option value="Innovation">Innovation Pipeline</option>
                                <option value="Industry">Industry Report</option>
                                <option value="Clinical">Clinical Protocol</option>
                             </select>
                          </div>
                       </div>
                       
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Executive Summary (Viral Excerpt)</label>
                          <textarea rows={3} className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-medium leading-relaxed text-slate-300 focus:border-blue-600 transition-all italic" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="Catchy summary for social sharing..." />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Primary Intellectual Content</label>
                          <textarea rows={15} className="w-full px-10 py-10 bg-white/[0.01] border border-white/5 rounded-[3.5rem] outline-none font-medium leading-relaxed text-slate-400 focus:border-blue-600 transition-all text-lg custom-scrollbar" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write the main briefing content here..." />
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'visuals' && (
                    <motion.div key="vis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-6xl">
                       <div className="space-y-8">
                          <header className="flex items-end justify-between">
                             <div>
                               <h4 className="text-3xl font-black text-white tracking-tighter">Master Visual Node</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 opacity-60 italic">Featured Background & Card Identity</p>
                             </div>
                             <div className="flex gap-4 items-center">
                               {uploadProgress !== null && (
                                 <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Syncing: {uploadProgress}%</div>
                               )}
                               <button onClick={() => imageInputRef.current?.click()} className="px-10 py-5 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3">
                                  <UploadCloud size={16} /> Source Primary Image
                               </button>
                             </div>
                             <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={onFeaturedImageChange} />
                          </header>

                          <div className="w-full aspect-video rounded-[3.5rem] bg-black border border-white/5 overflow-hidden relative group">
                             {formData.featured_image ? (
                               <img src={formData.featured_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                             ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                  <ImageIcon size={100} />
                                  <span className="text-[10px] font-black uppercase tracking-[0.5em] mt-8">NO_MASTER_ASSET_DETECTED</span>
                               </div>
                             )}
                             <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">Primary_Editorial_Asset_01</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <header className="flex items-end justify-between">
                             <div>
                               <h4 className="text-3xl font-black text-white tracking-tighter">Asset Gallery</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 opacity-60 italic">Supplemental Visual Intel Matrix</p>
                             </div>
                             <button onClick={() => galleryInputRef.current?.click()} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3">
                                <Plus size={16} /> Batch Upload Assets
                             </button>
                             <input ref={galleryInputRef} type="file" className="hidden" multiple accept="image/*" onChange={onGalleryUpload} />
                          </header>

                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                             {formData.gallery?.map((url, i) => (
                               <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden relative group shadow-xl">
                                  <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                  <button onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery?.filter((_, idx) => idx !== i) }))} className="absolute top-4 right-4 p-2 bg-rose-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                               </div>
                             ))}
                             <button onClick={() => galleryInputRef.current?.click()} className="aspect-square bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-800 hover:text-blue-500 hover:border-blue-500/20 transition-all group/btn">
                                <ImagePlus size={32} className="group-hover/btn:scale-110 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-widest mt-4">Append Asset</span>
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'seo' && (
                    <motion.div key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-5xl">
                       <div className="space-y-8">
                          <header>
                            <h4 className="text-3xl font-black text-white tracking-tighter">Viral Hashtag Matrix</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic opacity-60 mt-2">Inject trending nodes to optimize discovery across the clinical neural network.</p>
                          </header>
                          
                          <div className="flex flex-wrap gap-4 p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] shadow-inner">
                             {formData.tags?.map(tag => (
                               <motion.span layout key={tag} className="flex items-center gap-3 px-5 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                  <Hash size={12} /> {tag}
                                  <button onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }))} className="ml-2 hover:scale-125 transition-transform"><X size={12} /></button>
                               </motion.span>
                             ))}
                             <div className="relative flex-1 min-w-[200px]">
                                <input 
                                  className="w-full bg-transparent border-none outline-none font-black text-[10px] text-white uppercase tracking-widest placeholder:text-slate-800 py-3" 
                                  placeholder="APPEND_NEW_TAG..." 
                                  value={tagInput}
                                  onChange={e => setTagInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && addTag()}
                                />
                             </div>
                          </div>
                          <div className="flex gap-4">
                             {['FutureMedicine', 'ClinicalAI', 'HealthTech2024', 'CarelinkSovereign'].map(sug => (
                               <button key={sug} onClick={() => !formData.tags?.includes(sug) && setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), sug] }))} className="text-[8px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-widest px-3 py-1 border border-white/5 rounded-lg transition-colors">
                                 + {sug}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-8">
                             <h4 className="text-xl font-black text-white tracking-tight flex items-center gap-3"><User size={20} className="text-blue-500" /> Lead Architect</h4>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-black text-white text-sm" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                          </div>
                          <div className="space-y-8">
                             <h4 className="text-xl font-black text-white tracking-tight flex items-center gap-3"><Calendar size={20} className="text-blue-500" /> Registry Date</h4>
                             <input type="date" className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-black text-white text-sm" value={formData.published_at?.split('T')[0]} onChange={e => setFormData({...formData, published_at: new Date(e.target.value).toISOString()})} />
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <footer className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => setFormData({...formData, is_published: !formData.is_published})}
                         className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${formData.is_published ? 'bg-emerald-500' : 'bg-slate-800'}`}
                       >
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${formData.is_published ? 'left-8' : 'left-1'}`} />
                       </button>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Broadcast_Status: {formData.is_published ? 'LIVE_PUBLIC' : 'RESTRICTED_DRAFT'}</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setIsEditorOpen(false)} className="px-10 py-5 font-black text-slate-600 hover:text-white uppercase text-[10px] tracking-widest transition-colors">Abort_Process</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-14 py-5 bg-white text-black rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-4">
                       {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                       Commit_To_Neural_Archive
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
