
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, LayoutGrid, Activity, 
  Loader2, ShieldCheck, Zap, Microscope,
  Scissors, Stethoscope, Droplets, Smile, Bed, Package,
  SlidersHorizontal, ArrowUpRight, ChevronLeft, ChevronRight,
  Filter, Terminal, Database, Globe
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
        console.error('Data Fetch Error:', err);
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

  return (
    <div className="pt-32 pb-32 bg-[#020408] min-h-screen font-sans selection:bg-blue-600">
      <SEO title="Asset Portfolio" description="Clinical Asset Registry and Infrastructure Sourcing Matrix." />

      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        {/* Header Metadata (Smarter Look) */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6 opacity-80 border-b border-white/5 pb-10">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Registry_Node_Active_4.2</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                Infrastructure <span className="text-slate-700 italic">Portfolio.</span>
              </h1>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="hidden lg:flex flex-col items-end">
                 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Total_Assets_Mapped</span>
                 <span className="text-xs font-black text-blue-500">{products.length} Units</span>
              </div>
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <LayoutGrid size={12} /> Grid
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  <SlidersHorizontal size={12} /> Table
                </button>
              </div>
           </div>
        </div>

        {/* Main 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT SIDEBAR NAVIGATION (3 Cols) */}
          <aside className="lg:col-span-3 space-y-12">
            <div className="sticky top-32 space-y-10">
              
              {/* Registry Search Node */}
              <div className="space-y-4">
                 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] px-1">Registry_Query</span>
                 <div className="relative group">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="MODEL_ID / KEYWORD..." 
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-[10px] font-bold text-white placeholder:text-slate-800 uppercase tracking-widest outline-none focus:border-blue-600 focus:bg-white/[0.04] transition-all"
                    />
                 </div>
              </div>

              {/* Department Hierarchy */}
              <div className="space-y-6">
                 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] px-1">Clinical_Departments</span>
                 <nav className="flex flex-col gap-1.5">
                    <button
                       onClick={() => setSearchParams({ division: 'all' })}
                       className={`flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                         currentDeptSlug === 'all' 
                         ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                         : 'bg-transparent border-transparent text-slate-600 hover:text-slate-400'
                       }`}
                    >
                       <div className="flex items-center gap-4">
                          <Globe size={14} className={currentDeptSlug === 'all' ? 'text-blue-400' : 'text-slate-800'} />
                          <span>Complete Registry</span>
                       </div>
                       {currentDeptSlug === 'all' && <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />}
                    </button>

                    <div className="h-px bg-white/5 my-2 mx-5" />

                    {divisions.map(div => {
                       const Icon = IconMap[div.icon_name] || Activity;
                       const isActive = currentDeptSlug === div.slug;
                       return (
                          <button
                             key={div.id}
                             onClick={() => setSearchParams({ division: div.slug })}
                             className={`flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                               isActive 
                               ? 'bg-white text-black border-white' 
                               : 'bg-transparent border-transparent text-slate-600 hover:text-slate-400'
                             }`}
                          >
                             <div className="flex items-center gap-4">
                                <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-800'} />
                                <span>{div.name}</span>
                             </div>
                             {isActive && <ChevronRight size={14} />}
                          </button>
                       )
                    })}
                 </nav>
              </div>

              {/* Technical Telemetry Widget */}
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 hidden lg:block">
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Interface_Link</span>
                    <span className="text-[8px] font-mono text-emerald-500">NOMINAL</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Sourcing_Matrix</span>
                    <span className="text-[8px] font-mono text-blue-500">SYNCED</span>
                 </div>
                 <div className="pt-2">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          animate={{ width: ['0%', '100%'] }} 
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          className="h-full bg-blue-600" 
                        />
                    </div>
                 </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA (9 Cols) */}
          <main className="lg:col-span-9">
            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-pulse" />
                  ))}
               </div>
            ) : (
               <motion.div layout className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'}`}>
                  <AnimatePresence mode='popLayout'>
                     {filteredProducts.map((product) => (
                        <motion.div
                           layout
                           key={product.id}
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        >
                           <Link to={`/portfolio/${product.slug}`} className="group block h-full">
                              <div className={`
                                 bg-white/[0.01] border border-white/5 overflow-hidden transition-all duration-700 h-full relative
                                 ${viewMode === 'grid' 
                                   ? 'rounded-[2.5rem] flex flex-col hover:border-blue-500/50 hover:bg-white/[0.03] shadow-2xl' 
                                   : 'rounded-2xl p-6 flex flex-col md:flex-row gap-10 hover:bg-white/[0.04] items-center'
                                 }
                              `}>
                                 {/* Asset Visual Node */}
                                 <div className={`
                                    relative overflow-hidden bg-black/40
                                    ${viewMode === 'grid' ? 'aspect-[4/5]' : 'w-48 h-48 rounded-xl shrink-0 border border-white/5'}
                                 `}>
                                    <img 
                                       src={product.main_image} 
                                       alt={product.name}
                                       className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                                    />
                                    {viewMode === 'grid' && (
                                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    )}
                                    
                                    <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
                                      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                      <span className="text-[7px] font-bold text-white uppercase tracking-widest opacity-80">{product.model_number}</span>
                                    </div>
                                 </div>

                                 {/* Identity Interface */}
                                 <div className={`
                                    ${viewMode === 'grid' 
                                      ? 'absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end' 
                                      : 'flex-1 flex justify-between items-center pr-4'
                                    }
                                 `}>
                                    <div className="space-y-2">
                                       <h3 className={`font-black text-white leading-tight group-hover:text-blue-500 transition-colors ${viewMode === 'grid' ? 'text-lg' : 'text-2xl'}`}>
                                          {product.name}
                                       </h3>
                                       <div className="flex items-center gap-4">
                                          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                             {product.category_tag}
                                          </p>
                                          {viewMode === 'list' && (
                                            <p className="text-xs text-slate-500 font-medium line-clamp-2 max-w-sm italic opacity-60">
                                              {product.short_description}
                                            </p>
                                          )}
                                       </div>
                                    </div>

                                    <div className={`
                                       ${viewMode === 'grid' 
                                         ? 'mt-6 flex items-center justify-between' 
                                         : 'flex items-center gap-4'
                                       }
                                    `}>
                                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                          Access_Registry
                                       </span>
                                       <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
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

            {/* Empty State Registry */}
            {!loading && filteredProducts.length === 0 && (
               <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
                  <Database className="mx-auto text-slate-900 mb-8" size={64} />
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Null Registry Query</h3>
                  <p className="text-slate-600 text-sm font-medium italic">Adjust clinical parameters or reset nodes.</p>
                  <button onClick={() => {setSearch(''); setSearchParams({division: 'all'})}} className="mt-10 px-10 py-4 bg-white text-black rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                    Reset Hierarchy
                  </button>
               </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
