
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, LayoutGrid, Activity, 
  Loader2, ShieldCheck, Zap, Microscope,
  Scissors, Stethoscope, Droplets, Smile, Bed, Package,
  SlidersHorizontal, ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Product, Division } from '../../types';

const IconMap: Record<string, any> = { Microscope, Zap, Scissors, Activity, Stethoscope, Droplets, Smile, ShieldCheck, Bed, Package };

export const Portfolio: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDeptSlug = searchParams.get('division') || 'all';
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, dRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_published', true),
          supabase.from('divisions').select('*').order('order_index')
        ]);
        if (pRes.data) setProducts(pRes.data);
        if (dRes.data) setDivisions(dRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const division = divisions.find(d => d.id === p.division_id);
      const matchDept = currentDeptSlug === 'all' || division?.slug === currentDeptSlug;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.model_number.toLowerCase().includes(search.toLowerCase()) ||
                          p.category_tag.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [currentDeptSlug, search, products, divisions]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-32 pb-32 bg-[#020408] min-h-screen">
      <SEO title="Asset Portfolio" description="Clinical Asset Registry and Infrastructure Sourcing Matrix." />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Enterprise Header Section */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-10 mb-16 border-b border-white/5 pb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-blue-500/50" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em]">Registry_Protocol_v4.2</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              Infrastructure <br /> <span className="text-slate-700 italic">Portfolio.</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl leading-relaxed">
              Access the sovereign clinical registry. Every asset listed is field-validated for operational deployment across high-density clinical nodes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
             <div className="relative group w-full sm:w-96">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="QUERY ASSET ID OR MODEL..." 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-[11px] font-black text-white placeholder:text-slate-700 uppercase tracking-widest outline-none focus:border-blue-600 focus:bg-white/[0.05] transition-all shadow-2xl"
                />
             </div>
             <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 shadow-inner">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewMode === 'grid' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <LayoutGrid size={14} /> Matrix
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewMode === 'list' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <SlidersHorizontal size={14} /> Technical
                </button>
             </div>
          </div>
        </div>

        {/* Filter Navigation Control (Fixed for PC) */}
        <div className="relative mb-16 group/filter">
           <button 
             onClick={() => scroll('left')}
             className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl text-white flex items-center justify-center opacity-0 group-hover/filter:opacity-100 transition-all hover:bg-blue-600 shadow-2xl"
           >
              <ChevronLeft size={18} />
           </button>
           
           <div 
             ref={scrollContainerRef}
             className="overflow-x-auto no-scrollbar pb-4 flex items-center gap-3 scroll-smooth select-none cursor-grab active:cursor-grabbing"
           >
              <button
                 onClick={() => setSearchParams({ division: 'all' })}
                 className={`shrink-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${
                   currentDeptSlug === 'all' 
                   ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                   : 'bg-white/[0.02] border-white/10 text-slate-500 hover:border-white/30 hover:text-white'
                 }`}
              >
                 <LayoutGrid size={14} /> Full Hub
              </button>

              <div className="w-[1px] h-8 bg-white/10 shrink-0 mx-2" />

              {divisions.map(div => {
                 const Icon = IconMap[div.icon_name] || Activity;
                 const isActive = currentDeptSlug === div.slug;
                 return (
                    <button
                       key={div.id}
                       onClick={() => setSearchParams({ division: div.slug })}
                       className={`shrink-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${
                         isActive 
                         ? 'bg-white text-black border-white shadow-xl' 
                         : 'bg-white/[0.02] border-white/10 text-slate-500 hover:border-white/30 hover:text-white'
                       }`}
                    >
                       <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-600'} /> {div.name}
                    </button>
                 )
              })}
           </div>

           <button 
             onClick={() => scroll('right')}
             className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl text-white flex items-center justify-center opacity-0 group-hover/filter:opacity-100 transition-all hover:bg-blue-600 shadow-2xl"
           >
              <ChevronRight size={18} />
           </button>
        </div>

        {/* Dynamic Asset Grid */}
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {[...Array(10)].map((_, i) => (
                 <div key={i} className="aspect-[3/4] rounded-[3rem] bg-white/[0.03] border border-white/5 animate-pulse" />
              ))}
           </div>
        ) : (
           <motion.div layout className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
              <AnimatePresence mode='popLayout'>
                 {filteredProducts.map((product) => (
                    <motion.div
                       layout
                       key={product.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                       <Link to={`/portfolio/${product.slug}`} className="group block relative">
                          <div className={`
                             bg-[#0a0a0a] border border-white/10 overflow-hidden transition-all duration-700
                             ${viewMode === 'grid' 
                               ? 'rounded-[3rem] aspect-[3/4] hover:border-blue-500/50 hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.15)]' 
                               : 'rounded-[2.5rem] p-6 flex gap-10 hover:bg-white/[0.04] items-center'
                             }
                          `}>
                             {/* Media Node */}
                             <div className={`
                                relative overflow-hidden bg-white/[0.02]
                                ${viewMode === 'grid' ? 'absolute inset-0' : 'w-48 h-48 rounded-[2rem] shrink-0 border border-white/5 shadow-2xl'}
                             `}>
                                <img 
                                   src={product.main_image} 
                                   alt={product.name}
                                   className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
                                />
                                {viewMode === 'grid' && (
                                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity" />
                                )}
                                
                                <div className="absolute top-6 left-6 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                  <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ready to Source</span>
                                </div>
                             </div>

                             {/* Meta Interface */}
                             <div className={`
                                ${viewMode === 'grid' 
                                  ? 'absolute bottom-0 left-0 right-0 p-10 flex flex-col justify-end h-full' 
                                  : 'flex-1 flex justify-between items-center pr-8'
                                }
                             `}>
                                <div className="space-y-3">
                                   <div className="flex items-center gap-3">
                                      <span className="px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                         {product.model_number}
                                      </span>
                                   </div>
                                   <h3 className={`font-black text-white leading-tight group-hover:text-blue-400 transition-colors ${viewMode === 'grid' ? 'text-2xl' : 'text-3xl'}`}>
                                      {product.name}
                                   </h3>
                                   <div className="flex items-center gap-4">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest line-clamp-1">
                                         {product.category_tag}
                                      </p>
                                      {viewMode === 'list' && (
                                        <p className="text-xs text-slate-600 font-medium line-clamp-2 max-w-md italic">
                                          {product.short_description}
                                        </p>
                                      )}
                                   </div>
                                </div>

                                <div className={`
                                   ${viewMode === 'grid' 
                                     ? 'mt-8 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75' 
                                     : 'flex items-center gap-6'
                                   }
                                `}>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                      Registry Dossier
                                   </span>
                                   <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <ArrowUpRight size={18} />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </Link>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </motion.div>
        )}

        {/* Empty State Registry */}
        {!loading && filteredProducts.length === 0 && (
           <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.02]">
              <Search className="mx-auto text-slate-800 mb-6" size={64} />
              <h3 className="text-2xl font-black text-white mb-2">Null Registry Entry.</h3>
              <p className="text-slate-500 text-sm font-medium">Try adjusting your clinical query parameters.</p>
              <button onClick={() => {setSearch(''); setSearchParams({division: 'all'})}} className="mt-8 px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">Reset All Nodes</button>
           </div>
        )}
      </div>
    </div>
  );
};
