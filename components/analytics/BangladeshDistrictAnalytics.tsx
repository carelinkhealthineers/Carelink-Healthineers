import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Download,
  Filter,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Globe,
  Layers,
} from 'lucide-react';
import {
  BANGLADESH_64_DISTRICTS,
  BANGLADESH_DIVISIONS,
  BangladeshDivisionName,
  DistrictMetadata,
  UNKNOWN_LOCATION_ID,
  INTERNATIONAL_LOCATION_ID,
} from '../../utils/bangladeshDistricts';
import {
  SiteTrafficAnalytics,
  DistrictAnalyticsMetric,
} from '../../utils/analyticsTracker';
import { Product } from '../../types';
import { ExportActionMenu } from '../common/ExportActionMenu';

interface BangladeshDistrictAnalyticsProps {
  analytics: SiteTrafficAnalytics | null;
  catalogProducts?: Product[];
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
}

export const BangladeshDistrictAnalytics: React.FC<BangladeshDistrictAnalyticsProps> = ({
  analytics,
  catalogProducts = [],
  selectedDistrictId: initialSelectedId,
  onSelectDistrict,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    initialSelectedId || 'dhaka'
  );
  const [sortField, setSortField] = useState<'pageViews' | 'productViews' | 'inquiries' | 'name'>(
    'productViews'
  );
  const [sortAsc, setSortAsc] = useState(false);

  // Map products for fast lookup
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    catalogProducts.forEach((p) => map.set(p.id, p));
    return map;
  }, [catalogProducts]);

  // Combine 64 districts with current telemetry
  const districtRows = useMemo(() => {
    const stats = analytics?.districtStats || {};
    return BANGLADESH_64_DISTRICTS.map((meta) => {
      const live = stats[meta.id];
      const pageViews = live?.pageViews || 0;
      const productViews = live?.productViews || 0;
      const inquiries = live?.inquiries || 0;
      const quoteRequests = live?.quoteRequests || 0;
      const whatsappClicks = live?.whatsappClicks || 0;
      const phoneClicks = live?.phoneClicks || 0;
      const emailClicks = live?.emailClicks || 0;
      const uniqueVisitors = live?.uniqueVisitors || (pageViews > 0 ? pageViews : 0);

      // Find top product in this district
      let topProduct: { name: string; count: number } | null = null;
      if (live?.productBreakdown) {
        let maxViews = 0;
        let topId = '';
        Object.entries(live.productBreakdown).forEach(([prodId, views]) => {
          const v = Number(views) || 0;
          if (v > maxViews) {
            maxViews = v;
            topId = prodId;
          }
        });
        if (topId) {
          const prodObj = productMap.get(topId);
          topProduct = {
            name: prodObj?.name || 'Medical Equipment',
            count: maxViews,
          };
        }
      }

      return {
        ...meta,
        pageViews,
        productViews,
        inquiries,
        quoteRequests,
        whatsappClicks,
        phoneClicks,
        emailClicks,
        uniqueVisitors,
        topProduct,
        lastActiveAt: live?.lastActiveAt || '',
        productBreakdown: live?.productBreakdown || {},
      };
    });
  }, [analytics, productMap]);

  // Special rows: Unknown / Unavailable & International
  const specialRows = useMemo(() => {
    const stats = analytics?.districtStats || {};
    const unk = stats[UNKNOWN_LOCATION_ID];
    const intl = stats[INTERNATIONAL_LOCATION_ID];
    return {
      unknown: {
        id: UNKNOWN_LOCATION_ID,
        name: 'Unknown / Unavailable Location',
        division: 'Unmapped',
        pageViews: unk?.pageViews || 0,
        productViews: unk?.productViews || 0,
        inquiries: unk?.inquiries || 0,
        quoteRequests: unk?.quoteRequests || 0,
        whatsappClicks: unk?.whatsappClicks || 0,
        phoneClicks: unk?.phoneClicks || 0,
        emailClicks: unk?.emailClicks || 0,
        note: 'VPN, proxy, or cellular NAT IPs without precise district mapping',
      },
      international: {
        id: INTERNATIONAL_LOCATION_ID,
        name: 'International (Outside BD)',
        division: 'International',
        pageViews: intl?.pageViews || 0,
        productViews: intl?.productViews || 0,
        inquiries: intl?.inquiries || 0,
        quoteRequests: intl?.quoteRequests || 0,
        whatsappClicks: intl?.whatsappClicks || 0,
        phoneClicks: intl?.phoneClicks || 0,
        emailClicks: intl?.emailClicks || 0,
        note: 'Visitors browsing from outside Bangladesh',
      },
    };
  }, [analytics]);

  // Division-wise summary aggregates
  const divisionSummaries = useMemo(() => {
    const summaries: Record<
      string,
      { districts: number; pageViews: number; productViews: number; inquiries: number }
    > = {};
    BANGLADESH_DIVISIONS.forEach((div) => {
      summaries[div] = { districts: 0, pageViews: 0, productViews: 0, inquiries: 0 };
    });

    districtRows.forEach((d) => {
      if (summaries[d.division]) {
        summaries[d.division].districts += 1;
        summaries[d.division].pageViews += d.pageViews;
        summaries[d.division].productViews += d.productViews;
        summaries[d.division].inquiries += d.inquiries;
      }
    });

    return summaries;
  }, [districtRows]);

  // Filter & Sort
  const filteredDistricts = useMemo(() => {
    return districtRows
      .filter((d) => {
        const matchesDiv = selectedDivision === 'All' || d.division === selectedDivision;
        const matchesSearch =
          !searchQuery.trim() ||
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesDiv && matchesSearch;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        const valA = a[sortField] || 0;
        const valB = b[sortField] || 0;
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [districtRows, selectedDivision, searchQuery, sortField, sortAsc]);

  // Currently focused district details
  const activeDistrict = useMemo(() => {
    return (
      districtRows.find((d) => d.id === selectedDistrictId) ||
      districtRows.find((d) => d.id === 'dhaka') ||
      districtRows[0]
    );
  }, [districtRows, selectedDistrictId]);

  const maxProductViews = Math.max(1, ...districtRows.map((d) => d.productViews));

  const handleDistrictClick = (distId: string) => {
    setSelectedDistrictId(distId);
    if (onSelectDistrict) onSelectDistrict(distId);
  };

  const getExportData = () => {
    const headers = [
      'District ID',
      'District Name',
      'Division',
      'Page Views',
      'Product Views',
      'Inquiries',
      'Quote Requests',
      'WhatsApp Clicks',
      'Phone Clicks',
      'Email Clicks',
      'Top Product',
    ];

    const rows: (string | number)[][] = districtRows.map((d) => [
      d.id,
      d.name,
      d.division,
      d.pageViews,
      d.productViews,
      d.inquiries,
      d.quoteRequests,
      d.whatsappClicks,
      d.phoneClicks,
      d.emailClicks,
      d.topProduct?.name || 'N/A',
    ]);

    // Append special rows
    rows.push([
      specialRows.unknown.id,
      specialRows.unknown.name,
      specialRows.unknown.division,
      specialRows.unknown.pageViews,
      specialRows.unknown.productViews,
      specialRows.unknown.inquiries,
      specialRows.unknown.quoteRequests,
      specialRows.unknown.whatsappClicks,
      specialRows.unknown.phoneClicks,
      specialRows.unknown.emailClicks,
      'N/A',
    ]);

    return {
      filename: `bangladesh_64_districts_analytics_${new Date().toISOString().split('T')[0]}`,
      sheetName: '64 Districts',
      title: 'Bangladesh 64 Districts Healthcare Sourcing Telemetry',
      subtitle: 'Regional demand and procurement metrics across all 8 Administrative Divisions',
      headers,
      rows,
    };
  };

  return (
    <div className="space-y-8">
      {/* Header with Privacy Notice */}
      <div className="p-6 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin size={16} />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Bangladesh 64 Districts Demand &amp; Inquiries
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Privacy-conscious district estimation based on client network &amp; IP endpoints. Zero GPS
            permission prompts, zero intrusive tracking. Tracks hospital procurement inquiries and
            equipment views across all 8 Divisions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ExportActionMenu label="Export 64 Districts" getData={getExportData} />
        </div>
      </div>

      {/* Division Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {BANGLADESH_DIVISIONS.map((divName) => {
          const sum = divisionSummaries[divName];
          const isSelected = selectedDivision === divName;
          return (
            <button
              key={divName}
              onClick={() => setSelectedDivision(isSelected ? 'All' : divName)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-[#0f1115] border-[#222731] hover:bg-[#141822] text-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {divName}
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5 tabular-nums">
                {sum?.productViews.toLocaleString() || 0}
              </div>
              <div className="text-[9px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{sum?.districts} dist</span>
                {sum?.inquiries > 0 && (
                  <span className="text-emerald-400 font-bold">+{sum.inquiries} inq</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Map & District Drill-down Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Interactive Schematic SVG Map of Bangladesh (6 cols) */}
        <div className="xl:col-span-6 p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Interactive Bangladesh District Map
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hover or click any district node to inspect local equipment demand
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">
              64 Districts · 8 Divisions
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#07090d] rounded-2xl border border-[#1b2029] p-4 flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full max-h-full max-w-full drop-shadow-2xl select-none"
            >
              {/* Background Bangladesh Boundary Outline Guide */}
              <path
                d="M 18,9 L 33,14 L 38,21 L 53,35 L 80,34 L 86,74 L 80,90 L 78,75 L 67,69 L 61,78 L 54,73 L 48,75 L 38,74 L 26,76 L 31,67 L 19,55 L 14,39 L 21,22 Z"
                fill="rgba(59, 130, 246, 0.03)"
                stroke="rgba(59, 130, 246, 0.15)"
                strokeWidth="0.8"
                strokeDasharray="1.5 1.5"
              />

              {/* District Coordinate Nodes */}
              {districtRows.map((d) => {
                const isSelected = activeDistrict.id === d.id;
                const hasViews = d.productViews > 0 || d.pageViews > 0;
                const hasInquiries = d.inquiries > 0;
                const nodeRadius = isSelected ? 2.8 : hasInquiries ? 2.2 : hasViews ? 1.8 : 1.2;

                const fillColor = isSelected
                  ? '#3B82F6'
                  : hasInquiries
                  ? '#10B981'
                  : hasViews
                  ? '#F59E0B'
                  : '#334155';

                return (
                  <g
                    key={d.id}
                    onClick={() => handleDistrictClick(d.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for active or high demand district */}
                    {(isSelected || hasInquiries) && (
                      <circle
                        cx={d.mapX}
                        cy={d.mapY}
                        r={nodeRadius + 2}
                        fill="none"
                        stroke={fillColor}
                        strokeWidth="0.5"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={d.mapX}
                      cy={d.mapY}
                      r={nodeRadius}
                      fill={fillColor}
                      stroke="#0f1115"
                      strokeWidth="0.6"
                      className="transition-transform group-hover:scale-150"
                    />
                    {/* District name label for key major districts or selected */}
                    {(isSelected || ['dhaka', 'chattogram', 'rajshahi', 'sylhet', 'khulna', 'barishal', 'rangpur', 'mymensingh'].includes(d.id)) && (
                      <text
                        x={d.mapX}
                        y={d.mapY - 2.5}
                        textAnchor="middle"
                        fontSize="2.4"
                        fontWeight={isSelected ? '900' : '700'}
                        fill={isSelected ? '#60A5FA' : '#94A3B8'}
                        className="pointer-events-none select-none font-sans"
                      >
                        {d.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-[#0d0f14]/90 backdrop-blur-md border border-[#222731] p-2.5 rounded-xl text-[10px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-300">Selected District</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Active Inquiries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-300">Catalog Views</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-slate-500">Zero Traffic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected District Drill-down Panel (6 cols) */}
        <div className="xl:col-span-6 p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#222731] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                    {activeDistrict.division} Division
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500 uppercase">District Drilldown</span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  {activeDistrict.name} District
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <MapPin size={22} />
              </div>
            </div>

            {/* District KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Views</div>
                <div className="text-xl font-black text-white font-mono mt-1 tabular-nums">
                  {activeDistrict.pageViews.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Product Views</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1 tabular-nums">
                  {activeDistrict.productViews.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Inquiries</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-1 tabular-nums">
                  {activeDistrict.inquiries.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#07090d] border border-[#1e232e]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp</div>
                <div className="text-xl font-black text-cyan-400 font-mono mt-1 tabular-nums">
                  {activeDistrict.whatsappClicks.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Contact Breakdown */}
            <div className="p-4 rounded-2xl bg-[#07090d] border border-[#1e232e] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Procurement &amp; Inquiries Channels in {activeDistrict.name}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-slate-400 text-[10px]">Quotes</div>
                  <div className="font-bold text-white font-mono">{activeDistrict.quoteRequests}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-slate-400 text-[10px]">Phone Calls</div>
                  <div className="font-bold text-white font-mono">{activeDistrict.phoneClicks}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-slate-400 text-[10px]">Direct Emails</div>
                  <div className="font-bold text-white font-mono">{activeDistrict.emailClicks}</div>
                </div>
              </div>
            </div>

            {/* Equipment Breakdown in this District */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Top Viewed Medical Equipment in {activeDistrict.name}
              </span>
              {Object.keys(activeDistrict.productBreakdown).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-[#07090d] rounded-2xl border border-[#1e232e]">
                  No product views recorded for this district yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(activeDistrict.productBreakdown)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .map(([prodId, count]) => {
                      const prod = productMap.get(prodId);
                      return (
                        <div
                          key={prodId}
                          className="p-3 rounded-xl bg-[#07090d] border border-[#1e232e] flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="font-bold text-white truncate">
                              {prod?.name || 'Equipment Model'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {prod?.model_number || prodId}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-emerald-400">
                              {count} views
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#222731] flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Last activity: {activeDistrict.lastActiveAt ? new Date(activeDistrict.lastActiveAt).toLocaleString() : 'Awaiting visits'}
            </span>
            <span className="text-blue-400 font-bold">Privacy Guaranteed · No GPS prompt</span>
          </div>
        </div>
      </div>

      {/* 64 Districts Table (Searchable, Sortable, Filterable) */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Authoritative 64 Districts Catalog Performance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredDistricts.length} of 64 districts in Bangladesh
            </p>
          </div>

          {/* Search bar & Division filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search district or upazila..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-[#141822] border border-[#232938] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56 font-sans"
              />
            </div>

            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-2 bg-[#141822] border border-[#232938] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Divisions (8)</option>
              {BANGLADESH_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d} Division
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222731] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => {
                    setSortField('name');
                    setSortAsc(sortField === 'name' ? !sortAsc : false);
                  }}
                  className="pb-3 cursor-pointer hover:text-white"
                >
                  District Name {sortField === 'name' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="pb-3">Division</th>
                <th
                  onClick={() => {
                    setSortField('pageViews');
                    setSortAsc(sortField === 'pageViews' ? !sortAsc : false);
                  }}
                  className="pb-3 text-right cursor-pointer hover:text-white"
                >
                  Website Views {sortField === 'pageViews' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => {
                    setSortField('productViews');
                    setSortAsc(sortField === 'productViews' ? !sortAsc : false);
                  }}
                  className="pb-3 text-right cursor-pointer hover:text-white"
                >
                  Product Views {sortField === 'productViews' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => {
                    setSortField('inquiries');
                    setSortAsc(sortField === 'inquiries' ? !sortAsc : false);
                  }}
                  className="pb-3 text-right cursor-pointer hover:text-white"
                >
                  Inquiries {sortField === 'inquiries' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="pb-3 text-right">Direct Actions</th>
                <th className="pb-3 pl-4">Top Viewed Equipment</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1f29]">
              {filteredDistricts.map((d) => {
                const isSelected = activeDistrict.id === d.id;
                const viewShare = Math.round((d.productViews / maxProductViews) * 100);
                const totalDirectActions =
                  d.whatsappClicks + d.phoneClicks + d.emailClicks;

                return (
                  <tr
                    key={d.id}
                    onClick={() => handleDistrictClick(d.id)}
                    className={`hover:bg-[#141822] cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{d.name}</span>
                        {d.inquiries > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-slate-400">{d.division}</td>
                    <td className="py-3.5 pr-3 text-right font-mono text-slate-300">
                      {d.pageViews.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-3 text-right font-mono font-bold text-white">
                      <div className="flex items-center justify-end gap-2">
                        <span>{d.productViews.toLocaleString()}</span>
                        {d.productViews > 0 && (
                          <div className="w-12 bg-white/5 h-1 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.max(8, viewShare)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-right font-mono font-bold text-amber-400">
                      {d.inquiries}
                    </td>
                    <td className="py-3.5 pr-3 text-right text-slate-400 font-mono">
                      {totalDirectActions > 0 ? (
                        <span className="text-cyan-400">
                          {totalDirectActions} (WA:{d.whatsappClicks} Tel:{d.phoneClicks})
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3.5 pl-4 pr-3 text-slate-300 truncate max-w-xs">
                      {d.topProduct ? (
                        <span className="text-slate-200">
                          {d.topProduct.name}{' '}
                          <span className="text-[10px] text-slate-500">
                            ({d.topProduct.count})
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDistrictClick(d.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Special Unmapped / Unknown Location Transparency Section */}
        <div className="pt-4 border-t border-[#222731] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>
              Unmapped / VPN Visitors: <strong className="text-slate-300">{specialRows.unknown.pageViews}</strong> views ·{' '}
              International Visitors: <strong className="text-slate-300">{specialRows.international.pageViews}</strong> views
            </span>
          </div>
          <span className="text-[11px] text-slate-600 italic">
            Coverage confidence recorded transparently without artificial inflation.
          </span>
        </div>
      </div>
    </div>
  );
};
