
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, LayoutGrid, ChevronDown, Activity, Layers } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Division } from '../types';

const NAV_ITEMS = [
  { label: 'Origin', path: '/' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Alliances', path: '/alliances' },
  { label: 'Intelligence', path: '/intelligence' },
  { label: 'Acquisition', path: '/acquisition' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch divisions for global matrix
    supabase.from('divisions').select('*').order('order_index')
      .then(({ data }) => setDivisions(data || []));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-700 ${
      scrolled 
      ? 'glassy-nav py-3 shadow-sm' 
      : 'bg-transparent py-6'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <img 
            src="https://i.imgur.com/y0UvXGu.png" 
            alt="Carelink Logo" 
            className="w-10 h-10 object-contain group-hover:scale-110 transition-all duration-500"
          />
          <div>
            <span className="text-xl font-black tracking-tighter text-black block leading-none">Carelink</span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] -mt-0.5">Healthineers</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="relative" onMouseEnter={() => setShowMatrix(true)} onMouseLeave={() => setShowMatrix(false)}>
            <button className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all py-2 ${showMatrix ? 'text-blue-600' : 'text-slate-500'}`}>
              Clinical Matrix <ChevronDown size={14} className={`transition-transform duration-300 ${showMatrix ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showMatrix && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full -left-20 w-[600px] bg-white rounded-[2rem] shadow-3xl border border-gray-100 p-8 grid grid-cols-2 gap-4"
                >
                  {divisions.map((div) => (
                    <Link 
                      key={div.id} 
                      to={`/portfolio?division=${div.slug}`}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                      onClick={() => setShowMatrix(false)}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${div.hero_gradient} flex items-center justify-center text-white text-xs shadow-md`}>
                        <Activity size={18} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{div.name}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{(div as any).count_label || 'Strategic Node'}</div>
                      </div>
                    </Link>
                  ))}
                  <div className="col-span-2 pt-4 border-t mt-2">
                     <Link to="/divisions" className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:gap-4 transition-all">
                        Full Clinical Blueprint <ChevronRight size={14} />
                     </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-2 ${
                location.pathname === item.path 
                ? 'text-blue-600' 
                : 'text-slate-500 hover:text-black'
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="navIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          ))}
          
          <Link
            to="/command-nexus"
            className="ml-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 group"
          >
            <LayoutGrid size={12} className="group-hover:rotate-90 transition-transform" />
            Nexus Command
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-900 p-2">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-3xl border-b border-slate-200 lg:hidden overflow-hidden"
          >
            <div className="flex flex-col p-10 gap-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b pb-2">Clinical Matrix</div>
              <div className="grid grid-cols-1 gap-2">
                 {divisions.map(div => (
                   <Link key={div.id} to={`/portfolio?division=${div.slug}`} className="text-sm font-bold text-gray-900 py-2 border-b border-gray-50 flex justify-between" onClick={() => setIsOpen(false)}>
                     {div.name} <ChevronRight size={14} className="text-gray-300" />
                   </Link>
                 ))}
              </div>
              <div className="mt-4 flex flex-col gap-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                      location.pathname === item.path ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
              <Link
                to="/command-nexus"
                onClick={() => setIsOpen(false)}
                className="mt-6 flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                Nexus Command
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
