import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  User,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { supabase, classifySupabaseError } from '../../supabaseClient';

export const UserRegistry: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorBanner, setErrorBanner] = useState<{ title: string; message: string } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10000)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setErrorBanner(classifySupabaseError(err));
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

    setErrorBanner(null);
    setSuccessToast(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        setErrorBanner({
          title: 'Update Blocked',
          message: 'Could not modify role in public.profiles. Check database permissions.',
        });
        return;
      }

      setSuccessToast(`Role updated to ${newRole.toUpperCase()}`);
      setTimeout(() => setSuccessToast(null), 3000);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setErrorBanner(classifySupabaseError(err));
    }
  };

  const filtered = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const emailMatch = u.email ? u.email.toLowerCase().includes(term) : false;
    const nameMatch = u.full_name ? u.full_name.toLowerCase().includes(term) : false;
    return emailMatch || nameMatch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Cute Header Card */}
      <header className="p-6 lg:p-8 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                User Registry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {users.length} accounts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage registered operators and account roles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successToast && (
            <div className="px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} />
              <span>{successToast}</span>
            </div>
          )}

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin text-blue-400' : ''}
            />
          </button>
        </div>
      </header>

      {errorBanner && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          <span>{errorBanner.message}</span>
        </div>
      )}

      {/* Cute Search Bar */}
      <div className="p-3 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex items-center gap-3">
        <Search className="text-slate-500 ml-2 shrink-0" size={18} />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="flex-1 py-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cute Users Table Card */}
      <div className="rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#07090e]/60 border-b border-[#1d2436] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d2436]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span>Loading user accounts...</span>
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            user.role === 'admin'
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : 'bg-white/5 text-slate-400 border border-white/5'
                          }`}
                        >
                          {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">
                            {user.full_name || 'Anonymous User'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {user.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          user.role === 'admin'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {user.role || 'buyer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-[#21293d] text-xs font-semibold transition-all cursor-pointer"
                      >
                        Switch to {user.role === 'admin' ? 'Buyer' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center text-slate-500 text-xs font-medium">
            No matching users found.
          </div>
        )}
      </div>
    </div>
  );
};
