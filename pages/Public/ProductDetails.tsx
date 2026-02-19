
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, ChevronLeft, Loader2, 
  Layers, ArrowUpRight, ShieldCheck, 
  CheckCircle2, Box, Info, FileText,
  FileDown, ChevronRight, Activity
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
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullSpecification();
  }, [productSlug]);

  const handleDownload = () => {
    if (product?.brochure_url) {
      const link = document.createElement('a');
      link.href = product.brochure_url;
      link.target = '_blank';
      link.download = `${product.name}_Brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Brochure not available for this product.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Loading Product Details...</span>
      </div>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center min-h-screen bg-[#020408]">
      <h1 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Product Not Found</h1>
      <Link to="/portfolio" className="text-sm font-medium text-blue-500 hover:underline">Return to Products</Link>
    </div>
  );

  const gallery = [product.main_image, ...(product.image_gallery || [])].filter(Boolean);

  return (
    <div className="pt-24 pb-48 bg-[#020408] text-slate-400 selection:bg-blue-600 selection:text-white">
      <SEO title={product.name} description={product.short_description} image={product.main_image} />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Professional Breadcrumb */}
        <header className="flex items-center justify-between mb-12 py-4 border-b border-white/5 opacity-80">
           <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} className="text-slate-700" />
              <Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
              <ChevronRight size={12} className="text-slate-700" />
              <span className="text-blue-500">{product.name}</span>
           </div>
           <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-600">
              <span>SYSTEM_ID: {product.id.slice(0, 8).toUpperCase()}</span>
           </div>
        </header>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">
           
           {/* High-Fidelity Visuals */}
           <div className="lg:col-span-7 space-y-6">
              <div className="relative">
                <motion.div layoutId={`product-${product.id}`} className="aspect-[16/10] bg-[#050505] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
                  <AnimatePresence mode='wait'>
                      <motion.img 
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={activeImage || product.main_image} 
                        className="w-full h-full object-cover" 
                      />
                  </AnimatePresence>
                  
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                      <Activity size={14} className="text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">Main View</span>
                  </div>
                </motion.div>
                
                {/* Thumbnail Navigation */}
                {gallery.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-2">
                    {gallery.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(url)}
                          className={`w-16 h-16 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeImage === url ? 'border-blue-500 opacity-100' : 'border-transparent opacity-40 hover:opacity-80'}`}
                        >
                          <img src={url} className="w-full h-full object-cover" />
                        </button>
                    ))}
                  </div>
                )}
              </div>
           </div>

           {/* Product Overview */}
           <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <Info size={12} /> Product Overview
                 </div>
                 <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">{product.name}</h1>
                 <p className="text-lg font-medium leading-relaxed text-slate-400">
                    {product.short_description}
                 </p>
              </div>

              {/* Technical Summary Table */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                 {[
                   { label: "Model Number", val: product.model_number },
                   { label: "Category", val: product.category_tag },
                   { label: "Warranty", val: "Standard 24-Month Support" },
                   { label: "Certification", val: "ISO 13485 Compliant" }
                 ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-5 hover:bg-white/[0.04] transition-colors">
                       <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                       <span className="text-xs font-bold text-slate-200">{stat.val}</span>
                    </div>
                 ))}
              </div>

              {/* Action Hub */}
              <div className="flex gap-4">
                 <Link to="/acquisition" className="flex-1 py-4 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-center flex items-center justify-center gap-3 shadow-xl">
                    Request Quote <ArrowUpRight size={16} />
                 </Link>
                 <button 
                  onClick={handleDownload}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  title="Download Brochure"
                 >
                    <FileDown size={20} />
                    <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Download PDF</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Detailed Sections */}
        <div className="mt-20 pt-20 border-t border-white/5">
           <nav className="flex items-center gap-12 mb-16 border-b border-white/5 overflow-x-auto no-scrollbar">
              {[
                { id: 'architecture', label: 'System Components' },
                { id: 'specs', label: 'Technical Data' },
                { id: 'docs', label: 'Brochures & Certs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-bold uppercase tracking-[0.2em] transition-all relative pb-6 whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="tabActive" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                </button>
              ))}
           </nav>

           <div className="min-h-[400px]">
              <AnimatePresence mode='wait'>
                {activeTab === 'architecture' && (
                  <motion.div 
                    key="arch" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-40"
                  >
                    {parts && parts.length > 0 ? (
                      parts.map((part, i) => (
                        <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center`}>
                           {/* Massive Showcase Image */}
                           <div className="w-full lg:w-3/5 aspect-video bg-[#050505] rounded-[3rem] overflow-hidden border border-white/10 relative group">
                              <img src={part.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" />
                              <div className="absolute top-6 left-6 p-4 bg-black/50 backdrop-blur-lg border border-white/10 rounded-2xl">
                                 <span className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">Sub-System {i + 1}</span>
                              </div>
                           </div>

                           {/* Narrative Details */}
                           <div className="w-full lg:w-2/5 space-y-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-[2px] bg-blue-500/40" />
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Hardware Details</span>
                              </div>
                              <h3 className="text-3xl font-bold text-white tracking-tight">{part.name}</h3>
                              <p className="text-base leading-relaxed text-slate-400 font-medium">
                                 {part.description}
                              </p>
                              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/5">
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Deployment</span>
                                    <span className="text-xs font-bold text-blue-400 uppercase">Field Validated</span>
                                 </div>
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Integration</span>
                                    <span className="text-xs font-bold text-slate-300 uppercase">Plug-and-Play</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-40 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                         <Box size={48} className="mx-auto text-slate-800 mb-6" />
                         <span className="text-sm font-semibold text-slate-600 uppercase tracking-widest">No detailed sub-systems listed.</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'specs' && (
                  <motion.div 
                    key="specs" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2"
                  >
                    {Object.entries(product.technical_specs || {}).map(([k, v], i) => (
                       <div key={i} className="flex justify-between items-center py-5 border-b border-white/5 hover:bg-white/[0.02] px-4 transition-all">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{k}</span>
                          <span className="text-xs font-bold text-slate-200 tracking-tight">{v}</span>
                       </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'docs' && (
                  <motion.div 
                    key="docs" 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto space-y-4"
                  >
                    {/* Compliance Card */}
                    <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/10 flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                             <ShieldCheck size={28} />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-white uppercase tracking-tight">ISO 13485 Certification</h4>
                             <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Global Medical Device Quality Standard</p>
                          </div>
                       </div>
                       <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>

                    {/* Brochure Card */}
                    {product.brochure_url && (
                      <button 
                        onClick={handleDownload}
                        className="w-full text-left p-8 bg-white/[0.02] rounded-3xl border border-white/10 flex items-center justify-between group hover:border-blue-500/50 transition-all"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                               <FileText size={28} />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-white uppercase tracking-tight">Full Technical Catalog</h4>
                               <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Detailed Technical Specifications (PDF)</p>
                            </div>
                         </div>
                         <Download size={24} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Global Support Call-to-Action */}
        <div className="mt-40 p-12 bg-white rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl text-slate-900">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
                 <Loader2 size={36} className="animate-pulse" />
              </div>
              <div>
                 <h4 className="text-2xl font-extrabold tracking-tight">Need a customized solution?</h4>
                 <p className="text-base font-medium text-slate-500 mt-1 italic">Our technical architects are ready to assist with your facility planning.</p>
              </div>
           </div>
           <Link to="/acquisition" className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
              Talk to an Expert
           </Link>
        </div>
      </div>
    </div>
  );
};
