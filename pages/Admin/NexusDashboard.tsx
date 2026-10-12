import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Activity,
  Package,
  MapPin,
  Globe,
  Mail,
  FileSpreadsheet,
  RefreshCw,
  Home,
  Eye,
  Users,
  Trophy,
  Phone,
  MessageSquare,
  Clock,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Product, Inquiry } from '../../types';
import {
  fetchSiteAnalytics,
  SiteTrafficAnalytics,
  ProductViewMetric,
  LocationTrafficMetric,
} from '../../utils/analyticsTracker';
import {
  AnalyticsDateFilter,
  computeDateRanges,
  aggregateRangeMetrics,
  generateDailyTrendPoints,
  formatDuration,
} from '../../utils/analyticsCalculations';

// Imported Modular Analytics Tabs
import { YouTubeMetricCard } from '../../components/analytics/YouTubeMetricCard';
import { AnalyticsDateFilterBar } from '../../components/analytics/AnalyticsDateFilterBar';
import {
  InteractiveTrafficChart,
  ChartMetricKey,
} from '../../components/analytics/InteractiveTrafficChart';
import { BangladeshDistrictAnalytics } from '../../components/analytics/BangladeshDistrictAnalytics';
import { ProductAnalyticsTab } from '../../components/analytics/ProductAnalyticsTab';
import { SEOPerformanceTab } from '../../components/analytics/SEOPerformanceTab';
import { MedicalBusinessInquiriesTab } from '../../components/analytics/MedicalBusinessInquiriesTab';
import { AnalyticsReportsExport } from '../../components/analytics/AnalyticsReportsExport';

export type DashboardActiveView =
  | 'overview'
  | 'traffic'
  | 'products'
  | 'districts'
  | 'seo'
  | 'inquiries'
  | 'reports';

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
  // Navigation View State
  const [activeView, setActiveView] = useState<DashboardActiveView>('overview');

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<AnalyticsDateFilter>('last_28_days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Interactive Chart Metrics Toggle State (YouTube Studio style)
  const [chartActiveMetrics, setChartActiveMetrics] = useState<ChartMetricKey[]>([
    'pageViews',
    'uniqueVisitors',
    'productViews',
  ]);

  // Telemetry & DB State
  const [analytics, setAnalytics] = useState<SiteTrafficAnalytics | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState({
    products: 0,
    inquiries: 0,
    alliances: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all live data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        allProductsRes,
        inquiriesRes,
        pCountRes,
        aCountRes,
        pendCountRes,
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('alliances').select('id', { count: 'exact', head: true }),
        supabase
          .from('inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      const productsList: Product[] = allProductsRes.data || [];
      const inquiriesList: Inquiry[] = inquiriesRes.data || [];

      setCatalogProducts(productsList);
      setInquiries(inquiriesList);
      setStats({
        products: pCountRes.count || productsList.length || 0,
        inquiries: inquiriesList.length,
        alliances: aCountRes.count || 0,
        pending: pendCountRes.count || inquiriesList.filter((i) => i.status === 'pending').length,
      });

      // Fetch live analytics telemetry from public.settings
      const trafficData = await fetchSiteAnalytics(productsList);
      setAnalytics(trafficData);
    } catch (err) {
      console.error('Nexus Dashboard Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute date ranges and comparison
  const comparison = useMemo(() => {
    return computeDateRanges(dateFilter, customStart, customEnd);
  }, [dateFilter, customStart, customEnd]);

  // Aggregate current period vs previous equivalent period
  const currentMetrics = useMemo(() => {
    return aggregateRangeMetrics(
      analytics,
      comparison.currentRange.startDate,
      comparison.currentRange.endDate
    );
  }, [analytics, comparison]);

  const previousMetrics = useMemo(() => {
    return aggregateRangeMetrics(
      analytics,
      comparison.previousRange.startDate,
      comparison.previousRange.endDate
    );
  }, [analytics, comparison]);

  // Trend chart data points for the date range
  const dailyChartPoints = useMemo(() => {
    return generateDailyTrendPoints(
      analytics,
      comparison.currentRange.startDate,
      comparison.currentRange.endDate
    );
  }, [analytics, comparison]);

  // Ranked Products list
  const rankedProducts = useMemo(() => {
    if (!analytics) return [];
    return (Object.values(analytics.productViews) as ProductViewMetric[]).sort(
      (a, b) => b.views - a.views || a.name.localeCompare(b.name)
    );
  }, [analytics]);

  const topViewedProduct = rankedProducts.find((p) => p.views > 0) || rankedProducts[0];
  const maxProductViews = Math.max(1, ...rankedProducts.map((p) => p.views || 0));

  // Toggle chart metric pill
  const handleToggleChartMetric = (key: ChartMetricKey) => {
    setChartActiveMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  // Inquiry update handler
  const handleUpdateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  const navTabs: Array<{ id: DashboardActiveView; label: string; icon: any }> = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'traffic', label: 'Traffic Analytics', icon: Activity },
    { id: 'products', label: 'Product Analytics', icon: Package },
    { id: 'districts', label: 'District Analytics (64 BD)', icon: MapPin },
    { id: 'seo', label: 'SEO Performance', icon: Globe },
    { id: 'inquiries', label: 'Customer Inquiries', icon: Mail },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-[#07090d] text-white p-4 sm:p-6 lg:p-10 space-y-8 rounded-[2rem] border border-[#171b24]">
      {/* Top Header Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#1b2029] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              YouTube Studio Engine · Real Telemetry Verified
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Command Nexus</span>
            <span className="text-sm font-bold text-slate-500 font-mono py-1 px-2.5 rounded-lg bg-white/5 border border-white/10">
              v2.5 Studio
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-3 bg-[#0f1115] hover:bg-[#151921] border border-[#222731] rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
            title="Refresh Live Data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <Link
            to="/command-nexus/homepage"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Home size={15} />
            <span>Homepage Control</span>
          </Link>
        </div>
      </header>

      {/* Modern Dashboard Sub-Navigation Tabs (YouTube Studio style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#161a22] no-scrollbar">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Date Filter Bar (Applies across all views) */}
      <AnalyticsDateFilterBar
        currentFilter={dateFilter}
        comparison={comparison}
        onFilterChange={setDateFilter}
        customStartDate={customStart}
        customEndDate={customEnd}
        onCustomRangeChange={(start, end) => {
          setCustomStart(start);
          setCustomEnd(end);
          setDateFilter('custom');
        }}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* =========================================================================
          VIEW 1: MAIN OVERVIEW DASHBOARD (12 YouTube Studio KPI Cards + Velocity Chart)
          ========================================================================= */}
      {activeView === 'overview' && (
        <div className="space-y-10">
          {/* Top 12 KPI Performance Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 1. Total Website Views */}
            <YouTubeMetricCard
              label="Total Website Views"
              value={currentMetrics.pageViews}
              previousValue={previousMetrics.pageViews}
              currentNumeric={currentMetrics.pageViews}
              icon={Eye}
              accentColor="blue"
              tooltip="All page views across the website during this period"
              isLoading={isLoading}
            />

            {/* 2. Unique Visitors */}
            <YouTubeMetricCard
              label="Unique Visitors"
              value={currentMetrics.uniqueVisitors}
              previousValue={previousMetrics.uniqueVisitors}
              currentNumeric={currentMetrics.uniqueVisitors}
              icon={Users}
              accentColor="purple"
              tooltip="Distinct visitor sessions detected"
              isLoading={isLoading}
            />

            {/* 3. Product Page Views */}
            <YouTubeMetricCard
              label="Product Page Views"
              value={currentMetrics.productViews}
              previousValue={previousMetrics.productViews}
              currentNumeric={currentMetrics.productViews}
              icon={Package}
              accentColor="emerald"
              tooltip="Views specifically on medical equipment detail pages"
              isLoading={isLoading}
            />

            {/* 4. Most Viewed Product */}
            <div className="p-5 rounded-2xl bg-[#0f1115] border border-[#222731] flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  #1 Most Viewed Equipment
                </span>
                <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Trophy size={14} />
                </span>
              </div>
              <div className="my-1">
                {topViewedProduct ? (
                  <>
                    <div className="text-sm font-bold text-white truncate max-w-xs">
                      {topViewedProduct.name}
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                      {topViewedProduct.views.toLocaleString()} views
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500">No views yet</div>
                )}
              </div>
              <div className="pt-2 border-t border-[#1a1f29] text-[10px] text-slate-500 truncate">
                {topViewedProduct?.modelNumber || 'Across catalog'}
              </div>
            </div>

            {/* 5. Total Customer Inquiries */}
            <YouTubeMetricCard
              label="Customer Inquiries"
              value={currentMetrics.inquiries}
              previousValue={previousMetrics.inquiries}
              currentNumeric={currentMetrics.inquiries}
              icon={Mail}
              accentColor="amber"
              tooltip="Procurement inquiries received via contact & RFQ forms"
              isLoading={isLoading}
            />

            {/* 6. WhatsApp Clicks */}
            <YouTubeMetricCard
              label="WhatsApp Clicks"
              value={currentMetrics.whatsappClicks}
              previousValue={previousMetrics.whatsappClicks}
              currentNumeric={currentMetrics.whatsappClicks}
              icon={MessageSquare}
              accentColor="emerald"
              tooltip="Direct WhatsApp communication buttons clicked by buyers"
              isLoading={isLoading}
            />

            {/* 7. Phone Number Clicks */}
            <YouTubeMetricCard
              label="Phone Number Clicks"
              value={currentMetrics.phoneClicks}
              previousValue={previousMetrics.phoneClicks}
              currentNumeric={currentMetrics.phoneClicks}
              icon={Phone}
              accentColor="cyan"
              tooltip="Mobile telephone calls triggered from website links"
              isLoading={isLoading}
            />

            {/* 8. Email Clicks */}
            <YouTubeMetricCard
              label="Email Clicks"
              value={currentMetrics.emailClicks}
              previousValue={previousMetrics.emailClicks}
              currentNumeric={currentMetrics.emailClicks}
              icon={Mail}
              accentColor="indigo"
              tooltip="Mailto link clicks to carelinkhealthineers@gmail.com"
              isLoading={isLoading}
            />

            {/* 9. Quote Request Submissions */}
            <YouTubeMetricCard
              label="Quote Request Submissions"
              value={currentMetrics.quoteSubmits}
              previousValue={previousMetrics.quoteSubmits}
              currentNumeric={currentMetrics.quoteSubmits}
              icon={FileSpreadsheet}
              accentColor="blue"
              tooltip="Completed clinical procurement and RFQ forms"
              isLoading={isLoading}
            />

            {/* 10. Organic Search Traffic */}
            <YouTubeMetricCard
              label="Organic Search Traffic"
              value={currentMetrics.organicViews}
              previousValue={previousMetrics.organicViews}
              currentNumeric={currentMetrics.organicViews}
              icon={Globe}
              accentColor="cyan"
              tooltip="Visits referred organically via Google, Bing, Yahoo, DuckDuckGo"
              isLoading={isLoading}
            />

            {/* 11. Average Engagement Time */}
            <YouTubeMetricCard
              label="Avg Engagement Time"
              value={formatDuration(currentMetrics.avgEngagementSeconds)}
              icon={Clock}
              accentColor="purple"
              tooltip="Active on-page reading and session duration"
              subtext="Real visibility & focus timer"
              isLoading={isLoading}
            />

            {/* 12. Conversion Rate */}
            <YouTubeMetricCard
              label="Conversion Rate"
              value={currentMetrics.conversionRate}
              unit="%"
              icon={TrendingUp}
              accentColor="emerald"
              tooltip="Percentage of website visits generating inquiries or direct contact"
              subtext="Direct leads per 100 views"
              isLoading={isLoading}
            />
          </div>

          {/* Interactive Multi-Metric Velocity Chart (YouTube Studio style) */}
          <InteractiveTrafficChart
            data={dailyChartPoints}
            activeMetrics={chartActiveMetrics}
            onToggleMetric={handleToggleChartMetric}
            isLoading={isLoading}
          />

          {/* Overview Quick Drilldowns: Top Equipment & 64 Districts Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top Products Quick Table (8 cols) */}
            <div className="lg:col-span-8 p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top Performing Medical Equipment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live product view ranking with automated zero-permission district detection
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('products')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <span>View All Products</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="space-y-3">
                {rankedProducts.slice(0, 5).map((prod, idx) => {
                  const widthPercent = Math.max(
                    4,
                    Math.round(((prod.views || 0) / maxProductViews) * 100)
                  );
                  const cityEntries = Object.entries(prod.locations || {}).sort(
                    (a, b) => Number(b[1]) - Number(a[1])
                  );

                  return (
                    <div
                      key={prod.productId || `prod-rank-${idx}`}
                      className="p-4 rounded-2xl bg-[#07090d] border border-[#1e232e] hover:border-blue-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-black'
                              : idx === 1
                              ? 'bg-slate-300 text-black'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                          {prod.mainImage ? (
                            <img
                              src={prod.mainImage}
                              alt={prod.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {prod.modelNumber} · {prod.categoryTag}
                          </div>

                          {/* District badges for this product */}
                          {cityEntries.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {cityEntries.slice(0, 3).map(([dist, cnt]) => (
                                <span
                                  key={`${prod.productId || idx}-${dist}`}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold"
                                >
                                  {dist}: {cnt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-white font-mono">
                          {(prod.views || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">views</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Districts Quick Card (4 cols) */}
            <div className="lg:col-span-4 p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#222731] pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Top Bangladesh Districts
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Leading geographic demand
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView('districts')}
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <MapPin size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {(Object.values(analytics?.districtStats || {}) as any[])
                    .sort((a, b) => (b.productViews || 0) - (a.productViews || 0))
                    .slice(0, 5)
                    .map((d, dIdx) => (
                      <div
                        key={d.districtId || d.districtName || `dist-${dIdx}`}
                        className="p-3 rounded-xl bg-[#07090d] border border-[#1e232e] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-blue-400" />
                          <span className="font-bold text-white">{d.districtName}</span>
                          <span className="text-[10px] text-slate-500">({d.divisionName})</span>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-400">
                          {d.productViews} prod views
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <button
                onClick={() => setActiveView('districts')}
                className="w-full py-2.5 bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all text-center"
              >
                Inspect All 64 Districts &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: TRAFFIC ANALYTICS (Detailed Channels, Pages & Velocity)
          ========================================================================= */}
      {activeView === 'traffic' && (
        <div className="space-y-8">
          <InteractiveTrafficChart
            data={dailyChartPoints}
            activeMetrics={chartActiveMetrics}
            onToggleMetric={handleToggleChartMetric}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traffic Channels Breakdown */}
            <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Traffic Acquisition Channels
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(analytics?.channelViews || {}).map(([chan, count]) => {
                  const total = Math.max(1, analytics?.totalPageViews || 1);
                  const cnt = Number(count) || 0;
                  const pct = Math.round((cnt / total) * 100);
                  return (
                    <div key={chan} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{chan}</span>
                        <span className="font-mono text-slate-400">
                          {cnt.toLocaleString()} views ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#1b2029] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traffic by Page */}
            <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Visited Public Pages
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(analytics?.routeViews || {})
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .map(([route, count]) => {
                    const total = Math.max(1, analytics?.totalPageViews || 1);
                    const cnt = Number(count) || 0;
                    const pct = Math.round((cnt / total) * 100);
                    return (
                      <div
                        key={route}
                        className="p-3.5 rounded-xl bg-[#07090d] border border-[#1e232e] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white truncate max-w-xs">
                          {ROUTE_LABELS[route] || route}
                        </span>
                        <span className="font-mono font-bold text-blue-400">
                          {cnt.toLocaleString()} views ({pct}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: PRODUCT ANALYTICS
          ========================================================================= */}
      {activeView === 'products' && (
        <ProductAnalyticsTab
          analytics={analytics}
          catalogProducts={catalogProducts}
        />
      )}

      {/* =========================================================================
          VIEW 4: BANGLADESH 64 DISTRICTS ANALYTICS
          ========================================================================= */}
      {activeView === 'districts' && (
        <BangladeshDistrictAnalytics
          analytics={analytics}
          catalogProducts={catalogProducts}
        />
      )}

      {/* =========================================================================
          VIEW 5: SEO PERFORMANCE
          ========================================================================= */}
      {activeView === 'seo' && (
        <SEOPerformanceTab
          analytics={analytics}
          catalogProducts={catalogProducts}
        />
      )}

      {/* =========================================================================
          VIEW 6: CUSTOMER INQUIRIES & B2B PROCUREMENT
          ========================================================================= */}
      {activeView === 'inquiries' && (
        <MedicalBusinessInquiriesTab
          inquiries={inquiries}
          analytics={analytics}
          catalogProducts={catalogProducts}
          onUpdateInquiryStatus={handleUpdateInquiryStatus}
        />
      )}

      {/* =========================================================================
          VIEW 7: REPORTS & EXPORT
          ========================================================================= */}
      {activeView === 'reports' && (
        <AnalyticsReportsExport
          analytics={analytics}
          catalogProducts={catalogProducts}
          inquiries={inquiries}
          currentDateFilter={dateFilter}
        />
      )}
    </div>
  );
};
export default NexusDashboard;
