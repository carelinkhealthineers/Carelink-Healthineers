
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Users, Mail, Activity, ArrowUpRight, TrendingUp } from 'lucide-react';

const DATA = [
  { name: 'Jan', inquiries: 45, products: 12 },
  { name: 'Feb', inquiries: 52, products: 15 },
  { name: 'Mar', inquiries: 61, products: 22 },
  { name: 'Apr', inquiries: 58, products: 25 },
  { name: 'May', inquiries: 85, products: 28 },
  { name: 'Jun', inquiries: 92, products: 35 },
];

export const NexusDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Command Nexus</h1>
          <p className="text-gray-500 font-medium">Platform Overview & Matrix Intelligence</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
            Export Matrix
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
            System Config
          </button>
        </div>
      </header>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Products', val: '1,284', icon: <Package />, color: 'blue', change: '+12%' },
          { label: 'Active Inquiries', val: '458', icon: <Mail />, color: 'indigo', change: '+24%' },
          { label: 'Network Partners', val: '86', icon: <Users />, color: 'emerald', change: '+5%' },
          { label: 'System Health', val: '99.9%', icon: <Activity />, color: 'rose', change: 'Stable' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                {/* Fix: cast to React.ReactElement with explicit props to avoid TS error on 'size' property */}
                {React.cloneElement(stat.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                <TrendingUp size={12} /> {stat.change}
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.val}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900">Inquiry Flow Architecture</h3>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">Last 6 Months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="inquiries" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900">Content Engine Distribution</h3>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">Global Reach</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="products" stroke="#6366F1" strokeWidth={4} dot={{ r: 6, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-8 border-b">
          <h3 className="font-bold text-gray-900">Critical Inquiry Stream</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Equipment</th>
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Dr. Aris Varma', org: 'City General', prod: 'KF92 Hematology', time: '12m ago', status: 'Priority' },
                { name: 'Sarah Chen', org: 'Alpha Diagnostics', prod: 'Digital X-Ray DRX', time: '2h ago', status: 'Pending' },
                { name: 'Robert Steel', org: 'Dental Care Ltd', prod: 'Elite Chair Unit', time: '5h ago', status: 'Archived' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.org}</div>
                  </td>
                  <td className="px-8 py-6 font-medium text-gray-600">{item.prod}</td>
                  <td className="px-8 py-6 text-xs text-gray-400 font-bold">{item.time}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                      item.status === 'Priority' ? 'bg-rose-50 text-rose-600' : 
                      item.status === 'Pending' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
