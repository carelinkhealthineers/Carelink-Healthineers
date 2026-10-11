import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, RefreshCw, Shield, User, Terminal, Plus, X, Save, CheckCircle2 } from 'lucide-react';
import {
  supabase,
  fetchSupplementalUsers,
  upsertSupplementalUser,
  getLocalRegisteredUsers,
  isOwnerOrAdminEmail,
} from '../../supabaseClient';

export const UserRegistry: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'buyer' as 'admin' | 'buyer' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesRes, supplementalUsers] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .limit(10000)
          .order('created_at', { ascending: false }),
        fetchSupplementalUsers(),
      ]);

      const localUsers = getLocalRegisteredUsers();
      const mergedMap = new Map<string, any>();

      // Ensure official owner accounts are always present
      const defaultAdmins = [
        {
          id: 'owner-carelink',
          email: 'carelinkhealthineers@gmail.com',
          full_name: 'Carelink Executive Admin',
          role: 'admin',
          created_at: '2026-02-19T13:37:46.905104+00:00',
        },
      ];

      defaultAdmins.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
      (profilesRes.data || []).forEach(u => {
        if (u.email) mergedMap.set(u.email.toLowerCase(), u);
      });
      localUsers.forEach(u => {
        if (u.email) mergedMap.set(u.email.toLowerCase(), { ...mergedMap.get(u.email.toLowerCase()), ...u });
      });
      supplementalUsers.forEach(u => {
        if (u.email) mergedMap.set(u.email.toLowerCase(), { ...mergedMap.get(u.email.toLowerCase()), ...u });
      });

      const finalUsers = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setUsers(finalUsers);
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userObj: any) => {
    const newRole: 'admin' | 'buyer' = userObj.role === 'admin' ? 'buyer' : 'admin';
    if (!confirm(`Switch ${userObj.email} to ${newRole.toUpperCase()} privilege?`)) return;

    try {
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userObj.id);

      await upsertSupplementalUser({
        id: userObj.id,
        email: userObj.email,
        full_name: userObj.full_name || userObj.email.split('@')[0],
        role: newRole,
        password: userObj.password,
        created_at: userObj.created_at || new Date().toISOString(),
      });

      setUsers(prev => prev.map(u => (u.email === userObj.email ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    setIsSaving(true);
    try {
      const cleanEmail = newUser.email.trim().toLowerCase();
      const assignedRole = isOwnerOrAdminEmail(cleanEmail) ? 'admin' : newUser.role;
      const account = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        full_name: newUser.full_name.trim() || cleanEmail.split('@')[0],
        role: assignedRole,
        password: newUser.password,
        created_at: new Date().toISOString(),
      };
      await upsertSupplementalUser(account);
      setNewUser({ full_name: '', email: '', password: '', role: 'buyer' });
      setIsAddModalOpen(false);
      await fetchUsers();
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const emailMatch = u.email ? u.email.toLowerCase().includes(term) : false;
    const nameMatch = u.full_name ? u.full_name.toLowerCase().includes(term) : false;
    return emailMatch || nameMatch;
  });

  return (
    <div className="p-10 lg:p-16 bg-[#020408] text-white min-h-screen rounded-[2.5rem]">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Auth_Node: Operator_Registry</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Operator <span className="text-slate-700 italic">Registry.</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchUsers} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl cursor-pointer">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Plus size={18} /> Add Verified Operator
          </button>
        </div>
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
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                <th className="px-10 py-8">Operator Identity</th>
                <th className="px-10 py-8">Access Level</th>
                <th className="px-10 py-8">Registry Date</th>
                <th className="px-10 py-8 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(user => (
                <tr key={user.id || user.email} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${user.role === 'admin' ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-white/5 text-slate-400 border-white/5'}`}>
                        {user.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <div className="font-black text-white tracking-tight flex items-center gap-2">
                          {user.full_name || user.email?.split('@')[0] || 'OPERATOR'}
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-tighter mt-1">{user.email || 'NO_EMAIL_DETECTED'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : 'bg-white/5 text-slate-400 border-white/5'
                    }`}>
                      {user.role || 'BUYER'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-[10px] text-slate-400 font-bold tracking-widest">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'VERIFIED'}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => toggleRole(user)}
                      className="text-[9px] font-black text-slate-300 hover:text-white uppercase tracking-widest bg-white/5 hover:bg-blue-600 px-6 py-3 rounded-xl transition-all border border-white/5 group-hover:border-blue-500/30 cursor-pointer"
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

      {/* Add Verified Operator Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#05070a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-white">Create Verified Account</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Instant Access · No Email Verification Required</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateOperator} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Operator Name"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                    value={newUser.full_name}
                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="operator@carelinkhealthineers.com"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="Assign login password"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</label>
                  <select
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'buyer' })}
                  >
                    <option value="admin" className="bg-slate-900">Administrator (Full Command Nexus Access)</option>
                    <option value="buyer" className="bg-slate-900">Client / Buyer</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
