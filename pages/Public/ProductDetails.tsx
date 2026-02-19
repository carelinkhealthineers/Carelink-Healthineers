
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail, Download, CheckCircle, FileText, 
  Settings, Shield, ChevronLeft, Loader2, 
  Cpu, Box, Video, Activity, Globe, Info, 
  ExternalLink, Layers, ArrowRight, ImageIcon,
  ShieldCheck, FileCheck, Landmark
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        <Loader2 size={64} className="animate-spin text-blue-600 mb-6" />
        <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Hydrating Technical Blueprint...</span>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-black text-gray-900 mb-4">Registry Fault</h1>
      <p className="text-gray-400 mb-8 font-medium">Clinical asset identifier missing.</p>
      <Link to="/portfolio" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Return to Matrix</Link>
    </div>
  );

  const gallery = [product.main_image, ...(product.image_gallery || [])];

  return (
    <div className="pt-24 pb-32 bg-gray-50/50 min-h-screen">
      <SEO title={product.name} description={product.short_description} image={product.main_image} />
      
      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        <header className="mb-12 flex items-center justify-between">
          <Link to="/portfolio" className="flex items-center gap-3 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-all uppercase tracking-[0.2em] group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Matrix
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registry_ID: {product.model_number}</span>
          </div>
        </header>

        {/* Cinematic Visual Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32 items-start">
          <div className="lg:col-span-8">
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[4rem] overflow-hidden bg-white border shadow-2xl shadow-blue-500/5 relative group mb-8"
            >
              <div className="absolute inset-0 scanner-line opacity-10" />
              <AnimatePresence mode='wait'>
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={activeImage || product.main_image} 
                  alt={product.name} 
                  className="w-full h-full object-cover min-h-[700px] group-hover:scale-105 transition-transform duration-1000" 
                />
              </AnimatePresence>
            </motion.div>

            {gallery.length > 1 && (
              <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                 {gallery.map((url, i) => (
                   <button 
                     key={i} 
                     onClick={() => setActiveImage(url)}
                     className={`w-40 h-40 rounded-[2rem] overflow-hidden border-2 shrink-0 transition-all ${activeImage === url ? 'border-blue-600 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   >
                     <img src={url} className="w-full h-full object-cover" />
                   </button>
                 ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 pt-12">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex mb-8 px-5 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-blue-600/20">
                {product.category_tag || 'Clinical Asset'}
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-10 leading-[0.9] tracking-tighter">{product.name}</h1>
              <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">{product.long_description || product.short_description}</p>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                 <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
                   <div className="flex items-center gap-3 mb-3">
                     <Settings size={16} className="text-blue-500" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Identity</span>
                   </div>
                   <div className="text-xl font-black text-gray-900 font-mono tracking-tighter">{product.model_number}</div>
                 </div>
                 <div className="p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100">
                   <div className="flex items-center gap-3 mb-3 text-emerald-600">
                     <Shield size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Sovereign Warranty</span>
                   </div>
                   <div className="text-xl font-black text-emerald-700 tracking-tighter">{product.warranty_info || 'Carelink Platinum'}</div>
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                 <Link to="/acquisition" className="w-full px-12 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 hover:bg-blue-600 transition-all text-lg">
                   <Mail size={22} /> Initiate RFQ Acquisition
                 </Link>
                 {product.brochure_url && (
                   <a href={product.brochure_url} target="_blank" rel="noreferrer" className="w-full px-12 py-8 bg-blue-600 text-white rounded-[2.5rem] font-black flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-xl shadow-blue-500/20">
                     <Download size={22} /> Technical Dossier
                   </a>
                 )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Technical Blueprint Hub */}
        <section className="mb-32">
           <div className="flex items-center gap-6 mb-16">
              <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-blue-500 flex items-center justify-center shadow-2xl"><Cpu size={32} /></div>
              <div>
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Clinical Performance Matrix</h2>
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">Hardware Performance Blueprints</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(product.technical_specs || {}).map(([key, val], idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={key} 
                  className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
                >
                   <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 opacity-60 group-hover:opacity-100">{key}</div>
                   <div className="text-2xl font-black text-gray-900 tracking-tighter">{val}</div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Technical Archive - Dedicated Documentation Area */}
        {product.brochure_url && (
          <section className="mb-32">
            <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
               <div className="absolute inset-0 scanner-line opacity-10" />
               <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:rotate-12 transition-transform">
                  <Landmark size={400} />
               </div>
               
               <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                  <div className="max-w-2xl">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                           <FileCheck size={28} />
                        </div>
                        <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em]">Asset Specification Dossier</span>
                     </div>
                     <h2 className="text-5xl font-black text-white mb-8 tracking-tighter leading-none">The Technical <br /> <span className="text-blue-500">Archive.</span></h2>
                     <p className="text-gray-400 text-xl font-medium leading-relaxed mb-10">
                        Download the comprehensive technical roadmap, clinical validation data, and site installation requirements for the {product.name}.
                     </p>
                     <div className="flex flex-wrap gap-8">
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="text-emerald-500" size={20} />
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ISO 13485 Verified</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Activity className="text-blue-500" size={20} />
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Registry Sync: Active</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="shrink-0 w-full lg:w-auto">
                     <a 
                        href={product.brochure_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex flex-col items-center gap-6 p-12 bg-white/5 border border-white/10 rounded-[3.5rem] hover:bg-white/10 transition-all group/btn"
                     >
                        <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-900 group-hover/btn:scale-110 group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all shadow-4xl shadow-blue-500/20">
                           <Download size={48} />
                        </div>
                        <div className="text-center">
                           <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] block mb-2">Initialize Download</span>
                           <span className="text-xs font-bold text-gray-400 uppercase">PDF Specification v7.0</span>
                        </div>
                     </a>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* Architecture - Detailed Breakdown */}
        {parts.length > 0 && (
          <section className="mb-32">
            <div className="flex items-center gap-6 mb-16">
               <div className="w-16 h-16 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/20"><Layers size={32} /></div>
               <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Component Architecture</h2>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">Modular Sub-System Breakdown</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
               {parts.map((part, i) => (
                 <motion.div 
                   key={part.id || i}
                   initial={{ opacity: 0, scale: 0.98 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   className="bg-white rounded-[4rem] p-10 md:p-16 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-16 items-center group hover:shadow-3xl transition-all"
                 >
                    <div className="w-full lg:w-[450px] h-[450px] rounded-[3.5rem] overflow-hidden bg-gray-50 border shrink-0">
                       <img src={part.image_url} alt={part.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-4 mb-6">
                          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">0{i+1}</span>
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">System Sub-Module</span>
                       </div>
                       <h3 className="text-4xl font-black text-gray-900 mb-8 leading-none tracking-tighter">{part.name}</h3>
                       <p className="text-xl text-gray-500 leading-relaxed font-medium mb-10">{part.description}</p>
                       <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 text-blue-600 text-xs font-black uppercase tracking-widest">
                          <Activity size={16} /> Operational Continuity Verified
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
          </section>
        )}

        {/* Cinematic Call-to-Action */}
        <section className="text-center py-32 bg-slate-900 rounded-[5rem] text-white relative overflow-hidden group">
           <div className="absolute inset-0 scanner-line opacity-10" />
           <div className="relative z-10 max-w-4xl mx-auto px-6">
              <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-none">Ready for Clinical <br /> <span className="text-blue-500">Implementation?</span></h2>
              <p className="text-gray-400 text-xl mb-16 leading-relaxed">Our technical architects are standing by to design your facility's custom installation roadmap.</p>
              <div className="flex flex-wrap justify-center gap-8">
                <Link to="/acquisition" className="inline-flex items-center gap-4 px-16 py-8 bg-blue-600 text-white rounded-full font-black text-xl shadow-4xl shadow-blue-600/40 hover:scale-105 transition-all">
                   Initiate Sourcing <ArrowRight size={24} />
                </Link>
                {product.brochure_url && (
                   <a href={product.brochure_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 px-16 py-8 bg-white/5 border border-white/20 text-white rounded-full font-black text-xl hover:bg-white/10 transition-all">
                      Review Archive <FileText size={24} />
                   </a>
                )}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};
