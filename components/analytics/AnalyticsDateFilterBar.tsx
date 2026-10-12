import React from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { AnalyticsDateFilter, PeriodComparison } from '../../utils/analyticsCalculations';

interface AnalyticsDateFilterBarProps {
  currentFilter: AnalyticsDateFilter;
  comparison: PeriodComparison;
  onFilterChange: (filter: AnalyticsDateFilter) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomRangeChange?: (start: string, end: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const FILTER_OPTIONS: Array<{ id: AnalyticsDateFilter; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_28_days', label: 'Last 28 Days' },
  { id: 'last_90_days', label: 'Last 90 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' },
];

export const AnalyticsDateFilterBar: React.FC<AnalyticsDateFilterBarProps> = ({
  currentFilter,
  comparison,
  onFilterChange,
  customStartDate,
  customEndDate,
  onCustomRangeChange,
  onRefresh,
  isLoading = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [showCustomInputs, setShowCustomInputs] = React.useState(currentFilter === 'custom');
  const [startInput, setStartInput] = React.useState(
    customStartDate || comparison.currentRange.startDate
  );
  const [endInput, setEndInput] = React.useState(
    customEndDate || comparison.currentRange.endDate
  );

  const activeLabel =
    FILTER_OPTIONS.find((f) => f.id === currentFilter)?.label || 'Date Range';

  const handleSelect = (filterId: AnalyticsDateFilter) => {
    onFilterChange(filterId);
    setDropdownOpen(false);
    if (filterId === 'custom') {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (startInput && endInput && onCustomRangeChange) {
      onCustomRangeChange(startInput, endInput);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3 px-4 bg-[#0d0f14] border border-[#1e232e] rounded-2xl">
      {/* Left: Quick Date Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-[#090b0e] border border-[#1b2029] rounded-xl">
          {FILTER_OPTIONS.slice(0, 5).map((opt) => {
            const active = currentFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown for smaller screens / additional options */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[#141822] hover:bg-[#1b212f] border border-[#232938] rounded-xl text-xs font-bold text-white transition-colors"
          >
            <Calendar size={13} className="text-blue-400" />
            <span>{activeLabel}</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-52 bg-[#12161f] border border-[#252c3c] rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors ${
                    currentFilter === opt.id
                      ? 'bg-blue-600/20 text-blue-300 font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{opt.label}</span>
                  {currentFilter === opt.id && <Check size={13} className="text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Date Range Indicator & Previous Period Comparison Info */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {showCustomInputs ? (
          <form onSubmit={handleApplyCustom} className="flex items-center gap-2">
            <input
              type="date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="bg-[#141822] border border-[#232938] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="bg-[#141822] border border-[#232938] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-right">
            <div className="text-slate-300 font-mono font-bold text-[11px]">
              {comparison.currentRange.label}
            </div>
            <div className="text-slate-500 text-[10px]">
              vs. prev {comparison.previousRange.label}
            </div>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-[#141822] hover:bg-[#1b212f] border border-[#232938] rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh Real Telemetry"
          >
            <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>↻</span>
          </button>
        )}
      </div>
    </div>
  );
};
