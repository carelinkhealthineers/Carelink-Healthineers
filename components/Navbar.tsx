
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            C
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Carelink</span>
            <span className="text-sm block font-medium text-blue-600 -mt-1 uppercase tracking-widest">Healthineers</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
                location.pathname === item.path ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/command-nexus"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all"
          >
            <LayoutGrid size={14} />
            Command Nexus
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-gray-900 p-2">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border-b lg:hidden shadow-xl"
          >
            <div className="flex flex-col p-4 gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 text-gray-700 font-medium"
                >
                  {item.label}
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
