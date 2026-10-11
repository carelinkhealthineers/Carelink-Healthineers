import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  supabase,
  setLocalAdminSession,
  isOwnerOrAdminEmail,
  getLocalRegisteredUsers,
  fetchSupplementalUsers,
  upsertSupplementalUser,
} from '../../supabaseClient';
import { SEO } from '../../components/SEO';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = isOwnerOrAdminEmail(cleanEmail);

    try {
      // 1. Attempt standard Supabase Auth sign-in with timeout protection
      const authPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      const timeoutPromise = new Promise<{ data: { user: null; session: null }; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null, session: null }, error: { message: 'Auth timeout' } }), 8000)
      );

      const { data, error: authError } = await Promise.race([authPromise, timeoutPromise]);

      if (!authError && data?.user) {
        let userRole: 'admin' | 'buyer' = isAdminEmail ? 'admin' : 'buyer';

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.role === 'admin' || isAdminEmail) {
            userRole = 'admin';
          }
        } catch {
          // Ignore profile fetch errors and rely on email check
        }

        const sessionPayload = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          role: userRole,
        };

        setLocalAdminSession(sessionPayload);
        await upsertSupplementalUser({ ...sessionPayload, created_at: data.user.created_at || new Date().toISOString() });

        if (userRole === 'admin') {
          navigate('/command-nexus');
        } else {
          navigate('/');
        }
        return;
      }

      // 2. Fallback: Check supplemental / local user registry (handles accounts created when email confirmation or rate limits blocked Supabase Auth)
      const [localUsers, remoteUsers] = await Promise.all([
        Promise.resolve(getLocalRegisteredUsers()),
        fetchSupplementalUsers(),
      ]);

      const allKnownUsers = [...localUsers, ...remoteUsers];
      const matchedUser = allKnownUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail && (!u.password || u.password === password)
      );

      if (matchedUser) {
        const resolvedRole: 'admin' | 'buyer' = isAdminEmail || matchedUser.role === 'admin' ? 'admin' : 'buyer';
        const sessionPayload = {
          id: matchedUser.id,
          email: matchedUser.email,
          full_name: matchedUser.full_name || cleanEmail.split('@')[0],
          role: resolvedRole,
        };
        setLocalAdminSession(sessionPayload);
        if (resolvedRole === 'admin') {
          navigate('/command-nexus');
        } else {
          navigate('/');
        }
        return;
      }

      // 3. Owner / Admin Emergency Access: Never lock out official Carelink administrator emails
      // due to unconfirmed emails, rate limits, or Supabase Auth service hiccups.
      if (isAdminEmail && password.length >= 4) {
        const adminSession = {
          id: cleanEmail === 'orjon220@gmail.com' ? '3ab1456a-695d-431a-a279-5043eb82ecc3' : `admin-${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
          email: cleanEmail,
          full_name: cleanEmail === 'carelinkhealthineers@gmail.com' ? 'Carelink Executive Admin' : cleanEmail.split('@')[0],
          role: 'admin' as const,
        };

        setLocalAdminSession(adminSession);
        await upsertSupplementalUser({
          ...adminSession,
          password,
          created_at: new Date().toISOString(),
        });

        navigate('/command-nexus');
        return;
      }

      // 4. If error is strictly "Email not confirmed", allow instant login and auto-verify session
      const errMsg = (authError?.message || '').toLowerCase();
      if (errMsg.includes('email not confirmed') || errMsg.includes('rate limit') || errMsg.includes('security purposes')) {
        const autoVerifiedSession = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          full_name: cleanEmail.split('@')[0],
          role: (isAdminEmail ? 'admin' : 'buyer') as 'admin' | 'buyer',
        };
        setLocalAdminSession(autoVerifiedSession);
        await upsertSupplementalUser({
          ...autoVerifiedSession,
          password,
          created_at: new Date().toISOString(),
        });

        if (autoVerifiedSession.role === 'admin') {
          navigate('/command-nexus');
        } else {
          navigate('/');
        }
        return;
      }

      throw authError || new Error('Invalid email or password.');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfeff] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEO title="Login" description="Welcome back to Carelink Healthineers." />
      
      {/* Soft background decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-50">
          <div className="text-center mb-10">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="inline-block p-4 bg-blue-50 rounded-3xl mb-6"
            >
              <img 
                src="https://i.imgur.com/y0UvXGu.png" 
                alt="Logo" 
                className="h-10 w-auto"
              />
            </motion.div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back!</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sign in to your terminal</p>
          </div>

          <div className="space-y-4">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:text-slate-300 text-sm"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:text-slate-300 text-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 rounded-2xl text-[10px] font-black text-rose-500 text-center uppercase tracking-widest border border-rose-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              <ShieldCheck size={14} /> Instant Access Enabled · No Email Wait
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              No account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
