import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
  HelpCircle,
} from 'lucide-react';
import { calculatePercentageChange } from '../../utils/analyticsCalculations';

interface YouTubeMetricCardProps {
  label: string;
  value: string | number;
  previousValue?: number;
  currentNumeric?: number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'purple';
  isSelected?: boolean;
  onClick?: () => void;
  tooltip?: string;
  isLoading?: boolean;
}

const ACCENT_STYLES = {
  blue: {
    border: 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10',
    selectedBorder: 'border-blue-400 bg-gradient-to-br from-blue-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30',
    bar: 'bg-blue-400',
    iconBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-sm shadow-blue-500/20',
    text: 'text-blue-300',
  },
  emerald: {
    border: 'hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10',
    selectedBorder: 'border-emerald-400 bg-gradient-to-br from-emerald-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30',
    bar: 'bg-emerald-400',
    iconBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/20',
    text: 'text-emerald-300',
  },
  amber: {
    border: 'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10',
    selectedBorder: 'border-amber-400 bg-gradient-to-br from-amber-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30',
    bar: 'bg-amber-400',
    iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/20',
    text: 'text-amber-300',
  },
  rose: {
    border: 'hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10',
    selectedBorder: 'border-rose-400 bg-gradient-to-br from-rose-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-rose-500/20 ring-1 ring-rose-400/30',
    bar: 'bg-rose-400',
    iconBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/20',
    text: 'text-rose-300',
  },
  indigo: {
    border: 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10',
    selectedBorder: 'border-indigo-400 bg-gradient-to-br from-indigo-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30',
    bar: 'bg-indigo-400',
    iconBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/20',
    text: 'text-indigo-300',
  },
  cyan: {
    border: 'hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10',
    selectedBorder: 'border-cyan-400 bg-gradient-to-br from-cyan-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30',
    bar: 'bg-cyan-400',
    iconBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/20',
    text: 'text-cyan-300',
  },
  purple: {
    border: 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10',
    selectedBorder: 'border-purple-400 bg-gradient-to-br from-purple-950/40 via-[#0D1527] to-[#0A0F1D] shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/30',
    bar: 'bg-purple-400',
    iconBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/20',
    text: 'text-purple-300',
  },
};

export const YouTubeMetricCard: React.FC<YouTubeMetricCardProps> = ({
  label,
  value,
  previousValue,
  currentNumeric,
  unit,
  subtext,
  icon: Icon,
  accentColor = 'blue',
  isSelected = false,
  onClick,
  tooltip,
  isLoading = false,
}) => {
  const styles = ACCENT_STYLES[accentColor];

  // Percentage change against previous equivalent period
  const change =
    typeof currentNumeric === 'number' && typeof previousValue === 'number'
      ? calculatePercentageChange(currentNumeric, previousValue)
      : null;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative p-5 rounded-2xl bg-[#0D1527]/90 backdrop-blur-sm border transition-all text-left flex flex-col justify-between select-none ${
        isSelected
          ? styles.selectedBorder
          : `border-[#182642] hover:bg-[#111C35] ${styles.border}`
      } ${onClick ? 'cursor-pointer' : ''}`}
      title={tooltip}
    >
      {/* Top row: Label & optional Icon */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {label}
          </span>
          {tooltip && (
            <span title={tooltip} className="text-slate-600 hover:text-slate-400 cursor-help">
              <HelpCircle size={11} />
            </span>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-xl border shrink-0 ${styles.iconBg}`}>
            <Icon size={14} />
          </div>
        )}
      </div>

      {/* Metric Value */}
      <div className="my-1">
        {isLoading ? (
          <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
          </div>
        )}
      </div>

      {/* Bottom row: Trend indicator & comparison subtext */}
      <div className="pt-2 border-t border-[#1a1f29] flex items-center justify-between text-[10px] min-h-[22px]">
        {change !== null && change.pct !== null ? (
          <div
            className={`flex items-center gap-1 font-bold ${
              change.diff === 0
                ? 'text-slate-500'
                : change.isPositive
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {change.diff === 0 ? (
              <Minus size={11} />
            ) : change.isPositive ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            <span>
              {change.diff > 0 ? '+' : ''}
              {change.pct}%
            </span>
            <span className="text-slate-500 font-normal">vs prev period</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[10px] truncate">
            {subtext || 'Telemetry verified'}
          </span>
        )}

        {/* Selected pill indicator */}
        {isSelected && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
        )}
      </div>
    </div>
  );
};
