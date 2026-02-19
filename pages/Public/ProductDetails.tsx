
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail, Download, ChevronLeft, Loader2, 
  Cpu, Box, Activity, Layers, ArrowUpRight,
  ShieldCheck, Share2, Printer, Microscope,
  Database, Info, Terminal, CheckCircle2, ArrowRight,
  Maximize2, Zap, Eye, Globe, Fingerprint, X
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Product, ProductPart } from '../../types';

export const ProductDetails: React.FC = () => {
  const { productSlug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [parts, setParts] = useState<ProductPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'specs' | 'docs'>('architecture');

  useEffect(() => {
    const fetchFullSpecification = async () => {
      setLoading(true);
      try {
        const { data: productData, error: pError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', productSlug)
          .single();
        
        if (pError || !productData) throw pError;
        setProduct(productData);
        setActiveImage(productData.main_image);

        const { data: partsData, error: partsError } = await supabase
          .from('product_parts')
          .select('*')
          .eq('product_id', productData.id)
          .order('order_index');
        
        if (!partsError) setParts(partsData || []);
        
      } catch (err) {
        console.error('Asset Retrieval Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullSpecification();
  }, [productSlug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={24} className="animate-spin text-blue-500/50" />
        <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-slate-600">Syncing_Dossier</span>
      </div>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center min-h-screen bg-[#020408]">
      <h1 className="text-sm font-black text-white mb-4 tracking-[0.5em] uppercase">Null_Registry_Node</h1>
      <Link to="/portfolio" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-white transition-colors">Return_to_Archive</Link>
    </div>
  );

  const gallery = [product.main_image, ...(product.image_gallery || [])].filter(Boolean);

  return (
    <div className="pt-24 pb-48 bg-[#020408] text-slate-400 selection:bg-blue-600 selection:text-white font-sans">
      <SEO title={product.name} description={product.short_description} image={product.main_image} />
      
      <div className="max-w-[1600px] mx-auto px-8 md:px-12">
        {/* Compact Navigation */}
        <header className="flex items-center justify-between mb-16 opacity-60 hover:opacity-100 transition-opacity">
           <Link to="/portfolio" className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] transition-all group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Archive / {product.category_tag}
           </Link>
           <div className="flex items-center gap-6 text-[9px] font-mono tracking-tighter">
              <span className="text-slate-700">KERNEL_4.2.0</span>
              <span className="text-emerald-500/50 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                STABLE_LINK
              </span>
           </div>
        </header>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           
           {/* Visualizer (Left 7) */}
           <div className="lg:col-span-7 space-y-6">
              <div className="relative group">
                <motion.div layoutId={`product-${product.id}`} className="aspect-[16/9] bg-[#050505] rounded-3xl border border-white/5 overflow-hidden relative shadow-2xl">
                  <AnimatePresence mode='wait'>
                      <motion.img 
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={activeImage || product.main_image} 
                        className="w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                  </AnimatePresence>
                  
                  {/* Subtle Smart Tag */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-lg">
                      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/60">Node_Asset_01</span>
                  </div>
                </motion.div>
                
                {/* Thumbnails */}
                {gallery.length > 1 && (
                  <div className="flex gap-2 mt-4">
                    {gallery.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(url)}
                          className={`w-12 h-12 rounded-lg border transition-all overflow-hidden ${activeImage === url ? 'border-blue-500 opacity-100 shadow-lg scale-105' : 'border-white/5 opacity-30 hover:opacity-100'}`}
                        >
                          <img src={url} className="w-full h-full object-cover" />
                        </button>
                    ))}
                  </div>
                )}
              </div>
           </div>

           {/* Identity & Commands (Right 5) */}
           <div className="lg:col-span-5 space-y-10">
              <div className="space-y-6">
                 <div>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.4em] mb-4 block">Deployment_Protocol</span>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4 leading-tight">{product.name}</h1>
                    <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-lg italic">
                       {product.short_description}
                    </p>
                 </div>

                 {/* High-Density Stats Grid */}
                 <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    {[
                      { label: "Ref_ID", val: product.model_number },
                      { label: "Category", val: product.category_tag },
                      { label: "Warranty", val: "Platinum_24mo" },
                      { label: "ISO_Grade", val: "ISO_13485" }
                    ].map((stat, i) => (
                       <div key={i} className="bg-[#020408] p-5 hover:bg-white/[0.02] transition-colors">
                          <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1">{stat.label}</div>
                          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{stat.val}</div>
                       </div>
                    ))}
                 </div>

                 {/* Refined Instrumental Buttons */}
                 <div className="flex gap-3 pt-4">
                    <Link to="/acquisition" className="flex-1 py-4 bg-white text-black rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all text-center flex items-center justify-center gap-2">
                       <Zap size={14} /> Initiate_Acquisition
                    </Link>
                    <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-blue-600 transition-all flex items-center justify-center">
                       <Download size={14} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Large Image Showcase Section (Architecture) */}
        <div className="mt-40 border-t border-white/5 pt-20">
           <nav className="flex gap-10 mb-20 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
              {[
                { id: 'architecture', label: 'Unit_Decomposition' },
                { id: 'specs', label: 'Technical_Metrics' },
                { id: 'docs', label: 'Compliance_Vault' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-[9px] font-bold uppercase tracking-[0.4em] transition-all relative pb-6 whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-slate-700 hover:text-slate-400'}`}
                >
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="tabUnderline" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-500" />}
                </button>
              ))}
           </nav>

           <div className="min-h-[500px]">
              <AnimatePresence mode='wait'>
                {activeTab === 'architecture' && (
                  <motion.div 
                    key="arch" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-40"
                  >
                    {parts && parts.length > 0 ? (
                      parts.map((part, i) => (
                        <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center group`}>
                           {/* MASSIVE IMAGE SHOWCASE */}
                           <div className="w-full lg:w-3/5 aspect-video bg-[#050505] rounded-[2rem] overflow-hidden border border-white/5 relative shadow-3xl">
                              <img src={part.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100 grayscale group-hover:grayscale-0" />
                              <div className="absolute top-6 left-6 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg">
                                 <span className="text-[8px] font-mono text-blue-500 tracking-tighter">SUB_SYS_NODE_0{i+1}</span>
                              </div>
                           </div>

                           {/* COMPACT SMART TEXT */}
                           <div className="w-full lg:w-2/5 space-y-6">
                              <div className="flex items-center gap-3 opacity-30">
                                 <div className="w-6 h-px bg-blue-500" />
                                 <span className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">Core_Architecture</span>
                              </div>
                              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{part.name}</h3>
                              <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-sm italic">
                                 {part.description}
                              </p>
                              <div className="pt-6 grid grid-cols-2 gap-8 border-t border-white/5">
                                 <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Efficiency</span>
                                    <span className="text-[10px] font-bold text-blue-400 block tracking-tight">NOMINAL_99.8%</span>
                                 </div>
                                 <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Interface</span>
                                    <span className="text-[10px] font-bold text-slate-300 block tracking-tight uppercase">Sovereign_OS</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-40 text-center opacity-20">
                         <span className="text-[9px] font-bold uppercase tracking-[1em]">Registry_Structure_Unmapped</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'specs' && (
                  <motion.div 
                    key="specs" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12"
                  >
                    {Object.entries(product.technical_specs || {}).map(([k, v], i) => (
                       <div key={i} className="flex justify-between items-center py-5 border-b border-white/5 hover:bg-white/[0.02] px-2 transition-all group">
                          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors">{k}</span>
                          <span className="text-[10px] font-bold text-slate-300 tracking-tight font-mono">{v}</span>
                       </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'docs' && (
                  <motion.div 
                    key="docs" 
                    initial={{ opacity: 0, scale: 0.99 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl space-y-3"
                  >
                    <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-xl">
                       <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                             <ShieldCheck size={18} />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-white uppercase tracking-tight">ISO_13485_CERTIFICATE</h4>
                             <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Field Validated Clinical Deployment</p>
                          </div>
                       </div>
                       <CheckCircle2 size={16} className="text-emerald-500/50" />
                    </div>

                    {product.brochure_url && (
                      <a href={product.brochure_url} target="_blank" rel="noreferrer" className="block p-6 bg-white/[0.02] rounded-xl border border-white/5 group hover:border-blue-500/50 transition-all shadow-xl">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div className="w-10 h-10 rounded-lg bg-white/5 text-white flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                  <Download size={18} />
                               </div>
                               <div>
                                  <h4 className="text-[11px] font-black text-white uppercase tracking-tight">TECHNICAL_DOSSIER.PDF</h4>
                                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Master_Registry_Archive_v4.2.1</p>
                               </div>
                            </div>
                            <ArrowUpRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                         </div>
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Global Support Widget */}
        <div className="mt-40 p-10 bg-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                 <Microscope size={28} />
              </div>
              <div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">Consult our Clinical Architects</h4>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Connect with an Infrastructure Deployment Node.</p>
              </div>
           </div>
           <Link to="/acquisition" className="px-10 py-4 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl">
              Initiate_Consult
           </Link>
        </div>
      </div>
    </div>
  );
};
