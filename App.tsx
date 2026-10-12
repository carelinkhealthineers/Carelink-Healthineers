
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Package, FolderTree, Mail, Settings, LogOut, Handshake, BookOpen, Users, Terminal, Globe, Menu, X, Home, ExternalLink } from 'lucide-react';
import { supabase, performSignOut, getSafeSession, clearStaleAuthStorage } from './supabaseClient';
import { recordPageView, recordAnalyticsEvent, recordSessionEngagement } from './utils/analyticsTracker';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalLoader } from './components/GlobalLoader';
import { FloatingContactWidget } from './components/FloatingContactWidget';

// Public Pages
import { Origin } from './pages/Public/Origin';
import { Divisions } from './pages/Public/Divisions';
import { Portfolio } from './pages/Public/Portfolio';
import { ProductDetails } from './pages/Public/ProductDetails';
import { Alliances } from './pages/Public/Alliances';
import { Acquisition } from './pages/Public/Acquisition';
import { Intelligence } from './pages/Public/Intelligence';
import { Foundation } from './pages/Public/Foundation';
import { BlogList } from './pages/Public/BlogList';
import { BlogDetails } from './pages/Public/BlogDetails';
import { PrivacyPolicy } from './pages/Public/Privacypolicy';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';

// Admin Pages
import { NexusDashboard } from './pages/Admin/NexusDashboard';
import { ProductArchitecture } from './pages/Admin/ProductArchitecture';
import { InquiryFlow } from './pages/Admin/InquiryFlow';
import { DivisionControl } from './pages/Admin/DivisionControl';
import { SystemSettings } from './pages/Admin/SystemSettings';
import { BlogArchitecture } from './pages/Admin/BlogArchitecture';
import { UserRegistry } from './pages/Admin/UserRegistry';
import { SEOControl } from './pages/Admin/SEOControl';
import { HomepageControl } from './pages/Admin/HomepageControl';

// Protected Route Component — verifies real Supabase Auth session and public.profiles role
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Clean up any legacy insecure localStorage keys from previous builds
    try {
      localStorage.removeItem('carelink_verified_admin_session');
      localStorage.removeItem('carelink_local_registered_users');
    } catch {}

    const fetchVerifiedProfileRole = async (userObj: any) => {
      if (!userObj?.id) {
        if (mounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userObj.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to verify profile role from database:', error.message);
        }

        if (mounted) {
          setRole(profile?.role || 'buyer');
          setLoading(false);
        }
      } catch (e) {
        console.error('Unexpected role verification error:', e);
        if (mounted) {
          setRole('buyer');
          setLoading(false);
        }
      }
    };

    const syncAuthState = async () => {
      try {
        const session = await getSafeSession();
        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session.user);
        }
        await fetchVerifiedProfileRole(session.user);
      } catch (err) {
        console.error('Auth check error:', err);
        clearStaleAuthStorage();
        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    };

    syncAuthState();

    // Keep onAuthStateChange callback synchronous and defer DB query via setTimeout
    // to adhere to Supabase JS v2 best practices.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          fetchVerifiedProfileRole(session.user);
        }, 0);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <GlobalLoader />;

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const NAV_ADMIN_ITEMS = [
  { label: 'Overview', path: '/command-nexus', icon: <LayoutGrid size={18} /> },
  { label: 'Homepage Control', path: '/command-nexus/homepage', icon: <Home size={18} /> },
  { label: 'Products', path: '/command-nexus/architecture', icon: <Package size={18} /> },
  { label: 'User Registry', path: '/command-nexus/users', icon: <Users size={18} /> },
  { label: 'Insights', path: '/command-nexus/editorial', icon: <BookOpen size={18} /> },
  { label: 'Inquiry Flow', path: '/command-nexus/inquiries', icon: <Mail size={18} /> },
  { label: 'Divisions', path: '/command-nexus/divisions', icon: <FolderTree size={18} /> },
  { label: 'SEO Matrix', path: '/command-nexus/seo', icon: <Globe size={18} /> },
  { label: 'Settings', path: '/command-nexus/settings', icon: <Settings size={18} /> },
];

const App: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/command-nexus');
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setAdminMobileOpen(false);
    if (location.pathname.startsWith('/command-nexus')) {
      setPageLoading(false);
      return;
    }
    recordPageView(location.pathname);
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleGlobalLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        recordAnalyticsEvent('whatsapp_click', { routePath: window.location.pathname });
        return;
      }
      if (href.startsWith('tel:')) {
        recordAnalyticsEvent('phone_click', { routePath: window.location.pathname });
        return;
      }
      if (href.startsWith('mailto:')) {
        recordAnalyticsEvent('email_click', { routePath: window.location.pathname });
        return;
      }

      if (
        href.startsWith('#') ||
        href.startsWith('/command-nexus') ||
        anchor.target === '_blank'
      ) {
        return;
      }
      setPageLoading(true);
      setTimeout(() => {
        setPageLoading(false);
      }, 450);
    };

    const startTime = Date.now();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !window.location.pathname.startsWith('/command-nexus')) {
        const elapsedSec = Math.round((Date.now() - startTime) / 1000);
        if (elapsedSec >= 4) {
          recordSessionEngagement(elapsedSec);
        }
      }
    };

    document.addEventListener('click', handleGlobalLinkClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('click', handleGlobalLinkClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogout = async () => {
    await performSignOut();
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-600 selection:text-white transition-colors duration-500">
      <AnimatePresence>
        {pageLoading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GlobalLoader />
          </motion.div>
        )}
      </AnimatePresence>
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
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/Privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/Public/Privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/information" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/use" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/sharing" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/security" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/cookies" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/rights" element={<Navigate to="/privacypolicy" replace />} />
          <Route path="/interface" element={<Navigate to="/acquisition" replace />} />
          <Route path="/meeting/:roomCode" element={<Navigate to="/" replace />} />
          <Route path="/insights" element={<BlogList />} />
          <Route path="/insights/:blogSlug" element={<BlogDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route path="/command-nexus/*" element={
            <ProtectedRoute adminOnly>
              <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col lg:flex-row selection:bg-blue-600/30 selection:text-white">
                
                {/* Mobile Admin Header */}
                <header className="lg:hidden sticky top-0 z-50 bg-[#0c1017]/90 backdrop-blur-xl text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1a2130] shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <LayoutGrid size={16} className="text-white" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm tracking-tight text-white block leading-none">Carelink Hub</span>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5 block flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      to="/" 
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <Home size={12} /> Site
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all"
                    >
                      Exit
                    </button>
                    <button 
                      onClick={() => setAdminMobileOpen(!adminMobileOpen)}
                      className="p-2 bg-[#141a26] text-slate-200 rounded-xl border border-[#222b3d]"
                    >
                      {adminMobileOpen ? <X size={18} /> : <Menu size={18} />}
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
                      className="lg:hidden fixed inset-x-0 top-[56px] z-40 bg-[#0c1017]/95 backdrop-blur-2xl text-white p-5 border-b border-[#1a2130] space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto"
                    >
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-slate-500 px-2">Navigation</div>
                      <nav className="space-y-1">
                        {NAV_ADMIN_ITEMS.map(item => (
                          <Link 
                            key={item.label} 
                            to={item.path}
                            onClick={() => setAdminMobileOpen(false)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                              location.pathname === item.path 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                      </nav>

                      <div className="pt-3 border-t border-[#1a2130] flex flex-col gap-2">
                        <Link 
                          to="/"
                          onClick={() => setAdminMobileOpen(false)}
                          className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-white/5"
                        >
                          <Home size={14} /> Public Website
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full py-2.5 bg-rose-500/15 text-rose-300 border border-rose-500/20 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stylish Dark Desktop Admin Sidebar */}
                <aside className="w-72 bg-[#090c13] text-slate-300 p-6 hidden lg:flex flex-col justify-between sticky top-0 h-screen shrink-0 border-r border-[#171c26] overflow-y-auto custom-scrollbar">
                  <div>
                    {/* Cute Brand Header Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0c0f18] border border-[#1e2536] mb-6 flex items-center gap-3 shadow-lg shadow-black/40">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                        <LayoutGrid size={18} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-white tracking-tight truncate">Carelink Admin</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Workspace</span>
                        </div>
                      </div>
                    </div>
                    
                    <nav className="space-y-1">
                      {NAV_ADMIN_ITEMS.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link 
                            key={item.label} 
                            to={item.path}
                            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                              isActive 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold' 
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Cute Bottom Controls */}
                  <div className="pt-5 border-t border-[#171c26] space-y-2 mt-6">
                    <Link 
                      to="/" 
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-[#1e2536] rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all shadow-xs"
                    >
                       <Home size={13} className="text-blue-400" /> Public Website
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 transition-all shadow-xs cursor-pointer"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </aside>

                {/* Stylish Dark Main Content Area */}
                <div className="flex-1 min-w-0 bg-[#07090e]">
                  {/* Top Bar for Desktop */}
                  <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#090c13]/70 backdrop-blur-xl border-b border-[#171c26]">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                       <span className="text-blue-400">Carelink</span>
                       <span className="text-slate-600">/</span>
                       <span className="text-white capitalize">
                         {location.pathname.split('/')[2]?.replace('-', ' ') || 'Overview'}
                       </span>
                    </div>

                    <div className="flex items-center gap-3">
                       <Link 
                         to="/" 
                         className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e2536] rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2 shadow-xs"
                       >
                         <Home size={13} className="text-blue-400" /> View Website
                       </Link>
                       <button 
                         onClick={handleLogout}
                         className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                       >
                         <LogOut size={13} /> Sign Out
                       </button>
                    </div>
                  </header>

                  <div className="max-w-[1600px] mx-auto min-h-screen p-5 lg:p-8">
                    <Routes>
                        <Route path="/" element={<NexusDashboard />} />
                        <Route path="/homepage" element={<HomepageControl />} />
                        <Route path="/meetings" element={<Navigate to="/command-nexus" replace />} />
                        <Route path="/architecture" element={<ProductArchitecture />} />
                        <Route path="/users" element={<UserRegistry />} />
                        <Route path="/editorial" element={<BlogArchitecture />} />
                        <Route path="/alliances" element={<Navigate to="/command-nexus" replace />} />
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
      {!isAdmin && <FloatingContactWidget />}
    </div>
  );
};

export default App;

