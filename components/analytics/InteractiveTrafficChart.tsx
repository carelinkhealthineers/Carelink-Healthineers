import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export type ChartMetricKey =
  | 'pageViews'
  | 'uniqueVisitors'
  | 'productViews'
  | 'inquiries'
  | 'organicViews';

export interface InteractiveTrafficChartProps {
  data: Array<{
    date: string;
    label: string;
    pageViews: number;
    uniqueVisitors: number;
    productViews: number;
    inquiries: number;
    organicViews: number;
  }>;
  activeMetrics: ChartMetricKey[];
  onToggleMetric: (metric: ChartMetricKey) => void;
  isLoading?: boolean;
}

const METRIC_CONFIG: Record<
  ChartMetricKey,
  { label: string; color: string; gradientId: string; description: string }
> = {
  pageViews: {
    label: 'Website Views',
    color: '#3B82F6',
    gradientId: 'gradPageViews',
    description: 'Total page visits',
  },
  uniqueVisitors: {
    label: 'Unique Visitors',
    color: '#8B5CF6',
    gradientId: 'gradUniqueVisitors',
    description: 'Distinct visitor sessions',
  },
  productViews: {
    label: 'Product Views',
    color: '#10B981',
    gradientId: 'gradProductViews',
    description: 'Medical equipment detail views',
  },
  inquiries: {
    label: 'Inquiries & RFQs',
    color: '#F59E0B',
    gradientId: 'gradInquiries',
    description: 'Procurement inquiries submitted',
  },
  organicViews: {
    label: 'Organic Search',
    color: '#06B6D4',
    gradientId: 'gradOrganic',
    description: 'Visitors from Google & Bing',
  },
};

export const InteractiveTrafficChart: React.FC<InteractiveTrafficChartProps> = ({
  data,
  activeMetrics,
  onToggleMetric,
  isLoading = false,
}) => {
  return (
    <div className="p-6 lg:p-8 rounded-3xl bg-[#0f1115] border border-[#222731] space-y-6">
      {/* Metric toggle pills (YouTube Studio style) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Traffic Velocity &amp; Demand Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select metrics below to compare trends over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(METRIC_CONFIG) as ChartMetricKey[]).map((key) => {
            const config = METRIC_CONFIG[key];
            const isActive = activeMetrics.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggleMetric(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: isActive ? config.color : '#475569',
                  }}
                />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <span>No traffic recorded in this date range.</span>
            <span className="text-[11px] text-slate-600 mt-1">
              Events will plot automatically as visitors navigate the site.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {(Object.keys(METRIC_CONFIG) as ChartMetricKey[]).map((key) => {
                  const config = METRIC_CONFIG[key];
                  return (
                    <linearGradient
                      key={config.gradientId}
                      id={config.gradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
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
                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0c10',
                  border: '1px solid #222731',
                  borderRadius: '14px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '11px',
                }}
                labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
              />

              {activeMetrics.map((key) => {
                const config = METRIC_CONFIG[key];
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={config.label}
                    stroke={config.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${config.gradientId})`}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
