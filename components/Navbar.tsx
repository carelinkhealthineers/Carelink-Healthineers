
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, LayoutGrid } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Origin', path: '/' },
  { label: 'Foundation', path: '/foundation' },
  { label: 'Divisions', path: '/divisions' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Alliances', path: '/alliances' },
  { label: 'Intelligence', path: '/intelligence' },
  { label: 'Acquisition', path: '/acquisition' },
  { label: 'Interface', path: '/interface' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
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
        <div className="hidden lg:flex items-center gap-10">
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
            className="absolute top-full left-0 right-0 bg-slate-50/98 backdrop-blur-3xl border-b border-slate-200 lg:hidden overflow-hidden"
          >
            <div className="flex flex-col p-10 gap-6">
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
