
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, Inbox, Sparkles } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { SEO } from '../../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfeff] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEO title="Sign Up" description="Join Carelink Healthineers today." />
      
      {/* Soft background decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="signup-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-50"
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block p-4 bg-indigo-50 rounded-3xl mb-6 text-indigo-600"
                >
                  <Sparkles size={28} />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Join us!</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Start your journey today</p>
              </div>

              <div className="space-y-4">
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:text-slate-300 text-sm"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
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
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:text-slate-300 text-sm"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
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
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Get Started <ArrowRight size={18} /></>}
                  </button>
                </form>
              </div>

              <div className="mt-10 text-center">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  Have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-50 text-center"
            >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Inbox size={48} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Check ur mail!</h2>
              <p className="text-slate-400 font-medium leading-relaxed mb-10">
                We've sent a magic link to <span className="text-slate-900 font-black">{email}</span>.<br />
                Please confirm it to finalize your registration.
              </p>
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                >
                  Go to Login
                </Link>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Didn't get it? Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
