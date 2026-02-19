
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronRight, LayoutGrid, Activity, 
  Loader2, ShieldCheck, Zap, Microscope,
  Scissors, Stethoscope, Droplets, Smile, Bed, Package,
  Filter, SlidersHorizontal, ArrowUpRight
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
                          p.model_number.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [currentDeptSlug, search, products, divisions]);

  return (
    <div className="pt-32 pb-20 bg-[#020408] min-h-screen">
      <SEO title="Portfolio" description="Clinical Asset Registry." />

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Compact Header & Controls */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Registry v2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
              Asset <span className="text-slate-700">Matrix.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
             <div className="relative group flex-1 lg:w-64">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH ID..." 
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-3 text-[10px] font-black text-white placeholder:text-slate-600 uppercase tracking-widest outline-none focus:border-blue-600 transition-all"
                />
             </div>
             <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <SlidersHorizontal size={14} />
                </button>
             </div>
          </div>
        </div>

        {/* Filter Pill Scroller */}
        <div className="mb-12 overflow-x-auto no-scrollbar pb-4">
           <div className="flex items-center gap-2">
              <button
                 onClick={() => setSearchParams({ division: 'all' })}
                 className={`shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                   currentDeptSlug === 'all' 
                   ? 'bg-blue-600 border-blue-600 text-white' 
                   : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30 hover:text-white'
                 }`}
              >
                 <LayoutGrid size={12} /> All Nodes
              </button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              {divisions.map(div => {
                 const Icon = IconMap[div.icon_name] || Activity;
                 const isActive = currentDeptSlug === div.slug;
                 return (
                    <button
                       key={div.id}
                       onClick={() => setSearchParams({ division: div.slug })}
                       className={`shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                         isActive 
                         ? 'bg-white text-black border-white' 
                         : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30 hover:text-white'
                       }`}
                    >
                       <Icon size={12} className={isActive ? 'text-blue-600' : ''} /> {div.name}
                    </button>
                 )
              })}
           </div>
        </div>

        {/* Content Grid */}
        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                 <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/5 border border-white/5 animate-pulse" />
              ))}
           </div>
        ) : (
           <motion.div layout className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              <AnimatePresence mode='popLayout'>
                 {filteredProducts.map((product) => (
                    <motion.div
                       layout
                       key={product.id}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       transition={{ duration: 0.2 }}
                    >
                       <Link to={`/portfolio/${product.slug}`} className="group block relative">
                          <div className={`
                             bg-[#0a0a0a] border border-white/10 overflow-hidden transition-all duration-500
                             ${viewMode === 'grid' 
                               ? 'rounded-[2.5rem] aspect-[4/5] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10' 
                               : 'rounded-[2rem] p-4 flex gap-6 hover:bg-white/5 items-center h-32'
                             }
                          `}>
                             {/* Image Area */}
                             <div className={`
                                relative overflow-hidden bg-white/5 
                                ${viewMode === 'grid' ? 'absolute inset-0' : 'w-24 h-24 rounded-2xl shrink-0'}
                             `}>
                                <img 
                                   src={product.main_image} 
                                   alt={product.name}
                                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                />
                                {viewMode === 'grid' && (
                                   <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                                )}
                             </div>

                             {/* Info Overlay */}
                             <div className={`
                                ${viewMode === 'grid' 
                                  ? 'absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full' 
                                  : 'flex-1 flex justify-between items-center pr-4'
                                }
                             `}>
                                <div>
                                   <div className="flex items-center gap-2 mb-2">
                                      <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                         {product.model_number}
                                      </span>
                                      {product.is_published && (
                                         <ShieldCheck size={12} className="text-emerald-500" />
                                      )}
                                   </div>
                                   <h3 className={`font-black text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors ${viewMode === 'grid' ? 'text-2xl' : 'text-xl'}`}>
                                      {product.name}
                                   </h3>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest line-clamp-1">
                                      {product.category_tag}
                                   </p>
                                </div>

                                <div className={`
                                   ${viewMode === 'grid' 
                                     ? 'mt-6 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300' 
                                     : 'flex items-center gap-4'
                                   }
                                `}>
                                   <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                                      View Dossier
                                   </span>
                                   <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                                      <ArrowUpRight size={14} />
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
      </div>
    </div>
  );
};
