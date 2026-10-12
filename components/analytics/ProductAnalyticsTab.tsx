import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  ExternalLink,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  MapPin,
  X,
  Download,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Product } from '../../types';
import {
  SiteTrafficAnalytics,
  ProductViewMetric,
} from '../../utils/analyticsTracker';
import { ExportActionMenu } from '../common/ExportActionMenu';

interface ProductAnalyticsTabProps {
  analytics: SiteTrafficAnalytics | null;
  catalogProducts: Product[];
}

export const ProductAnalyticsTab: React.FC<ProductAnalyticsTabProps> = ({
  analytics,
  catalogProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'views' | 'inquiries' | 'name'>('views');
  const [sortAsc, setSortAsc] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalogProducts.forEach((p) => {
      if (p.category_tag) set.add(p.category_tag);
    });
    return Array.from(set);
  }, [catalogProducts]);

  // Merge products with telemetry
  const enrichedProducts = useMemo(() => {
    const metricsMap = analytics?.productViews || {};
    return catalogProducts.map((p) => {
      const live = metricsMap[p.id];
      const views = live?.views || 0;
      const uniqueVisitors = live?.uniqueVisitors || views;
      const inquiries = live?.inquiries || 0;
      const quoteRequests = live?.quoteRequests || 0;
      const whatsappClicks = live?.whatsappClicks || 0;
      const phoneClicks = live?.phoneClicks || 0;
      const emailClicks = live?.emailClicks || 0;
      const locations = live?.locations || {};
      const dailyViews = live?.dailyViews || {};
      const referralSources = live?.referralSources || {};

      // Top district
      let topDistrict = 'N/A';
      let maxDistrictViews = 0;
      Object.entries(locations).forEach(([dist, cnt]) => {
        const c = Number(cnt) || 0;
        if (c > maxDistrictViews) {
          maxDistrictViews = c;
          topDistrict = `${dist} (${c})`;
        }
      });

      // Conversion rate (Inquiries / Views)
      const conversionRate = views > 0 ? Number(((inquiries / views) * 100).toFixed(1)) : 0;

      return {
        ...p,
        views,
        uniqueVisitors,
        inquiries,
        quoteRequests,
        whatsappClicks,
        phoneClicks,
        emailClicks,
        topDistrict,
        conversionRate,
        locations,
        dailyViews,
        referralSources,
        lastViewedAt: live?.lastViewedAt || p.created_at,
      };
    });
  }, [catalogProducts, analytics]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return enrichedProducts
      .filter((p) => {
        const matchesCat = categoryFilter === 'All' || p.category_tag === categoryFilter;
        const matchesSearch =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.model_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.primary_keyword || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        const valA = a[sortField] || 0;
        const valB = b[sortField] || 0;
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [enrichedProducts, categoryFilter, searchQuery, sortField, sortAsc]);

  // Selected product drilldown details
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return enrichedProducts.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, enrichedProducts]);

  // Prepare daily chart data for modal
  const selectedDailyChartData = useMemo(() => {
    if (!selectedProduct?.dailyViews) return [];
    const entries = Object.entries(selectedProduct.dailyViews).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    return entries.map(([date, views]) => ({
      date,
      views,
    }));
  }, [selectedProduct]);

  const maxViews = Math.max(1, ...enrichedProducts.map((p) => p.views));

  const getExportData = () => {
    const headers = [
      'Product Name',
      'Model Number',
      'Category',
      'Total Views',
      'Unique Visitors',
      'Inquiries',
      'Quote Requests',
      'WhatsApp Clicks',
      'Conversion Rate (%)',
      'Top District',
    ];

    const rows: (string | number)[][] = enrichedProducts.map((p) => [
      p.name,
      p.model_number || '—',
      p.category_tag || 'General',
      p.views,
      p.uniqueVisitors,
      p.inquiries,
      p.quoteRequests,
      p.whatsappClicks,
      p.conversionRate,
      p.topDistrict,
    ]);

    return {
      filename: `carelink_product_performance_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Product Performance',
      title: 'Carelink Healthineers Product Catalog Performance',
      subtitle: `Analyzed Catalog: ${enrichedProducts.length} models`,
      headers,
      rows,
    };
  };

  return (
    <div className="space-y-8">
      {/* Search, Filter, Export Bar */}
      <div className="p-6 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search equipment or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#141822] border border-[#232938] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#141822] border border-[#232938] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <ExportActionMenu label="Export Catalog" getData={getExportData} className="self-start sm:self-auto" />
      </div>

      {/* Product Performance Table */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Medical Equipment Performance &amp; Inquiries
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any equipment row to open deep traffic, district, and referral analytics
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredProducts.length} Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222731] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th
                  onClick={() => {
                    setSortField('views');
                    setSortAsc(sortField === 'views' ? !sortAsc : false);
                  }}
                  className="pb-3 text-right cursor-pointer hover:text-white"
                >
                  Views {sortField === 'views' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="pb-3 text-right">Unique Visitors</th>
                <th
                  onClick={() => {
                    setSortField('inquiries');
                    setSortAsc(sortField === 'inquiries' ? !sortAsc : false);
                  }}
                  className="pb-3 text-right cursor-pointer hover:text-white"
                >
                  Inquiries {sortField === 'inquiries' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="pb-3 text-right">Inquiry Rate</th>
                <th className="pb-3 pl-4">Top District Demand</th>
                <th className="pb-3 text-right">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1f29]">
              {filteredProducts.map((p) => {
                const widthPercent = Math.max(6, Math.round((p.views / maxViews) * 100));
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className="hover:bg-[#141822] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                          {p.main_image ? (
                            <img
                              src={p.main_image}
                              alt={p.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {p.model_number || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-400">{p.category_tag}</td>
                    <td className="py-3.5 pr-3 text-right font-mono font-bold text-white">
                      <div className="flex items-center justify-end gap-2">
                        <span>{p.views.toLocaleString()}</span>
                        <div className="w-12 bg-white/5 h-1 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-right font-mono text-slate-400">
                      {p.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-3 text-right font-mono font-bold text-amber-400">
                      {p.inquiries}
                    </td>
                    <td className="py-3.5 pr-3 text-right font-mono text-emerald-400">
                      {p.conversionRate}%
                    </td>
                    <td className="py-3.5 pl-4 pr-3 text-slate-300 truncate">
                      {p.topDistrict !== 'N/A' ? (
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <MapPin size={11} className="text-emerald-400" />
                          {p.topDistrict}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductId(p.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[10px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1115] border border-[#222731] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#222731] pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white p-2 shrink-0 flex items-center justify-center">
                  {selectedProduct.main_image ? (
                    <img
                      src={selectedProduct.main_image}
                      alt={selectedProduct.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Package size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {selectedProduct.category_tag} · {selectedProduct.model_number}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selectedProduct.name}
                  </h3>
                  {selectedProduct.slug && (
                    <a
                      href={`/portfolio/${selectedProduct.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 mt-1"
                    >
                      <span>Public Catalog Page</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedProductId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Views</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {selectedProduct.views.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Unique Visitors</div>
                <div className="text-2xl font-black text-slate-300 font-mono mt-1">
                  {selectedProduct.uniqueVisitors.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Inquiries &amp; RFQs</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {selectedProduct.inquiries}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp Leads</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {selectedProduct.whatsappClicks}
                </div>
              </div>
            </div>

            {/* District Breakdown for this Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Geographic Demand Breakdown (Bangladesh Districts)
              </h4>
              {Object.keys(selectedProduct.locations).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-[#07090d] rounded-2xl border border-[#1e232e]">
                  No district telemetry registered for this product yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(selectedProduct.locations)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .map(([district, cnt]) => (
                      <div
                        key={district}
                        className="p-3 rounded-xl bg-[#07090d] border border-[#1e232e] flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <MapPin size={11} className="text-emerald-400" />
                          {district}
                        </span>
                        <span className="font-mono font-bold text-white">{cnt}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="pt-4 border-t border-[#222731] flex justify-end">
              <button
                onClick={() => setSelectedProductId(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
