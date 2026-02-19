
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, Shield, User, Terminal } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const UserRegistry: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10000)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
      }
      
      if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'buyer' : 'admin';
    if (!confirm(`Switch this user to ${newRole.toUpperCase()} privilege?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        alert(`Role transition failed: ${error.message}`);
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const filtered = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const emailMatch = u.email ? u.email.toLowerCase().includes(term) : false;
    const nameMatch = u.full_name ? u.full_name.toLowerCase().includes(term) : false;
    return emailMatch || nameMatch;
  });

  return (
    <div className="p-10 lg:p-16 text-white min-h-screen">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Auth_Node: Operator_Registry</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Operator <span className="text-slate-700 italic">Registry.</span></h1>
        </div>
        <button onClick={fetchUsers} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="relative group mb-16">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="QUERY OPERATOR BY IDENTITY OR EMAIL..." 
          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-[10px] font-black text-white placeholder:text-slate-800 uppercase tracking-widest outline-none focus:border-blue-600 focus:bg-white/[0.04] transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white/[0.01] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
                <th className="px-10 py-8">Operator Identity</th>
                <th className="px-10 py-8">Access Level</th>
                <th className="px-10 py-8">Registry Date</th>
                <th className="px-10 py-8 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${user.role === 'admin' ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-white/5 text-slate-700 border-white/5'}`}>
                        {user.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <div className="font-black text-white tracking-tight">{user.full_name || 'ANONYMOUS_ENTITY'}</div>
                        <div className="text-[10px] text-slate-600 font-mono tracking-tighter mt-1">{user.email || 'NO_EMAIL_DETECTED'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : 'bg-white/5 text-slate-600 border-white/5'
                    }`}>
                      {user.role || 'GUEST'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-[10px] text-slate-500 font-bold tracking-widest">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'UNKNOWN'}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => toggleRole(user.id, user.role)}
                      className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest bg-white/5 hover:bg-blue-600 px-6 py-3 rounded-xl transition-all border border-white/5 group-hover:border-blue-500/30"
                    >
                      Shift_Permission
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="py-32 text-center opacity-20">
            <Terminal className="mx-auto mb-6" size={48} />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No matching entities found in registry.</p>
          </div>
        )}
      </div>
    </div>
  );
};
