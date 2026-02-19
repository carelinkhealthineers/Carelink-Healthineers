
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, Shield, User } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const UserRegistry: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'buyer' : 'admin';
    if (!confirm(`Switch this user to ${newRole.toUpperCase()} privilege?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert(`Role transition failed: ${error.message}`);
    } else {
      fetchUsers();
    }
  };

  const filtered = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Operator Registry</h1>
          <p className="text-gray-500 font-medium">Configure access levels and administrative sovereignty</p>
        </div>
        <button onClick={fetchUsers} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 shadow-sm transition-all">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-8 flex items-center gap-4 shadow-sm">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Search by identity or contact node..." 
          className="flex-1 py-2 bg-transparent outline-none font-medium text-gray-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Profile Entity</th>
              <th className="px-8 py-5">Auth Protocol</th>
              <th className="px-8 py-5">Onboarding Date</th>
              <th className="px-8 py-5 text-right">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400'}`}>
                      {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{user.full_name || 'Anonymous User'}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => toggleRole(user.id, user.role)}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all"
                  >
                    Promote / Demote
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            No matching entities found in the current registry view.
          </div>
        )}
      </div>
    </div>
  );
};
