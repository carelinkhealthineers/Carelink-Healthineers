
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail, Download, CheckCircle2, ChevronLeft, Loader2, 
  Cpu, Box, Activity, Layers, ArrowUpRight,
  ShieldCheck, Share2, Printer, Microscope
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
  const [activeTab, setActiveTab] = useState<'specs' | 'docs'>('specs');

  useEffect(() => {
    const fetchFullSpecification = async () => {
      setLoading(true);
      try {
        const { data: productData, error: pError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', productSlug)
          .single();
        
        if (pError) throw pError;
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020408]">
      <div className="relative">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Accessing Registry...</span>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center min-h-screen bg-[#020408]">
      <h1 className="text-xl font-black text-white mb-2">Registry Fault</h1>
      <p className="text-slate-500 mb-8 font-medium text-xs">Asset identifier missing.</p>
      <Link to="/portfolio" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors">Return</Link>
    </div>
  );

  const gallery = [product.main_image, ...(product.image_gallery || [])];

  return (
    <div className="pt-32 pb-20 bg-[#020408] min-h-screen text-slate-200">
      <SEO title={product.name} description={product.short_description} image={product.main_image} />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Compact Header */}
        <header className="flex items-center justify-between mb-8">
           <Link to="/portfolio" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors group">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronLeft size={12} />
              </div>
              Return to Matrix
           </Link>
           <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors"><Share2 size={12} /></button>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors"><Printer size={12} /></button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT: Visual Intelligence (5 Cols) */}
           <div className="lg:col-span-5 space-y-4">
              <motion.div layoutId={`product-${product.id}`} className="aspect-[4/3] bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden relative group">
                 <AnimatePresence mode='wait'>
                    <motion.img 
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={activeImage || product.main_image} 
                      className="w-full h-full object-cover p-1 rounded-[2rem] opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                 </AnimatePresence>
                 {/* Floating Badge */}
                 <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Live Asset
                 </div>
              </motion.div>

              {/* Micro Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                   {gallery.map((url, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveImage(url)}
                        className={`w-14 h-14 shrink-0 rounded-xl border overflow-hidden transition-all ${activeImage === url ? 'border-blue-500 opacity-100 scale-95' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                      >
                         <img src={url} className="w-full h-full object-cover" />
                      </button>
                   ))}
                </div>
              )}

              {/* Mini Architecture Preview */}
              {parts.length > 0 && (
                <div className="bg-white/5 rounded-[2rem] p-5 border border-white/10 mt-4">
                   <div className="flex items-center gap-2 mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <Layers size={10} /> Architecture ({parts.length})
                   </div>
                   <div className="space-y-2">
                      {parts.slice(0, 3).map((part, i) => (
                         <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-black/20 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-default">
                            {part.image_url ? (
                              <img src={part.image_url} className="w-6 h-6 rounded-lg object-cover bg-white/10" />
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center"><Box size={10} /></div>
                            )}
                            <div className="flex-1 min-w-0">
                               <div className="text-[9px] font-bold text-slate-300 truncate">{part.name}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}
           </div>

           {/* CENTER: Technical Data (4 Cols) */}
           <div className="lg:col-span-4 space-y-6">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                       {product.category_tag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider">REF: {product.model_number}</span>
                 </div>
                 <h1 className="text-3xl font-black text-white leading-tight tracking-tight mb-4">{product.name}</h1>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">{product.long_description || product.short_description}</p>
              </div>

              {/* Smart Tabs Container */}
              <div className="bg-white/5 rounded-[2rem] p-1 border border-white/10 flex flex-col h-[320px]">
                 <div className="flex p-1 gap-1 mb-2 shrink-0">
                    <button onClick={() => setActiveTab('specs')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'specs' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>Specifications</button>
                    <button onClick={() => setActiveTab('docs')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'docs' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>Documentation</button>
                 </div>
                 
                 <div className="px-4 pb-2 overflow-y-auto custom-scrollbar flex-1">
                    {activeTab === 'specs' ? (
                       <div className="space-y-1">
                          {Object.entries(product.technical_specs || {}).map(([k, v], i) => (
                             <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{k}</span>
                                <span className="text-[9px] font-bold text-slate-200 text-right">{v}</span>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 border border-white/5">
                             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><ShieldCheck size={14} /></div>
                             <div className="flex-1">
                                <div className="text-[9px] font-bold text-white uppercase">ISO 13485 Compliance</div>
                                <div className="text-[8px] text-slate-500">Verified Global Standard</div>
                             </div>
                          </div>
                          {product.brochure_url ? (
                             <a href={product.brochure_url} target="_blank" className="flex items-center gap-3 p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg"><Download size={14} /></div>
                                <div className="flex-1">
                                   <div className="text-[9px] font-bold text-blue-200 uppercase group-hover:text-white">Technical Dossier PDF</div>
                                   <div className="text-[8px] text-blue-400/60">Specification Sheet v2.4</div>
                                </div>
                                <ArrowUpRight size={12} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </a>
                          ) : (
                             <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                                <span className="text-[9px] font-bold text-slate-600 uppercase">No Digital Assets</span>
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* RIGHT: Action Control (3 Cols) */}
           <div className="lg:col-span-3">
              <div className="sticky top-28 space-y-4">
                 <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Activity size={80} />
                    </div>
                    
                    <div className="relative z-10">
                       <div className="text-center mb-6">
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Acquisition Protocol</div>
                          <div className="text-xl font-black text-white tracking-tight">Ready to Deploy</div>
                       </div>

                       <div className="space-y-3">
                          <Link to="/acquisition" className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                             <Mail size={14} /> Initiate RFQ
                          </Link>
                          <Link to="/alliances" className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                             <Cpu size={14} /> View Logistics
                          </Link>
                       </div>

                       <div className="mt-6 pt-6 border-t border-white/5 space-y-2.5">
                          <div className="flex justify-between text-[9px] font-bold">
                             <span className="text-slate-500">Warranty</span>
                             <span className="text-emerald-400">Platinum Tier</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold">
                             <span className="text-slate-500">Lead Time</span>
                             <span className="text-slate-300">~14 Days Global</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-bold">
                             <span className="text-slate-500">Support</span>
                             <span className="text-slate-300">24/7 Neural Link</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-[#0a0a0a] rounded-[2rem] p-4 border border-white/5 flex items-center gap-3 hover:border-blue-500/20 transition-colors cursor-default">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                       <Microscope size={16} />
                    </div>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-300 uppercase">Need Config?</div>
                       <div className="text-[8px] text-slate-600 font-medium">Talk to a Clinical Architect</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
