
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, ChevronLeft, Loader2, 
  Layers, ArrowUpRight, ShieldCheck, 
  CheckCircle2, Box, Info, FileText,
  FileDown, ChevronRight, Activity, Tv, Play, Sparkles
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { VideoTheatreModal } from '../../components/VideoTheatreModal';
import { VideoItem } from '../../utils/videoUtils';
import { supabase } from '../../supabaseClient';
import { Product, ProductPart } from '../../types';

export const ProductDetails: React.FC = () => {
  const { productSlug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [parts, setParts] = useState<ProductPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'specs' | 'docs' | 'video'>('architecture');
  const [isTheatreOpen, setIsTheatreOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

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

  const isVideoEnabled = Boolean(
    product &&
    product.show_video !== false &&
    product.show_video !== 'false' &&
    product.show_video !== 0 &&
    product.show_video !== '0' &&
    product.technical_specs?._show_video !== 'false'
  );

  const handleOpenVideo = () => {
    if (!product) return;
    const rawVideoUrl = product.video_url || product.technical_specs?._video_url || '';
    const finalVideoUrl = rawVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const finalDetails = product.short_description || product.long_description || `Official high-definition operational overview for ${product.name} (${product.model_number}).`;

    setActiveVideo({
      title: `${product.name} - Product Video`,
      badge: product.category_tag || 'Product Video',
      video_url: finalVideoUrl,
      thumbnail_url: product.main_image,
      duration: '04:15',
      details: finalDetails
    });
    setIsTheatreOpen(true);
  };

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Loading Product Details...</span>
      </div>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center min-h-screen bg-white">
      <h1 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Product Not Found</h1>
      <Link to="/portfolio" className="text-sm font-medium text-blue-500 hover:underline">Return to Products</Link>
    </div>
  );

  const gallery = [product.main_image, ...(product.image_gallery || [])].filter(Boolean);

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": gallery,
    "description": product.short_description,
    "sku": product.id,
    "mpn": product.model_number,
    "brand": {
      "@type": "Brand",
      "name": "Carelink Healthineers"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": "0", // Request for quote
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="pt-24 pb-48 bg-white text-slate-600 selection:bg-blue-600 selection:text-white">
      <SEO 
        title={product.name} 
        description={product.short_description} 
        image={product.main_image}
        type="product"
        keywords={[product.name, product.model_number, product.category_tag, 'medical equipment', 'clinical asset']}
        jsonLd={productSchema}
      />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Professional Breadcrumb */}
        <header className="flex items-center justify-between mb-12 py-4 border-b border-slate-100 opacity-80">
           <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <ChevronRight size={12} className="text-slate-300" />
              <Link to="/portfolio" className="hover:text-slate-900 transition-colors">Portfolio</Link>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-blue-600">{product.name}</span>
           </div>
           <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span>SYSTEM_ID: {product.id.slice(0, 8).toUpperCase()}</span>
           </div>
        </header>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">
           
           {/* High-Fidelity Visuals */}
           <div className="lg:col-span-7 space-y-6">
              <div className="relative">
                <motion.div layoutId={`product-${product.id}`} className="aspect-[16/10] bg-slate-50 rounded-3xl border border-slate-200/80 overflow-hidden relative shadow-md">
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
                  
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                      <Activity size={14} className="text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Main View</span>
                  </div>
                </motion.div>
                
                {/* Thumbnail Navigation */}
                {gallery.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-2">
                    {gallery.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(url)}
                          className={`w-16 h-16 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${activeImage === url ? 'border-blue-500 opacity-100' : 'border-transparent opacity-40 hover:opacity-85'}`}
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
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
                    <Info size={12} /> Product Overview
                 </div>
                 <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{product.name}</h1>
                 <p className="text-lg font-medium leading-relaxed text-slate-500">
                    {product.short_description}
                 </p>
              </div>

              {/* Technical Summary Table */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                 {[
                   { label: "Model Number", val: product.model_number },
                   { label: "Category", val: product.category_tag },
                   { label: "Support", val: "Direct Factory Support" },
                   { label: "Manufacturer", val: "Dürr Dental Authorized" }
                 ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-100/40 transition-colors">
                       <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                       <span className="text-xs font-bold text-slate-800">{stat.val}</span>
                    </div>
                 ))}
              </div>

              {/* Action Hub */}
              <div className="flex flex-wrap gap-4">
                 <Link to={`/acquisition?product=${encodeURIComponent(product.name)}`} className="flex-1 min-w-[160px] py-4 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all text-center flex items-center justify-center gap-3 shadow-md">
                    Request Quote <ArrowUpRight size={16} />
                 </Link>
                 
                 {isVideoEnabled && (
                   <button 
                    onClick={handleOpenVideo}
                    className="px-6 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-md"
                    title="Watch Product Video"
                   >
                      <Tv size={18} className="text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">Watch Video</span>
                   </button>
                 )}

                 <button 
                  onClick={handleDownload}
                  className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2"
                  title="Download Brochure"
                 >
                    <FileDown size={20} />
                    <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Download PDF</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Detailed Sections */}
        <div className="mt-20 pt-20 border-t border-slate-100">
           <nav className="flex items-center gap-12 mb-16 border-b border-slate-100 overflow-x-auto no-scrollbar">
              {[
                { id: 'architecture', label: 'System Components' },
                { id: 'specs', label: 'Technical Data' },
                ...(isVideoEnabled ? [{ id: 'video', label: 'Product Video' }] : []),
                { id: 'docs', label: 'Brochures & Certs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-bold uppercase tracking-[0.2em] transition-all relative pb-6 whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
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
                           <div className="w-full lg:w-3/5 aspect-video bg-slate-100 rounded-[3rem] overflow-hidden border border-slate-200/80 relative group shadow-sm">
                              <img src={part.image_url} className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-all duration-1000" />
                              <div className="absolute top-6 left-6 p-4 bg-white/95 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm">
                                 <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Sub-System {i + 1}</span>
                              </div>
                           </div>

                           {/* Narrative Details */}
                           <div className="w-full lg:w-2/5 space-y-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-[2px] bg-blue-500/40" />
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Hardware Details</span>
                              </div>
                              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{part.name}</h3>
                              <p className="text-base leading-relaxed text-slate-500 font-medium">
                                 {part.description}
                              </p>
                              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-100">
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Deployment</span>
                                    <span className="text-xs font-bold text-blue-600 uppercase">Field Validated</span>
                                 </div>
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Integration</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Plug-and-Play</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-40 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                         <Box size={48} className="mx-auto text-slate-400 mb-6" />
                         <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">No detailed sub-systems listed.</span>
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
                    {Object.entries(product.technical_specs || {}).filter(([k]) => !k.startsWith('_')).map(([k, v], i) => (
                       <div key={i} className="flex justify-between items-center py-5 border-b border-slate-100 hover:bg-slate-50 px-4 transition-all">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{k}</span>
                          <span className="text-xs font-bold text-slate-800 tracking-tight">{v}</span>
                       </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'video' && isVideoEnabled && (
                  <motion.div 
                    key="video" 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-5xl mx-auto space-y-8"
                  >
                    <div 
                      onClick={handleOpenVideo}
                      className="group relative aspect-[21/9] min-h-[320px] bg-slate-950 rounded-[2.5rem] border border-slate-800 overflow-hidden cursor-pointer shadow-2xl flex items-center justify-center"
                    >
                      <img src={product.main_image} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 border border-white/20 backdrop-blur-md"
                        >
                          <Play size={32} className="fill-white ml-1" />
                        </motion.div>
                        <div className="space-y-1">
                          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Click to Watch Video
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{product.name} Video Demo</h3>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                        <Sparkles size={16} /> Overview & Technical Details
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {product.short_description || product.long_description || `Watch direct operational procedures, positioning, technical specs output, and features for ${product.name}.`}
                      </p>
                    </div>
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
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200/80 flex items-center justify-between group hover:border-emerald-500/50 transition-all shadow-sm">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                             <ShieldCheck size={28} />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Official Dürr Dental Partner</h4>
                             <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Direct Certified Manufacturer Standards</p>
                          </div>
                       </div>
                       <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>

                    {/* Brochure Card */}
                    {product.brochure_url && (
                      <button 
                        onClick={handleDownload}
                        className="w-full text-left p-8 bg-slate-50 rounded-3xl border border-slate-200/80 flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-sm"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                               <FileText size={28} />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Full Technical Catalog</h4>
                               <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Detailed Technical Specifications (PDF)</p>
                            </div>
                         </div>
                         <Download size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Global Support Call-to-Action */}
        <div className="mt-40 p-12 bg-slate-50 border border-slate-200/60 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm text-slate-950">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-md">
                 <Loader2 size={36} className="animate-pulse" />
              </div>
              <div>
                 <h4 className="text-2xl font-extrabold tracking-tight">Need a customized solution?</h4>
                 <p className="text-base font-medium text-slate-500 mt-1 italic">Our technical architects are ready to assist with your facility planning.</p>
              </div>
           </div>
           <Link to={`/acquisition?product=${encodeURIComponent(product.name)}`} className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">
              Talk to an Expert
           </Link>
        </div>
      </div>

      <VideoTheatreModal 
        isOpen={isTheatreOpen}
        onClose={() => setIsTheatreOpen(false)}
        video={activeVideo}
      />
    </div>
  );
};
