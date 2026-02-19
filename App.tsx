
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, Package, FolderTree, Mail, Settings, LogOut, Handshake, BookOpen, Users, Terminal } from 'lucide-react';
import { supabase } from './supabaseClient';

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
import { BlogList } from './pages/Public/BlogList';
import { BlogDetails } from './pages/Public/BlogDetails';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';

// Admin Pages
import { NexusDashboard } from './pages/Admin/NexusDashboard';
import { ProductArchitecture } from './pages/Admin/ProductArchitecture';
import { AllianceControl } from './pages/Admin/AllianceControl';
import { InquiryFlow } from './pages/Admin/InquiryFlow';
import { DivisionControl } from './pages/Admin/DivisionControl';
import { SystemSettings } from './pages/Admin/SystemSettings';
import { BlogArchitecture } from './pages/Admin/BlogArchitecture';
import { UserRegistry } from './pages/Admin/UserRegistry';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role || 'buyer');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/command-nexus');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] selection:bg-blue-600 selection:text-white transition-colors duration-500">
      {!isAdmin && <NeuralBackground />}
      {!isAdmin && <HUDOverlay />}
      {!isAdmin && <Navbar />}
      
      <main className={isAdmin ? 'bg-[#020408]' : 'min-h-screen'}>
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
            <Route path="/insights" element={<BlogList />} />
            <Route path="/insights/:blogSlug" element={<BlogDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/command-nexus/*" element={
              <ProtectedRoute adminOnly>
                <div className="flex min-h-screen bg-[#020408] border-t border-white/5">
                  {/* Dark Admin Sidebar */}
                  <div className="w-80 bg-[#05070a] text-white p-10 hidden lg:block sticky top-0 h-screen shrink-0 overflow-y-auto border-r border-white/5 custom-scrollbar">
                    <div className="flex items-center gap-4 mb-16 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                        <Terminal size={24} className="text-white" />
                      </div>
                      <div>
                        <span className="font-black text-xl block tracking-tighter">Command</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] -mt-1 opacity-70">Nexus v1.0</span>
                      </div>
                    </div>
                    
                    <nav className="space-y-2">
                      {[
                        { label: 'Overview', path: '/command-nexus', icon: <LayoutGrid size={18} /> },
                        { label: 'Products', path: '/command-nexus/architecture', icon: <Package size={18} /> },
                        { label: 'User Registry', path: '/command-nexus/users', icon: <Users size={18} /> },
                        { label: 'Insights', path: '/command-nexus/editorial', icon: <BookOpen size={18} /> },
                        { label: 'Alliances', path: '/command-nexus/alliances', icon: <Handshake size={18} /> },
                        { label: 'Inquiry Flow', path: '/command-nexus/inquiries', icon: <Mail size={18} /> },
                        { label: 'Divisions', path: '/command-nexus/divisions', icon: <FolderTree size={18} /> },
                        { label: 'Settings', path: '/command-nexus/settings', icon: <Settings size={18} /> },
                      ].map(item => (
                        <Link 
                          key={item.label} 
                          to={item.path}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            location.pathname === item.path 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                    </nav>

                    <div className="absolute bottom-10 left-10 right-10 space-y-3">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                      <Link to="/" className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                         Origin View
                      </Link>
                    </div>
                  </div>

                  {/* Dark Main Content Area */}
                  <div className="flex-1 overflow-auto bg-[#020408]">
                    <div className="max-w-[1600px] mx-auto min-h-screen">
                      <Routes>
                          <Route path="/" element={<NexusDashboard />} />
                          <Route path="/architecture" element={<ProductArchitecture />} />
                          <Route path="/users" element={<UserRegistry />} />
                          <Route path="/editorial" element={<BlogArchitecture />} />
                          <Route path="/alliances" element={<AllianceControl />} />
                          <Route path="/inquiries" element={<InquiryFlow />} />
                          <Route path="/divisions" element={<DivisionControl />} />
                          <Route path="/settings" element={<SystemSettings />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;
