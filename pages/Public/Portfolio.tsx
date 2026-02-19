
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronRight, LayoutGrid, Activity, 
  Loader2, Cpu, ShieldCheck, Zap, Layers, 
  Target, Filter, Database, Box, Microscope,
  Scissors, Stethoscope, Droplets, Smile, Bed, Package,
  Maximize2, Radar
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
    <div className="pt-32 pb-40 bg-slate-50 min-h-screen">
      <SEO title="Platform Portfolio" description="Clinical Infrastructure Dossier." />

      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        {/* Cinematic HUD Header */}
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-[2px] w-16 bg-blue-600" />
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Registry // Clinical_Hardware_Matrix</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-none">
              Hardware <span className="text-gradient-primary">Sovereignty.</span>
            </h1>
          </div>

          <div className="relative group lg:w-[450px]">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Radar size={24} className="animate-spin-slow" />
            </div>
            <input 
              type="text" 
              placeholder="Query Repository Matrix..." 
              className="w-full pl-16 pr-8 py-6 bg-white border-4 border-slate-100 rounded-[2.5rem] font-black text-sm uppercase tracking-widest outline-none focus:border-blue-600 transition-all shadow-2xl shadow-blue-500/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-[9px] font-black text-white uppercase tracking-widest">
              Live Query
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Clinical Matrix Sidebar */}
          <aside className="lg:w-96 flex-shrink-0">
            <div className="sticky top-28">
              <div className="bg-white rounded-[4rem] p-6 border-2 border-slate-100 shadow-4xl shadow-slate-900/5 overflow-hidden">
                <div className="p-8 border-b-2 border-slate-50 mb-6 flex items-center justify-between">
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                     <Filter size={18} className="text-blue-600" /> Clinical Matrix
                   </h3>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                </div>
                
                <nav className="space-y-2">
                  <button
                    onClick={() => setSearchParams({ division: 'all' })}
                    className={`w-full group flex items-center gap-5 px-8 py-5 rounded-[2rem] transition-all relative ${
                      currentDeptSlug === 'all' 
                      ? 'bg-slate-900 text-white shadow-3xl translate-x-3' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${currentDeptSlug === 'all' ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                      <LayoutGrid size={22} />
                    </div>
                    <div className="flex flex-col items-start text-left">
                       <span className="text-xs font-black uppercase tracking-tight">Full Registry</span>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Master Node</span>
                    </div>
                  </button>

                  {divisions.map((dept) => {
                    const IconComponent = IconMap[dept.icon_name] || Activity;
                    const isActive = currentDeptSlug === dept.slug;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setSearchParams({ division: dept.slug })}
                        className={`w-full group flex items-center gap-5 px-8 py-5 rounded-[2rem] transition-all relative ${
                          isActive 
                          ? 'bg-white border-4 border-blue-600 text-blue-600 shadow-3xl translate-x-3' 
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isActive 
                          ? `bg-gradient-to-br ${dept.hero_gradient} text-white shadow-2xl` 
                          : 'bg-slate-50 group-hover:bg-white group-hover:shadow-lg'
                        }`}>
                          <IconComponent size={22} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                           <span className="text-xs font-black uppercase tracking-tight leading-tight">{dept.name}</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${isActive ? 'text-blue-600' : ''}`}>
                             {(dept as any).count_label || 'Strategic Node'}
                           </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Staggered Cinematic Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-12 px-4">
               <div className="flex items-center gap-6">
                  <div className="px-6 py-3 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-3xl shadow-blue-600/30">
                     Targeting: {currentDeptSlug.replace('-', ' ')}
                  </div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                     <Database size={16} /> Registry Entries: {loading ? '...' : filteredProducts.length}
                  </div>
               </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="bg-white rounded-[5rem] p-12 h-[600px] border-4 border-slate-50 animate-pulse" />
                 ))}
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <AnimatePresence mode='popLayout'>
                  {filteredProducts.map((product) => (
                    <motion.div 
                      key={product.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ y: -15 }}
                      className="group"
                    >
                      <Link to={`/portfolio/${product.slug}`} className="block h-full bg-white rounded-[5rem] p-10 md:p-14 border-4 border-slate-100 hover:border-blue-500 shadow-sm hover:shadow-4xl transition-all relative overflow-hidden">
                        
                        {/* Scanning HUD */}
                        <div className="absolute top-10 right-10 flex flex-col items-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">Verified Asset</span>
                           <ShieldCheck size={28} className="text-blue-600" />
                        </div>

                        <div className="h-80 md:h-[400px] rounded-[4rem] overflow-hidden bg-slate-50 mb-10 border-2 border-slate-50 relative group-hover:border-blue-100 transition-colors">
                          <div className="absolute inset-0 scanner-line opacity-20 group-hover:opacity-60" />
                          <img 
                            src={product.main_image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
                          />
                          <div className="absolute bottom-8 left-8 flex gap-3">
                             <div className="px-5 py-2 bg-white/95 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-slate-100">
                               Ref: {product.model_number}
                             </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full bg-blue-600" />
                             <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">
                               {product.category_tag || 'Clinical Asset'}
                             </span>
                          </div>
                          
                          <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tighter group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>

                          <p className="text-slate-400 text-lg font-medium leading-relaxed line-clamp-2">
                            {product.short_description}
                          </p>

                          <div className="pt-10 border-t-2 border-slate-50 flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Access Endpoint</span>
                                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">INITIATE_SPECS_REEL</span>
                             </div>
                             <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 group-hover:rotate-[360deg] transition-all duration-700 shadow-3xl">
                                <ChevronRight size={32} />
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
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
