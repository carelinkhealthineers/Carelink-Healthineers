
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../supabaseClient';
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

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        navigate('/command-nexus');
      } else {
        navigate('/');
      }
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
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>

          <div className="mt-10 text-center">
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
