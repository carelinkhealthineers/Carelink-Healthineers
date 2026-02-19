
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LayoutGrid, Zap, Activity, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Division } from '../types';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/portfolio' },
  { label: 'Partners', path: '/alliances' },
  { label: 'AI', path: '/intelligence' },
  { label: 'Quote', path: '/acquisition' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.from('divisions').select('*').order('order_index')
      .then(({ data }) => setDivisions(data || []));
  }, []);

  return (
    <>
      <nav className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="pointer-events-auto w-full max-w-5xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-slate-200/10 rounded-full p-2 pl-6 pr-2 flex items-center justify-between relative"
        >
          {/* LEFT: Identity */}
          <Link to="/" className="flex items-center gap-3 group mr-6 shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <img 
                src="https://i.imgur.com/y0UvXGu.png" 
                alt="Logo" 
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-black tracking-tighter text-slate-900 leading-none">CARELINK</span>
            </div>
          </Link>

          {/* CENTER: Liquid Navigation */}
          <div className="hidden lg:flex items-center bg-slate-100/50 rounded-full p-1 border border-white/50 shadow-inner gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredPath === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className={`relative px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${
                    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {/* Active/Hover Background Pill */}
                  {(isActive || isHovered) && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-white rounded-full shadow-sm border border-black/5"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 pl-4">
            
            {/* Matrix Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowMatrix(!showMatrix)}
                className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  showMatrix 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <LayoutGrid size={14} /> Categories
                <ChevronDown size={12} className={`transition-transform duration-300 ${showMatrix ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Matrix Dropdown */}
              <AnimatePresence>
                {showMatrix && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-2xl p-4 grid gap-2 z-50 origin-top-right"
                  >
                    <div className="px-4 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-100 mb-2">
                      Clinical Departments
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 space-y-1">
                      {divisions.map((div) => (
                        <Link 
                          key={div.id}
                          to={`/portfolio?division=${div.slug}`}
                          onClick={() => setShowMatrix(false)}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${div.hero_gradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                             <Activity size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-[10px] font-black text-slate-700 group-hover:text-blue-600 truncate uppercase tracking-tight">
                               {div.name}
                             </div>
                          </div>
                          <ArrowRight size={12} className="text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                    <Link to="/divisions" className="mt-2 text-center py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-colors">
                      All Hubs
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nexus CTA */}
            <Link 
              to="/command-nexus"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:scale-105 transition-all shadow-lg shadow-slate-900/20"
            >
              <Zap size={14} className="fill-current" /> <span className="hidden sm:inline">Admin</span>
            </Link>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-slate-900/20 backdrop-blur-md flex items-start justify-center pt-28 px-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: -20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      location.pathname === item.path 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-100 my-4" />
                
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-4">
                  Clinical Hubs
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {divisions.slice(0,4).map(div => (
                     <Link 
                       key={div.id} 
                       to={`/portfolio?division=${div.slug}`}
                       onClick={() => setIsOpen(false)}
                       className="p-3 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-600 truncate hover:bg-blue-50 hover:text-blue-600 transition-colors"
                     >
                       {div.name}
                     </Link>
                   ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
