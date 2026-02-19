
import React from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, Package, FolderTree, Mail, Settings, LogOut, Handshake } from 'lucide-react';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NeuralBackground } from './components/NeuralBackground';
import { HUDOverlay } from './components/HUDOverlay';

// Public Pages
import { Origin } from './pages/Public/Origin';
import { Divisions } from './pages/Public/Divisions';
import { Portfolio } from './pages/Public/Portfolio';
import { ProductDetails } from './pages/Public/ProductDetails';
import { Alliances } from './pages/Public/Alliances';
import { Acquisition } from './pages/Public/Acquisition';
import { Intelligence } from './pages/Public/Intelligence';
import { Foundation } from './pages/Public/Foundation';
import { Interface } from './pages/Public/Interface';

// Admin Pages
import { NexusDashboard } from './pages/Admin/NexusDashboard';
import { ProductArchitecture } from './pages/Admin/ProductArchitecture';
import { AllianceControl } from './pages/Admin/AllianceControl';
import { InquiryFlow } from './pages/Admin/InquiryFlow';
import { DivisionControl } from './pages/Admin/DivisionControl';
import { SystemSettings } from './pages/Admin/SystemSettings';

const App: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/command-nexus');

  return (
    <div className="min-h-screen bg-[#020408] selection:bg-blue-600 selection:text-white transition-colors duration-500">
      {!isAdmin && <NeuralBackground />}
      {!isAdmin && <HUDOverlay />}
      {!isAdmin && <Navbar />}
      
      <main className={isAdmin ? '' : 'min-h-screen'}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Origin />} />
            <Route path="/divisions" element={<Divisions />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:productSlug" element={<ProductDetails />} />
            <Route path="/alliances" element={<Alliances />} />
            <Route path="/acquisition" element={<Acquisition />} />
            <Route path="/intelligence" element={<Intelligence />} />
            <Route path="/foundation" element={<Foundation />} />
            <Route path="/interface" element={<Interface />} />

            {/* Admin Routes */}
            <Route path="/command-nexus/*" element={
              <div className="flex min-h-screen bg-gray-50/50">
                <div className="w-72 bg-gray-900 text-white p-8 hidden lg:block sticky top-0 h-screen shrink-0 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-3 mb-12">
                    <img src="https://i.imgur.com/y0UvXGu.png" alt="Nexus Logo" className="w-12 h-12 object-contain" />
                    <div>
                      <span className="font-black text-lg block tracking-tighter">Command</span>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest -mt-1">Nexus v1.0</span>
                    </div>
                  </div>
                  
                  <nav className="space-y-1.5">
                    {[
                      { label: 'Overview Matrix', path: '/command-nexus', icon: <LayoutGrid size={18} /> },
                      { label: 'Product Architecture', path: '/command-nexus/architecture', icon: <Package size={18} /> },
                      { label: 'Alliance Matrix', path: '/command-nexus/alliances', icon: <Handshake size={18} /> },
                      { label: 'Inquiry Flow', path: '/command-nexus/inquiries', icon: <Mail size={18} /> },
                      { label: 'Division Control', path: '/command-nexus/divisions', icon: <FolderTree size={18} /> },
                      { label: 'System Config', path: '/command-nexus/settings', icon: <Settings size={18} /> },
                    ].map(item => (
                      <Link 
                        key={item.label} 
                        to={item.path}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                          location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="absolute bottom-8 left-8 right-8">
                    <Link to="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-800 rounded-2xl text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                      <LogOut size={14} /> Exit Nexus
                    </Link>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-white">
                   <Routes>
                      <Route path="/" element={<NexusDashboard />} />
                      <Route path="/architecture" element={<ProductArchitecture />} />
                      <Route path="/alliances" element={<AllianceControl />} />
                      <Route path="/inquiries" element={<InquiryFlow />} />
                      <Route path="/divisions" element={<DivisionControl />} />
                      <Route path="/settings" element={<SystemSettings />} />
                   </Routes>
                </div>
              </div>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;
