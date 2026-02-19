
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, X, Save, 
  Layers, Database, RefreshCw, Loader2, Cpu, 
  Box, Terminal, Layout, FileUp, ImagePlus, 
  CheckCircle2, AlertCircle, ChevronRight, 
  UploadCloud, ImageIcon, Maximize2, Trash,
  PlusCircle, FileText, Download, Link2, Eye, FileX
} from 'lucide-react';
import { slugify } from '../../utils/slugify';
import { supabase } from '../../supabaseClient';
import { Division, Product, ProductPart } from '../../types';

type EditorTab = 'metadata' | 'blueprints' | 'visuals' | 'architecture';

export const ProductArchitecture: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('metadata');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    model_number: '',
    division_id: '',
    category_tag: '',
    short_description: '',
    long_description: '',
    main_image: '',
    image_gallery: [],
    technical_specs: {},
    is_published: true,
    brochure_url: '',
  });

  const [parts, setParts] = useState<ProductPart[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('divisions').select('*').order('order_index')
      ]);
      if (pRes.data) setProducts(pRes.data);
      if (dRes.data) setDivisions(dRes.data);
    } catch (err) {
      console.error('Registry Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (file: File, bucket: string = 'products'): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (err: any) {
      console.error('Critical Asset Upload Fault:', err);
      return null;
    }
  };

  const onMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await handleFileUpload(e.target.files[0], 'products');
      if (url) setFormData(prev => ({ ...prev, main_image: url }));
    }
  };

  const onDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await handleFileUpload(e.target.files[0], 'documents');
      if (url) setFormData(prev => ({ ...prev, brochure_url: url }));
    }
  };

  const onGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls: string[] = [];
      for (const file of files) {
        const url = await handleFileUpload(file, 'products');
        if (url) urls.push(url);
      }
      setFormData(prev => ({ 
        ...prev, 
        image_gallery: [...(prev.image_gallery || []), ...urls] 
      }));
    }
  };

  const onPartImageUpload = async (idx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0] as File;
        const url = await handleFileUpload(file, 'products');
        if (url) {
          const newParts = [...parts];
          newParts[idx].image_url = url;
          setParts(newParts);
        }
      }
    };
    input.click();
  };

  const toggleEditor = async (product: Product | null = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ 
        ...product, 
        image_gallery: product.image_gallery || [],
        technical_specs: product.technical_specs || {}
      });
      const { data } = await supabase.from('product_parts').select('*').eq('product_id', product.id).order('order_index');
      setParts(data || []);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        model_number: '',
        division_id: divisions[0]?.id || '',
        category_tag: 'High-Performance',
        short_description: '',
        long_description: '',
        main_image: '',
        image_gallery: [],
        technical_specs: { 'Resolution': '4K Cinematic', 'Precision': 'Ultra' },
        is_published: true,
        brochure_url: '',
      });
      setParts([]);
    }
    setActiveTab('metadata');
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.model_number) return alert('Registry Fault: Identity Missing');
    setIsSaving(true);
    const slug = `${slugify(formData.name)}-${slugify(formData.model_number)}`;
    
    try {
      const payload: any = { ...formData, slug };
      let productId = editingId;
      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId);
      } else {
        const { data } = await supabase.from('products').insert([payload]).select();
        productId = data?.[0].id;
      }
      if (productId) {
        await supabase.from('product_parts').delete().eq('product_id', productId);
        if (parts.length > 0) {
          await supabase.from('product_parts').insert(parts.map((p, i) => ({
            product_id: productId,
            name: p.name,
            description: p.description,
            image_url: p.image_url,
            order_index: i
          })));
        }
      }
      await fetchData();
      setIsEditorOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 lg:p-16 bg-[#020408] min-h-screen text-white">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Node_Control: Asset_Master</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Product <span className="text-slate-700 italic">Architecture.</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => toggleEditor()} className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
            <Plus size={18} /> Deploy New Asset
          </button>
        </div>
      </header>

      {/* Modern Search Node */}
      <div className="relative group mb-16">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="QUERY REGISTRY..." 
          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-[10px] font-black text-white placeholder:text-slate-800 uppercase tracking-widest outline-none focus:border-blue-600 focus:bg-white/[0.04] transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Asset Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
        {isLoading ? (
          <div className="col-span-full py-60 flex flex-col items-center justify-center opacity-30">
             <Loader2 size={64} className="animate-spin mb-8 text-blue-500" />
             <span className="text-[9px] font-black uppercase tracking-[0.8em]">Syncing Neural Database...</span>
          </div>
        ) : (
          products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
            <motion.div layout key={item.id} className="bg-white/[0.01] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden group hover:border-blue-500/50 hover:bg-white/[0.02] transition-all duration-500 shadow-2xl flex flex-col h-full">
               <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-black mb-8 border border-white/5 relative">
                  <img src={item.main_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                  <div className="absolute top-5 right-5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[7px] font-black text-white uppercase tracking-widest border border-white/10">
                    {item.model_number}
                  </div>
               </div>
               <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                    {divisions.find(d => d.id === item.division_id)?.name || 'UNMAPPED'}
                  </span>
                  <div className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${item.is_published ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 opacity-30'}`} />
                    {item.is_published ? 'LIVE' : 'DRAFT'}
                  </div>
               </div>
               <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1">{item.name}</h3>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight leading-relaxed line-clamp-2 h-10 italic mb-8 opacity-60">{item.short_description}</p>
               
               <div className="mt-auto flex gap-3">
                  <button onClick={() => toggleEditor(item)} className="flex-1 py-4 bg-white/5 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Modify</button>
                  <button onClick={async () => { if(confirm('Purge?')) { await supabase.from('products').delete().eq('id', item.id); fetchData(); } }} className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Command Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-[#020408]/90 backdrop-blur-3xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 30 }} 
              className="relative w-full max-w-[1400px] h-full bg-[#05070a] rounded-[3rem] border border-white/10 shadow-4xl flex flex-col overflow-hidden"
            >
              <header className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.01]">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/20">
                       <Terminal size={36} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{editingId ? 'Modify System Node' : 'Initialize Infrastructure'}</h2>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">{formData.name || 'UNINITIALIZED'}</span>
                        <ChevronRight size={10} className="text-slate-800" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">{activeTab} Terminal</span>
                      </div>
                    </div>
                 </div>

                 <nav className="flex bg-white/5 p-1.5 rounded-full border border-white/5">
                    {[
                      { id: 'metadata', label: 'Identity' },
                      { id: 'blueprints', label: 'Metrics' },
                      { id: 'visuals', label: 'Visuals' },
                      { id: 'architecture', label: 'Structure' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as EditorTab)}
                        className={`px-8 py-3.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                          activeTab === tab.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                 </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <AnimatePresence mode='wait'>
                  {activeTab === 'metadata' && (
                    <motion.div key="meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-4xl">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Asset Identity</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-black text-xl text-white focus:border-blue-600 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Registry Model</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-mono text-blue-500 font-bold focus:border-blue-600 transition-all" value={formData.model_number} onChange={e => setFormData({...formData, model_number: e.target.value})} />
                          </div>
                       </div>
                       
                       <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-10">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                <FileText size={28} />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-white tracking-tight leading-none">Technical Dossier</h4>
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2 block">Archive_Sync Status: {formData.brochure_url ? 'LINKED' : 'NULL'}</span>
                             </div>
                          </div>
                          <div className="flex-1 max-w-lg w-full">
                             <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                               <input 
                                 type="text" 
                                 className="flex-1 px-4 py-3 bg-transparent outline-none text-[9px] font-mono text-blue-400 placeholder:text-slate-800" 
                                 placeholder="MASTER_URL_SOURCE..." 
                                 value={formData.brochure_url || ''} 
                                 onChange={e => setFormData({...formData, brochure_url: e.target.value})}
                               />
                               <button onClick={() => docRef.current?.click()} className="px-6 py-3 bg-white text-black rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                  Sync Source
                               </button>
                             </div>
                             <input ref={docRef} type="file" className="hidden" onChange={onDocUpload} />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Clinical Department</label>
                             <select className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-bold text-slate-300 cursor-pointer focus:border-blue-600 transition-all" value={formData.division_id} onChange={e => setFormData({...formData, division_id: e.target.value})}>
                                <option value="">Select Division Node...</option>
                                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Protocol Tag</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-bold text-white focus:border-blue-600 transition-all" value={formData.category_tag} onChange={e => setFormData({...formData, category_tag: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] px-1">Technical Summary</label>
                          <textarea rows={4} className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none font-medium leading-relaxed text-slate-300 focus:border-blue-600 transition-all italic" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} />
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'blueprints' && (
                    <motion.div key="tech" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-4xl">
                       <header className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black text-white tracking-tighter">Performance Coefficients</h4>
                          <button onClick={() => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, 'NEW_METRIC': 'NOMINAL' } }))} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                             Add Node
                          </button>
                       </header>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(formData.technical_specs || {}).map(([key, val], idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 group">
                               <input className="flex-1 bg-black/40 px-4 py-3 rounded-xl outline-none font-black text-[9px] uppercase tracking-widest text-slate-500" value={key} onChange={e => {
                                 const newSpecs = { ...formData.technical_specs };
                                 const newKey = e.target.value;
                                 const oldVal = newSpecs[key];
                                 delete newSpecs[key];
                                 newSpecs[newKey] = oldVal;
                                 setFormData({...formData, technical_specs: newSpecs});
                               }} />
                               <input className="flex-1 bg-black/40 px-4 py-3 rounded-xl outline-none font-bold text-[10px] text-blue-500" value={val} onChange={e => setFormData({...formData, technical_specs: { ...formData.technical_specs, [key]: e.target.value }})} />
                               <button onClick={() => {
                                 const newSpecs = { ...formData.technical_specs };
                                 delete newSpecs[key];
                                 setFormData({...formData, technical_specs: newSpecs});
                               }} className="p-3 text-slate-800 hover:text-rose-500 transition-colors"><X size={16} /></button>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'visuals' && (
                    <motion.div key="vis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-5xl">
                       <div className="space-y-8">
                          <header className="flex items-end justify-between">
                             <div>
                               <h4 className="text-3xl font-black text-white tracking-tighter">Master Visual Node</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 opacity-60 italic">Primary Asset Identification</p>
                             </div>
                             <button onClick={() => mainImageRef.current?.click()} className="px-10 py-5 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all">
                                Source Image
                             </button>
                             <input ref={mainImageRef} type="file" className="hidden" onChange={onMainImageUpload} />
                          </header>

                          <div className="w-full aspect-video rounded-[3rem] bg-black border border-white/5 overflow-hidden relative group">
                             {formData.main_image ? (
                               <img src={formData.main_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                             ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                  <ImageIcon size={100} />
                               </div>
                             )}
                             <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">Primary_Registry_Asset</span>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'architecture' && (
                    <motion.div key="arch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl">
                       <header className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black text-white tracking-tighter">Sub-System Decomposition</h4>
                          <button onClick={() => setParts(prev => [...prev, { name: 'Module Name', description: 'Technical description...', image_url: '' }])} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                             Initialize Sub-Node
                          </button>
                       </header>

                       <div className="grid grid-cols-1 gap-8">
                          {parts.map((part, i) => (
                            <motion.div layout key={i} className="bg-white/[0.01] rounded-[2.5rem] p-8 border border-white/5 flex flex-col md:flex-row gap-10 group relative">
                               <div className="w-full md:w-[350px] aspect-square rounded-[2rem] bg-black border border-white/5 relative shrink-0 overflow-hidden">
                                  {part.image_url ? (
                                    <img src={part.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-5">
                                       <Box size={80} />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button onClick={() => onPartImageUpload(i)} className="px-6 py-3 bg-white text-black rounded-xl text-[8px] font-black uppercase tracking-widest shadow-2xl">
                                        Source Local
                                     </button>
                                  </div>
                               </div>
                               <div className="flex-1 space-y-6">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.4em]">Sub_Sys_Node_0{i+1}</span>
                                     <button onClick={() => setParts(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-800 hover:text-rose-500 transition-colors"><Trash size={20} /></button>
                                  </div>
                                  <input className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl outline-none font-black text-white text-xl focus:border-blue-600 transition-all" value={part.name} onChange={e => {
                                    const newParts = [...parts];
                                    newParts[i].name = e.target.value;
                                    setParts(newParts);
                                  }} />
                                  <textarea rows={4} className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl outline-none font-medium text-slate-500 leading-relaxed text-sm italic focus:border-blue-600 transition-all" value={part.description} onChange={e => {
                                    const newParts = [...parts];
                                    newParts[i].description = e.target.value;
                                    setParts(newParts);
                                  }} />
                               </div>
                            </motion.div>
                          ))}
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
                         className={`w-12 h-6 rounded-full relative transition-all ${formData.is_published ? 'bg-emerald-500' : 'bg-slate-800'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? 'left-7' : 'left-1'}`} />
                       </button>
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Registry_Broadcast: {formData.is_published ? 'LIVE_PUBLIC' : 'DRAFT_MODE'}</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setIsEditorOpen(false)} className="px-8 py-4 font-black text-slate-600 hover:text-white uppercase text-[9px] tracking-widest transition-colors">Abort_Process</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-12 py-5 bg-white text-black rounded-3xl font-black shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-4">
                       {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                       Commit_To_Registry
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
