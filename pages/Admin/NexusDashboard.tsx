
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Users, Mail, Activity, ArrowUpRight, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const DATA = [
  { name: 'Jan', inquiries: 45, products: 12 },
  { name: 'Feb', inquiries: 52, products: 15 },
  { name: 'Mar', inquiries: 61, products: 22 },
  { name: 'Apr', inquiries: 58, products: 25 },
  { name: 'May', inquiries: 85, products: 28 },
  { name: 'Jun', inquiries: 92, products: 35 },
];

export const NexusDashboard: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, inquiries: 0, alliances: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [pRes, iRes, aRes, pendRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('alliances').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);
      setStats({
        products: pRes.count || 0,
        inquiries: iRes.count || 0,
        alliances: aRes.count || 0,
        pending: pendRes.count || 0
      });
    } catch (err) {
      console.error('Stats Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Command Nexus</h1>
          <p className="text-gray-500 font-medium">Real-time Platform Intelligence</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStats} className="p-3 bg-white border rounded-xl text-gray-400 hover:text-blue-600 transition-all">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">System Config</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Products', val: stats.products, icon: <Package />, color: 'blue', change: '+12%' },
          { label: 'Active Inquiries', val: stats.inquiries, icon: <Mail />, color: 'indigo', change: `+${stats.pending} New` },
          { label: 'Network Partners', val: stats.alliances, icon: <Users />, color: 'emerald', change: 'Stable' },
          { label: 'Platform Status', val: 'Nominal', icon: <Activity />, color: 'rose', change: '99.9%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-slate-50 text-blue-600`}>{stat.icon}</div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                <TrendingUp size={12} /> {stat.change}
              </div>
            </div>
            {isLoading ? <Loader2 className="animate-spin text-gray-200" /> : <div className="text-2xl font-black text-gray-900">{stat.val}</div>}
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 mb-8">Inquiry Flow Architecture</h3>
          <div className="h-72 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="inquiries" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 mb-8">Asset Growth Distribution</h3>
          <div className="h-72 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <LineChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="products" stroke="#6366F1" strokeWidth={4} dot={{ r: 6, fill: '#6366F1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
