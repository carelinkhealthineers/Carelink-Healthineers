
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

      if (error) {
        console.error(`Supabase Storage Error [${bucket}]:`, error);
        alert(`Storage Error: ${error.message}\n\nFIX: Ensure the bucket '${bucket}' exists in Supabase Storage and has a policy for public uploads.`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (err: any) {
      console.error('Critical Asset Upload Fault:', err);
      alert(`Asset Deployment Failed: ${err.message || 'Unknown network error'}`);
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
      const files = Array.from(e.target.files);
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
    input.onchange = async (e: any) => {
      if (e.target.files && e.target.files[0]) {
        const url = await handleFileUpload(e.target.files[0], 'products');
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
      setFormData({ ...product, image_gallery: product.image_gallery || [] });
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
    if (!formData.name || !formData.model_number) return alert('Registry Fault: Identity Missing (Name/Model)');
    if (!formData.division_id) return alert('Registry Fault: No Clinical Division assigned.');

    setIsSaving(true);
    const slug = `${slugify(formData.name)}-${slugify(formData.model_number)}`;
    
    try {
      const payload: any = {
        name: formData.name,
        model_number: formData.model_number,
        division_id: formData.division_id,
        category_tag: formData.category_tag,
        short_description: formData.short_description,
        long_description: formData.long_description,
        main_image: formData.main_image,
        image_gallery: formData.image_gallery || [],
        technical_specs: formData.technical_specs || {},
        is_published: formData.is_published,
        brochure_url: formData.brochure_url || '',
        slug: slug
      };

      let productId = editingId;
      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select();
        if (error) {
          if (error.message.includes('column')) {
            const col = error.message.split("'")[1] || 'brochure_url';
            alert(`SCHEMA MISMATCH: Column '${col}' is missing.\n\nRun this in Supabase SQL Editor:\nALTER TABLE products ADD COLUMN ${col} TEXT;\nNOTIFY pgrst, 'reload schema';`);
          }
          throw error;
        }
        productId = data?.[0].id;
      }

      if (productId) {
        await supabase.from('product_parts').delete().eq('product_id', productId);
        if (parts.length > 0) {
          const { error: partError } = await supabase.from('product_parts').insert(parts.map((p, i) => ({
            product_id: productId,
            name: p.name,
            description: p.description,
            image_url: p.image_url,
            order_index: i
          })));
          if (partError) throw partError;
        }
      }
      
      await fetchData();
      setIsEditorOpen(false);
      alert('Asset Successfully Committed to Nexus Registry.');
    } catch (err: any) {
      console.error('Persistence Failure:', err);
      if (!err.message.includes('column')) {
         alert(`Nexus Commit Error: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-blue-500 flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Terminal size={32} />
           </div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Registry</h1>
             <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Node Control // Archive v7.0</p>
           </div>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-white border rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => toggleEditor()} className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 transition-all group">
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            Initialize Asset
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-[3rem] border mb-12 flex items-center gap-6 shadow-sm">
        <Search className="text-slate-300 ml-4" size={24} />
        <input 
          type="text" 
          placeholder="Query Global Asset Registry..." 
          className="flex-1 py-4 bg-transparent outline-none font-bold text-slate-900 placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {isLoading ? (
          <div className="col-span-full py-60 flex flex-col items-center justify-center text-slate-300">
             <Loader2 size={64} className="animate-spin mb-8" />
             <span className="text-xs font-black uppercase tracking-[0.8em]">Synchronizing Neural Database...</span>
          </div>
        ) : (
          products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
            <motion.div layout key={item.id} className="bg-white rounded-[4rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
               <div className="h-72 rounded-[3rem] overflow-hidden bg-slate-50 mb-8 border relative">
                  <img src={item.main_image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {item.model_number}
                  </div>
               </div>
               <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                    {divisions.find(d => d.id === item.division_id)?.name || 'Unassigned'}
                  </span>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.is_published ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {item.is_published ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {item.is_published ? 'Live' : 'Draft'}
                  </div>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{item.name}</h3>
               <p className="text-slate-400 text-sm font-medium mb-10 line-clamp-2 h-10">{item.short_description}</p>
               <div className="flex gap-4">
                  <button onClick={() => toggleEditor(item)} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Modify Dossier</button>
                  <button onClick={async () => { if(confirm('Purge asset?')) { await supabase.from('products').delete().eq('id', item.id); fetchData(); } }} className="p-5 bg-rose-50 text-rose-600 rounded-3xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={24} /></button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 50 }} 
              className="relative w-full max-w-[1500px] h-[90vh] bg-white rounded-[4rem] shadow-4xl flex flex-col overflow-hidden"
            >
              <header className="p-10 border-b flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50/50">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-blue-500 flex items-center justify-center shadow-2xl">
                       {activeTab === 'metadata' && <Layout size={36} />}
                       {activeTab === 'blueprints' && <Cpu size={36} />}
                       {activeTab === 'visuals' && <ImageIcon size={36} />}
                       {activeTab === 'architecture' && <Layers size={36} />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{editingId ? 'Refining Clinical Asset' : 'Engineering New Asset'}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{formData.name || 'UNNAMED_ID'}</span>
                        <ChevronRight size={12} className="text-slate-300" />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{activeTab} Interface</span>
                      </div>
                    </div>
                 </div>

                 <nav className="flex bg-white p-2 rounded-[2.5rem] border shadow-inner">
                    {[
                      { id: 'metadata', icon: <Layout size={16} />, label: 'Identity' },
                      { id: 'blueprints', icon: <Cpu size={16} />, label: 'Technical' },
                      { id: 'visuals', icon: <ImagePlus size={16} />, label: 'Visual Hub' },
                      { id: 'architecture', icon: <Layers size={16} />, label: 'Structure' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as EditorTab)}
                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                          activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                 </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <AnimatePresence mode='wait'>
                  {activeTab === 'metadata' && (
                    <motion.div key="meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl mx-auto">
                       <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Designation</label>
                             <input className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-black text-xl text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Registry Registry Model</label>
                             <input className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-mono text-blue-600 font-bold" value={formData.model_number} onChange={e => setFormData({...formData, model_number: e.target.value})} />
                          </div>
                       </div>
                       
                       <div className="p-10 bg-blue-50/50 rounded-[3rem] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                             <FileText size={160} />
                          </div>
                          <div className="flex items-center gap-8 relative z-10">
                             <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                <FileText size={32} />
                             </div>
                             <div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Technical Dossier</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${formData.brochure_url ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                      {formData.brochure_url ? 'Archive Synced' : 'Registry Empty'}
                                   </span>
                                </div>
                             </div>
                          </div>
                          <div className="flex-1 max-w-xl w-full relative z-10">
                             <div className="flex items-center gap-4 bg-white p-3 rounded-[1.5rem] border shadow-sm">
                               <input 
                                 type="text" 
                                 className="flex-1 px-4 py-3 bg-transparent outline-none text-[11px] font-mono text-blue-600 overflow-hidden text-ellipsis" 
                                 placeholder="Dossier URL Link..." 
                                 value={formData.brochure_url || ''} 
                                 onChange={e => setFormData({...formData, brochure_url: e.target.value})}
                               />
                               <div className="flex items-center gap-2">
                                 {formData.brochure_url && (
                                   <>
                                     <a href={formData.brochure_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all" title="View Current">
                                        <Eye size={18} />
                                     </a>
                                     <button onClick={() => setFormData({...formData, brochure_url: ''})} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Purge Record">
                                        <FileX size={18} />
                                     </button>
                                   </>
                                 )}
                                 <button onClick={() => docRef.current?.click()} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 px-6">
                                    <UploadCloud size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                                 </button>
                               </div>
                             </div>
                             <input ref={docRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onDocUpload} />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Departmental Mapping</label>
                             <select className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold cursor-pointer" value={formData.division_id} onChange={e => setFormData({...formData, division_id: e.target.value})}>
                                <option value="">-- Select Division --</option>
                                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                             </select>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Tagging</label>
                             <input className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold" value={formData.category_tag} onChange={e => setFormData({...formData, category_tag: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Technical Summary</label>
                          <textarea rows={4} className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-medium leading-relaxed" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} />
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'blueprints' && (
                    <motion.div key="tech" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto">
                       <header className="flex items-center justify-between">
                          <h4 className="text-2xl font-black text-slate-900">Performance Metrics</h4>
                          <button onClick={() => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, 'NEW_METRIC': 'OPTIMAL' } }))} className="px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                             Deploy Metric
                          </button>
                       </header>
                       <div className="grid grid-cols-2 gap-6">
                          {Object.entries(formData.technical_specs || {}).map(([key, val], idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-[2rem] group border border-slate-100">
                               <input className="flex-1 bg-white px-4 py-2.5 rounded-xl outline-none font-black text-xs uppercase" value={key} onChange={e => {
                                 const newSpecs = { ...formData.technical_specs };
                                 const newKey = e.target.value;
                                 const valValue = newSpecs[key];
                                 delete newSpecs[key];
                                 newSpecs[newKey] = valValue;
                                 setFormData({...formData, technical_specs: newSpecs});
                               }} />
                               <input className="flex-1 bg-white px-4 py-2.5 rounded-xl outline-none font-bold text-xs text-blue-600" value={val} onChange={e => setFormData({...formData, technical_specs: { ...formData.technical_specs, [key]: e.target.value }})} />
                               <button onClick={() => {
                                 const newSpecs = { ...formData.technical_specs };
                                 delete newSpecs[key];
                                 setFormData({...formData, technical_specs: newSpecs});
                               }} className="text-slate-300 hover:text-rose-500"><X size={20} /></button>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'visuals' && (
                    <motion.div key="vis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-6xl mx-auto">
                       <div className="space-y-8">
                          <header className="flex items-end justify-between">
                             <div>
                               <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Sovereign Asset Profile</h4>
                               <p className="text-sm text-slate-400 font-medium">Primary visual identification for the clinical registry.</p>
                             </div>
                             <button onClick={() => mainImageRef.current?.click()} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-600 transition-all">
                                <FileUp size={24} /> Direct Source Upload
                             </button>
                             <input ref={mainImageRef} type="file" className="hidden" accept="image/*" onChange={onMainImageUpload} />
                          </header>

                          <div className="w-full aspect-video rounded-[4rem] bg-slate-50 border-4 border-dashed border-slate-200 overflow-hidden relative group">
                             {formData.main_image ? (
                               <img src={formData.main_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                             ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                                  <ImageIcon size={120} />
                                  <span className="text-xl font-black uppercase tracking-[0.4em] mt-4">No Asset Defined</span>
                               </div>
                             )}
                             <div className="absolute top-10 left-10 p-4 px-6 bg-white/90 backdrop-blur-md rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">
                                MASTER_VISUAL_01
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <header className="flex items-end justify-between">
                             <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Supplemental Gallery Hub</h4>
                             <button onClick={() => galleryRef.current?.click()} className="px-8 py-4 bg-blue-50 text-blue-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all">
                                <ImagePlus size={20} /> Batch Asset Sourcing
                             </button>
                             <input ref={galleryRef} type="file" className="hidden" multiple accept="image/*" onChange={onGalleryUpload} />
                          </header>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                             {formData.image_gallery?.map((url, i) => (
                               <motion.div key={i} layout className="aspect-square rounded-[3rem] bg-slate-50 border relative group overflow-hidden shadow-sm hover:shadow-2xl transition-all">
                                  <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                     <button onClick={() => setFormData(prev => ({ ...prev, image_gallery: prev.image_gallery?.filter((_, idx) => idx !== i) }))} className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-rose-600">
                                        <Trash2 size={24} />
                                     </button>
                                  </div>
                               </motion.div>
                             ))}
                             {(formData.image_gallery?.length || 0) === 0 && (
                               <div className="col-span-full py-32 text-center border-4 border-dashed rounded-[4rem] bg-slate-50/50">
                                  <ImageIcon size={64} className="mx-auto text-slate-200 mb-6" />
                                  <p className="text-slate-300 font-black uppercase tracking-widest">Supplemental Hub Empty</p>
                               </div>
                             )}
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'architecture' && (
                    <motion.div key="arch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto">
                       <header className="flex items-center justify-between">
                          <div>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Component Hierarchy</h4>
                            <p className="text-sm text-slate-400 font-medium">Map individual hardware sub-systems for high-detail visualization.</p>
                          </div>
                          <button onClick={() => setParts(prev => [...prev, { name: 'New Module', description: 'Enter narrative...', image_url: '' }])} className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                             <PlusCircle size={20} /> Deploy Module
                          </button>
                       </header>

                       <div className="grid grid-cols-1 gap-12">
                          {parts.map((part, i) => (
                            <motion.div layout key={i} className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-12 group">
                               <div className="w-full lg:w-[450px] h-[450px] rounded-[3rem] bg-slate-50 border relative shrink-0 overflow-hidden">
                                  {part.image_url ? (
                                    <img src={part.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                       <Box size={100} />
                                       <span className="font-black mt-4">NULL_PART_DATA</span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button onClick={() => onPartImageUpload(i)} className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all">
                                        Source Local File
                                     </button>
                                  </div>
                               </div>
                               <div className="flex-1 space-y-6">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">SYSTEM_MODULE_0{i+1}</span>
                                     <button onClick={() => setParts(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500"><Trash size={24} /></button>
                                  </div>
                                  <input className="w-full bg-slate-50 px-8 py-5 rounded-3xl outline-none font-black text-slate-900 text-2xl" value={part.name} onChange={e => {
                                    const newParts = [...parts];
                                    newParts[i].name = e.target.value;
                                    setParts(newParts);
                                  }} />
                                  <textarea rows={5} className="w-full bg-slate-50 px-8 py-5 rounded-3xl outline-none font-medium text-slate-500 leading-relaxed text-lg" value={part.description} onChange={e => {
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

              <footer className="p-10 border-t bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => setFormData({...formData, is_published: !formData.is_published})}
                         className={`w-14 h-7 rounded-full relative transition-all ${formData.is_published ? 'bg-emerald-500' : 'bg-slate-300'}`}
                       >
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.is_published ? 'left-8' : 'left-1'}`} />
                       </button>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Registry Hub: {formData.is_published ? 'LIVE_PUBLIC' : 'INTERNAL_DRAFT'}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">NODE_ID: {(formData.slug || 'PENDING').substring(0, 24)}</div>
                 </div>
                 <div className="flex gap-6">
                    <button onClick={() => setIsEditorOpen(false)} className="px-10 py-4 font-black text-slate-400 hover:text-slate-900 uppercase text-[11px] tracking-widest">Abort Process</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-3xl hover:bg-blue-600 transition-all flex items-center gap-4">
                       {isSaving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} />}
                       Commit To Nexus
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
