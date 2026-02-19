
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Users, Mail, Activity, ArrowUpRight, TrendingUp, Loader2, RefreshCw, Terminal } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const NexusDashboard: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, inquiries: 0, alliances: 0, pending: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Calculate date for 6 months ago
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const [recentProductsRes, recentInquiriesRes, pCountRes, iCountRes, aCountRes, pendCountRes] = await Promise.all([
        supabase.from('products').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('inquiries').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }),
        supabase.from('alliances').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        products: pCountRes.count || 0,
        inquiries: iCountRes.count || 0,
        alliances: aCountRes.count || 0,
        pending: pendCountRes.count || 0
      });

      // Generate dynamic chart data for the last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dataMap = new Map();
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        dataMap.set(key, { 
          name: months[d.getMonth()], 
          sortVal: d.getTime(),
          inquiries: 0, 
          products: 0 
        });
      }

      const processEntries = (entries: any[], type: 'products' | 'inquiries') => {
        entries.forEach(entry => {
          if (!entry.created_at) return;
          const d = new Date(entry.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (dataMap.has(key)) {
            dataMap.get(key)[type]++;
          }
        });
      };

      processEntries(recentProductsRes.data || [], 'products');
      processEntries(recentInquiriesRes.data || [], 'inquiries');

      const finalChartData = Array.from(dataMap.values()).sort((a, b) => a.sortVal - b.sortVal);
      setChartData(finalChartData);

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
    <div className="p-10 lg:p-16">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Node_Status: Nominal</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Command <span className="text-slate-700 italic">Overview.</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchStats} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
             System Diagnostics
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Total Assets', val: stats.products, icon: <Package size={20} />, change: 'LIVE', color: 'blue' },
          { label: 'Active Inquiries', val: stats.inquiries, icon: <Mail size={20} />, change: `${stats.pending} Pending`, color: 'indigo' },
          { label: 'Global Alliances', val: stats.alliances, icon: <Users size={20} />, change: 'STABLE', color: 'emerald' },
          { label: 'Platform Pulse', val: 'NOMINAL', icon: <Activity size={20} />, change: '99.9%', color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative group hover:border-blue-500/30 transition-all shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 rounded-2xl bg-white/5 text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                 {stat.icon}
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                <TrendingUp size={12} /> {stat.change}
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="animate-spin text-slate-800" size={32} />
            ) : (
              <div className="text-3xl font-black text-white tracking-tighter mb-2">{stat.val}</div>
            )}
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Inquiry Flow Chart */}
        <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Inquiry_Traffic_Metrics</h3>
            <Terminal size={14} className="text-slate-800" />
          </div>
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                 <Loader2 className="animate-spin text-slate-700" size={40} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#475569', fontWeight: 900 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#475569', fontWeight: 900 }} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                    contentStyle={{ backgroundColor: '#020408', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                  />
                  <Bar dataKey="inquiries" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Growth Curve Chart */}
        <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Asset_Growth_Coefficient</h3>
            <Activity size={14} className="text-slate-800" />
          </div>
          <div className="h-80 w-full">
            {isLoading ? (
               <div className="w-full h-full flex items-center justify-center">
                 <Loader2 className="animate-spin text-slate-700" size={40} />
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#475569', fontWeight: 900 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#475569', fontWeight: 900 }} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020408', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="products" 
                    stroke="#3B82F6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
