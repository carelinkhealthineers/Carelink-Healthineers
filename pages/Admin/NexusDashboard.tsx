import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Package,
  Users,
  Mail,
  Activity,
  TrendingUp,
  Loader2,
  RefreshCw,
  Terminal,
  Home,
  Eye,
  Trophy,
  Globe,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import {
  fetchSiteAnalytics,
  SiteTrafficAnalytics,
  ProductViewMetric,
} from '../../utils/analyticsTracker';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home Page (Origin)',
  '/portfolio': 'Equipment Catalog (/portfolio)',
  '/portfolio/[product]': 'Product Detail Pages',
  '/acquisition': 'Quote Request Page (/acquisition)',
  '/divisions': 'Clinical Divisions (/divisions)',
  '/alliances': 'Global Partners (/alliances)',
  '/insights': 'Medical Insights (/insights)',
  '/insights/[article]': 'Insight Articles',
  '/foundation': 'Corporate Profile (/foundation)',
};

export const NexusDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    inquiries: 0,
    alliances: 0,
    pending: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [dailyTrafficData, setDailyTrafficData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<SiteTrafficAnalytics | null>(null);
  const [rankedProducts, setRankedProducts] = useState<ProductViewMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const [
        allProductsRes,
        recentInquiriesRes,
        pCountRes,
        iCountRes,
        aCountRes,
        pendCountRes,
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('inquiries')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }),
        supabase.from('alliances').select('id', { count: 'exact', head: true }),
        supabase
          .from('inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      const catalogProducts: Product[] = allProductsRes.data || [];

      setStats({
        products: pCountRes.count || catalogProducts.length || 0,
        inquiries: iCountRes.count || 0,
        alliances: aCountRes.count || 0,
        pending: pendCountRes.count || 0,
      });

      // Load live traffic & product views analytics
      const trafficData = await fetchSiteAnalytics(catalogProducts);
      setAnalytics(trafficData);

      // Sort products by highest view count
      const sortedProdMetrics = Object.values(trafficData.productViews).sort(
        (a, b) => b.views - a.views || a.name.localeCompare(b.name)
      );
      setRankedProducts(sortedProdMetrics);

      // Build last 7 days daily traffic chart data
      const shortMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const today = new Date();
      const dailyPoints: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const entry = trafficData.dailyHistory[key] || {
          pageViews: 0,
          productViews: 0,
        };
        dailyPoints.push({
          date: key,
          label: `${shortMonths[d.getMonth()]} ${d.getDate()}`,
          pageViews: entry.pageViews,
          productViews: entry.productViews,
        });
      }
      setDailyTrafficData(dailyPoints);

      // Build 6-month inquiry & product chart data
      const dataMap = new Map();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        dataMap.set(key, {
          name: shortMonths[d.getMonth()],
          sortVal: d.getTime(),
          inquiries: 0,
          products: 0,
        });
      }

      const processEntries = (
        entries: any[],
        type: 'products' | 'inquiries'
      ) => {
        entries.forEach((entry) => {
          if (!entry.created_at) return;
          const d = new Date(entry.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (dataMap.has(key)) {
            dataMap.get(key)[type]++;
          }
        });
      };

      processEntries(catalogProducts, 'products');
      processEntries(recentInquiriesRes.data || [], 'inquiries');

      const finalChartData = Array.from(dataMap.values()).sort(
        (a, b) => a.sortVal - b.sortVal
      );
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

  const todayKey = new Date().toISOString().split('T')[0];
  const todayViews = analytics?.dailyHistory?.[todayKey]?.pageViews || 0;
  const todayProdViews = analytics?.dailyHistory?.[todayKey]?.productViews || 0;
  const topViewedProduct = rankedProducts.find((p) => p.views > 0) || rankedProducts[0];
  const maxProductViews = Math.max(
    1,
    ...rankedProducts.map((p) => p.views || 0)
  );
  const totalTrackedProdViews = Math.max(
    1,
    rankedProducts.reduce((sum, p) => sum + (p.views || 0), 0)
  );

  const sortedRoutes = Object.entries(analytics?.routeViews || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="p-10 lg:p-16 bg-[#020408] text-white min-h-screen rounded-[2.5rem] space-y-14">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">
              Node_Status: Live Traffic &amp; Asset Telemetry
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Command <span className="text-slate-700 italic">Overview.</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchStats}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Live Traffic & Metrics"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/command-nexus/homepage"
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2.5"
          >
            <Home size={15} /> Homepage Control
          </Link>
        </div>
      </header>

      {/* Top KPI Cards: Website Views, Product Views, Most Viewed Product, Active Inquiries */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* Card 1: Total Website Traffic Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative group hover:border-blue-500/30 transition-all shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Eye size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp size={12} /> +{todayViews} Today
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="animate-spin text-slate-800" size={32} />
          ) : (
            <div className="text-4xl font-black text-white tracking-tighter mb-2 font-mono tabular-nums">
              {(analytics?.totalPageViews || 0).toLocaleString()}
            </div>
          )}
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Total Website Views
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-2">
            Unique Sessions: <strong className="text-slate-300">{(analytics?.uniqueVisitors || 0).toLocaleString()}</strong>
          </div>
        </motion.div>

        {/* Card 2: Total Product Page Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative group hover:border-indigo-500/30 transition-all shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Package size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              +{todayProdViews} Today
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="animate-spin text-slate-800" size={32} />
          ) : (
            <div className="text-4xl font-black text-white tracking-tighter mb-2 font-mono tabular-nums">
              {(analytics?.totalProductViews || 0).toLocaleString()}
            </div>
          )}
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Product Detail Views
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-2">
            Across <strong className="text-slate-300">{stats.products}</strong> Active Catalog Products
          </div>
        </motion.div>

        {/* Card 3: #1 Most Viewed Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-transparent p-8 rounded-[2.5rem] border border-amber-500/25 relative group hover:border-amber-400/50 transition-all shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="p-4 rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <Trophy size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/30">
              <Star size={11} className="fill-amber-400 text-amber-400" /> #1 Most Viewed
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="animate-spin text-slate-800" size={32} />
          ) : topViewedProduct ? (
            <>
              <div className="text-lg font-black text-white tracking-tight line-clamp-1 mb-1">
                {topViewedProduct.name}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                  {topViewedProduct.views.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Views · {topViewedProduct.modelNumber}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm font-bold text-slate-500 py-2">
              No product views yet
            </div>
          )}
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Top Performing Equipment
          </div>
        </motion.div>

        {/* Card 4: Active Inquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative group hover:border-emerald-500/30 transition-all shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Mail size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {stats.pending} Pending
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="animate-spin text-slate-800" size={32} />
          ) : (
            <div className="text-4xl font-black text-white tracking-tighter mb-2 font-mono tabular-nums">
              {stats.inquiries.toLocaleString()}
            </div>
          )}
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Total Quote Inquiries
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-2">
            Alliances: <strong className="text-slate-300">{stats.alliances}</strong> Partners
          </div>
        </motion.div>
      </div>

      {/* Charts Row: Daily Traffic Views Chart + Monthly Inquiry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Daily Traffic & Product Views Chart (Last 7 Days) */}
        <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                Live_Traffic_Velocity (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Daily Website Page Views vs. Product Detail Views
              </p>
            </div>
            <Eye size={16} className="text-blue-500" />
          </div>
          <div className="h-72 w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-700" size={40} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrafficData}>
                  <defs>
                    <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProdViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 800 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 800 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020408',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '16px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    name="Website Views"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPageViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="productViews"
                    name="Product Views"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProdViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Inquiry Flow Chart */}
        <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                Inquiry_Traffic_Metrics (6 Months)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Monthly Equipment Quotation &amp; Procurement Requisitions
              </p>
            </div>
            <Terminal size={16} className="text-slate-600" />
          </div>
          <div className="h-72 w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-700" size={40} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 800 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 800 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{
                      backgroundColor: '#020408',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '16px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar
                    dataKey="inquiries"
                    name="Quote Inquiries"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                    barSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Most Viewed Products Leaderboard + Top Visited Website Routes */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Most Viewed Products Leaderboard (8 cols) */}
        <div className="xl:col-span-8 bg-white/[0.02] p-8 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                <Trophy size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Most Viewed Products Leaderboard
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time ranking of which products visitors view the most on your website.
                </p>
              </div>
            </div>

            <Link
              to="/command-nexus/homepage"
              className="px-4 py-2.5 bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all self-start sm:self-auto"
            >
              Highlight Top Products &rarr;
            </Link>
          </div>

          {rankedProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No products found in catalog.
            </div>
          ) : (
            <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2 custom-scrollbar">
              {rankedProducts.slice(0, 12).map((prod, idx) => {
                const widthPercent = Math.max(
                  4,
                  Math.round(((prod.views || 0) / maxProductViews) * 100)
                );
                const sharePercent =
                  analytics && analytics.totalProductViews > 0
                    ? Math.round(((prod.views || 0) / totalTrackedProdViews) * 100)
                    : 0;

                return (
                  <div
                    key={prod.productId}
                    className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 w-full">
                      {/* Rank Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                            : idx === 1
                            ? 'bg-slate-300 text-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center">
                        {prod.mainImage ? (
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Package size={20} className="text-slate-400" />
                        )}
                      </div>

                      {/* Product Info + Progress Bar */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                            {prod.categoryTag}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {prod.modelNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black text-white truncate">
                            {prod.name}
                          </h4>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0
                                ? 'bg-amber-400'
                                : idx < 3
                                ? 'bg-blue-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Views Counter & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pl-13 sm:pl-0">
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-blue-400" />
                        <span className="text-lg font-black text-white font-mono tabular-nums">
                          {(prod.views || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          views ({sharePercent}%)
                        </span>
                      </div>

                      {prod.slug && (
                        <Link
                          to={`/portfolio/${prod.slug}`}
                          target="_blank"
                          className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                        >
                          <span>Inspect Page</span>
                          <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Visited Website Pages Breakdown (4 cols) */}
        <div className="xl:col-span-4 bg-white/[0.02] p-8 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3.5 border-b border-white/10 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Globe size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Traffic by Page
                </h3>
                <p className="text-xs text-slate-400">
                  Most visited sections of your website.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sortedRoutes.map(([route, count], i) => {
                const totalViews = Math.max(1, analytics?.totalPageViews || 1);
                const pct = Math.min(100, Math.round((count / totalViews) * 100));
                return (
                  <div
                    key={route}
                    className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {ROUTE_LABELS[route] || route}
                      </span>
                      <span className="text-xs font-mono font-black text-blue-400 shrink-0">
                        {count.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Route: {route}</span>
                      <span>{pct}% of traffic</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
              <Activity size={13} /> Real-Time Telemetry Active
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every visitor page view and product inspection is automatically recorded in real time without slowing down page load speed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
