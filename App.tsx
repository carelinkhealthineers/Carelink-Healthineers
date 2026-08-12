
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Package, FolderTree, Mail, Settings, LogOut, Handshake, BookOpen, Users, Terminal, Globe, Menu, X, Home, ExternalLink, Video } from 'lucide-react';
import { supabase, performSignOut } from './supabaseClient';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

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
import { SEOControl } from './pages/Admin/SEOControl';
import { MeetingControl } from './pages/Admin/MeetingControl';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRoleForUser = async (userObj: any) => {
      if (!userObj) return null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userObj.id)
          .maybeSingle();

        if (profile?.role) {
          return profile.role;
        }

        // Auto-assign admin role for carelink owner email or admin-pattern emails
        const isOwnerAdmin = userObj.email === 'carelinkhealthineers@gmail.com' || userObj.email?.includes('admin');
        const assignedRole = isOwnerAdmin ? 'admin' : 'buyer';

        // Provision missing profile record in Supabase
        await supabase.from('profiles').upsert({
          id: userObj.id,
          email: userObj.email,
          full_name: userObj.user_metadata?.full_name || userObj.email?.split('@')[0] || 'Operator',
          role: assignedRole
        }, { onConflict: 'id' });

        return assignedRole;
      } catch (e) {
        console.warn('Profile fetch notice:', e);
        return userObj.email === 'carelinkhealthineers@gmail.com' ? 'admin' : 'buyer';
      }
    };

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (mounted) setUser(session.user);
          const r = await fetchRoleForUser(session.user);
          if (mounted) setRole(r);
        } else {
          if (mounted) {
            setUser(null);
            setRole(null);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        if (mounted) setUser(session.user);
        const r = await fetchRoleForUser(session.user);
        if (mounted) setRole(r);
      } else {
        if (mounted) {
          setUser(null);
          setRole(null);
        }
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Verifying Admin Permissions...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const NAV_ADMIN_ITEMS = [
  { label: 'Overview', path: '/command-nexus', icon: <LayoutGrid size={18} /> },
  { label: 'Products', path: '/command-nexus/architecture', icon: <Package size={18} /> },
  { label: 'User Registry', path: '/command-nexus/users', icon: <Users size={18} /> },
  { label: 'Insights', path: '/command-nexus/editorial', icon: <BookOpen size={18} /> },
  { label: 'Alliances', path: '/command-nexus/alliances', icon: <Handshake size={18} /> },
  { label: 'Inquiry Flow', path: '/command-nexus/inquiries', icon: <Mail size={18} /> },
  { label: 'Divisions', path: '/command-nexus/divisions', icon: <FolderTree size={18} /> },
  { label: 'SEO Matrix', path: '/command-nexus/seo', icon: <Globe size={18} /> },
  { label: 'Settings', path: '/command-nexus/settings', icon: <Settings size={18} /> },
];

const App: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/command-nexus');
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setAdminMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await performSignOut();
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-600 selection:text-white transition-colors duration-500">
      {!isAdmin && <Navbar />}
      
      <main className={isAdmin ? 'bg-white' : 'min-h-screen'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Origin />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:productSlug" element={<ProductDetails />} />
          <Route path="/alliances" element={<Alliances />} />
          <Route path="/acquisition" element={<Acquisition />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/foundation" element={<Foundation />} />
          <Route path="/interface" element={<Navigate to="/acquisition" replace />} />
          <Route path="/meeting/:roomCode" element={<Navigate to="/" replace />} />
          <Route path="/insights" element={<BlogList />} />
          <Route path="/insights/:blogSlug" element={<BlogDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route path="/command-nexus/*" element={
            <ProtectedRoute adminOnly>
              <div className="min-h-screen bg-white flex flex-col lg:flex-row">
                
                {/* Mobile Admin Header (Visible on Mobile/Tablet) */}
                <header className="lg:hidden sticky top-0 z-50 bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Terminal size={18} className="text-white" />
                    </div>
                    <span className="font-black text-sm tracking-tight">Command Nexus</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      to="/" 
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
                    >
                      <Home size={12} /> Origin View
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="px-3 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                    >
                      Sign Out
                    </button>
                    <button 
                      onClick={() => setAdminMobileOpen(!adminMobileOpen)}
                      className="p-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                    >
                      {adminMobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                  </div>
                </header>

                {/* Mobile Slide-Over Drawer */}
                <AnimatePresence>
                  {adminMobileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="lg:hidden fixed inset-x-0 top-[65px] z-40 bg-slate-900 text-white p-6 border-b border-slate-800 space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto"
                    >
                      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Navigation Matrix</div>
                      <nav className="space-y-1">
                        {NAV_ADMIN_ITEMS.map(item => (
                          <Link 
                            key={item.label} 
                            to={item.path}
                            onClick={() => setAdminMobileOpen(false)}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              location.pathname === item.path 
                              ? 'bg-blue-600 text-white' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </nav>

                      <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                        <Link 
                          to="/"
                          onClick={() => setAdminMobileOpen(false)}
                          className="w-full py-3 bg-slate-800 text-slate-200 text-xs font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2"
                        >
                          <Home size={14} /> Return to Homepage (Origin View)
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full py-3 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2"
                        >
                          <LogOut size={14} /> Sign Out of Admin
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Light Desktop Admin Sidebar */}
                <aside className="w-80 bg-slate-50 text-slate-800 p-10 hidden lg:flex flex-col justify-between sticky top-0 h-screen shrink-0 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                  <div>
                    <div className="flex items-center gap-4 mb-12 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                        <Terminal size={24} className="text-white" />
                      </div>
                      <div>
                        <span className="font-black text-xl block tracking-tighter text-slate-900">Command</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] -mt-1 opacity-70">Nexus v1.0</span>
                      </div>
                    </div>
                    
                    <nav className="space-y-1.5">
                      {NAV_ADMIN_ITEMS.map(item => (
                        <Link 
                          key={item.label} 
                          to={item.path}
                          className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            location.pathname === item.path 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="pt-8 border-t border-slate-200/60 space-y-2 mt-6">
                    <Link 
                      to="/" 
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs"
                    >
                       <Home size={14} /> Origin View (Homepage)
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-xs"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </aside>

                {/* Light Main Content Area */}
                <div className="flex-1 min-w-0 bg-white">
                  {/* Top Bar for Desktop */}
                  <header className="hidden lg:flex items-center justify-between px-10 py-5 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span className="text-blue-600">Admin</span> / <span className="text-slate-800">{location.pathname.split('/')[2] || 'Overview'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                       <Link 
                         to="/" 
                         className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 shadow-xs"
                       >
                         <Home size={13} /> Visit Public Site
                       </Link>
                       <button 
                         onClick={handleLogout}
                         className="px-5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 shadow-xs"
                       >
                         <LogOut size={13} /> Sign Out
                       </button>
                    </div>
                  </header>

                  <div className="max-w-[1600px] mx-auto min-h-screen p-6 lg:p-10">
                    <Routes>
                        <Route path="/" element={<NexusDashboard />} />
                        <Route path="/meetings" element={<Navigate to="/command-nexus" replace />} />
                        <Route path="/architecture" element={<ProductArchitecture />} />
                        <Route path="/users" element={<UserRegistry />} />
                        <Route path="/editorial" element={<BlogArchitecture />} />
                        <Route path="/alliances" element={<AllianceControl />} />
                        <Route path="/inquiries" element={<InquiryFlow />} />
                        <Route path="/divisions" element={<DivisionControl />} />
                        <Route path="/seo" element={<SEOControl />} />
                        <Route path="/settings" element={<SystemSettings />} />
                    </Routes>
                  </div>
                </div>

              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;

