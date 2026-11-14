import React, { useMemo, useState } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  FileSpreadsheet,
  FileText,
  Loader2,
  Users,
  Wallet,
  TrendingUp,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  PieChart,
  Pie,
} from 'recharts';
import { CompanyInvestment, ExecutiveAccount } from '../../../types';
import { CreateInvestmentInput } from '../../../services/executiveService';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface CompanyInvestmentsSectionProps {
  investments: CompanyInvestment[];
  executiveAccounts?: ExecutiveAccount[];
  onCreateInvestment: (input: CreateInvestmentInput) => Promise<void>;
  onUpdateInvestment: (id: string, updates: Partial<CompanyInvestment>) => Promise<void>;
  onDeleteInvestment: (id: string) => Promise<void>;
}

const INVESTOR_PALETTE = [
  {
    hex: '#2563eb',
    cardBg: 'bg-gradient-to-br from-blue-50/90 via-white to-sky-50/70',
    border: 'border-blue-200/80 hover:border-blue-400',
    iconBg: 'bg-blue-600 text-white',
    barFill: 'bg-blue-600',
    badge: 'bg-blue-100/80 text-blue-800',
  },
  {
    hex: '#10b981',
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70',
    border: 'border-emerald-200/80 hover:border-emerald-400',
    iconBg: 'bg-emerald-600 text-white',
    barFill: 'bg-emerald-600',
    badge: 'bg-emerald-100/80 text-emerald-800',
  },
  {
    hex: '#8b5cf6',
    cardBg: 'bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70',
    border: 'border-violet-200/80 hover:border-violet-400',
    iconBg: 'bg-violet-600 text-white',
    barFill: 'bg-violet-600',
    badge: 'bg-violet-100/80 text-violet-800',
  },
  {
    hex: '#f59e0b',
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70',
    border: 'border-amber-200/80 hover:border-amber-400',
    iconBg: 'bg-amber-500 text-white',
    barFill: 'bg-amber-500',
    badge: 'bg-amber-100/80 text-amber-800',
  },
  {
    hex: '#f43f5e',
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70',
    border: 'border-rose-200/80 hover:border-rose-400',
    iconBg: 'bg-rose-500 text-white',
    barFill: 'bg-rose-500',
    badge: 'bg-rose-100/80 text-rose-800',
  },
];

const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Cheque', 'bKash / MFS', 'Other'];
const ROLE_OPTIONS = ['MD', 'Chairman', 'Director', 'Partner', 'Investor'];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CompanyInvestmentsSection: React.FC<CompanyInvestmentsSectionProps> = ({
  investments,
  executiveAccounts = [],
  onCreateInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
}) => {
  const [selectedInvestorFilter, setSelectedInvestorFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CompanyInvestment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState({
    investor_name: '',
    investor_role: 'MD',
    amount: '',
    invest_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    purpose: '',
    notes: '',
  });

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<CompanyInvestment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Aggregate per-investor totals for Summary Cards & ONE Unified Chart
  const investorSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        role: string;
        totalAmount: number;
        count: number;
        lastDate: string;
      }
    >();

    investments.forEach((entry) => {
      const cleanName = entry.investor_name.trim() || 'Unknown Investor';
      const key = cleanName.toLowerCase();
      const prev = map.get(key);
      const amt = Number(entry.amount) || 0;
      if (prev) {
        prev.totalAmount += amt;
        prev.count += 1;
        if (entry.invest_date > prev.lastDate) {
          prev.lastDate = entry.invest_date;
          prev.role = entry.investor_role || prev.role;
        }
      } else {
        map.set(key, {
          name: cleanName,
          role: entry.investor_role || 'MD',
          totalAmount: amt,
          count: 1,
          lastDate: entry.invest_date || '',
        });
      }
    });

    const list = Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    const grandTotal = list.reduce((s, item) => s + item.totalAmount, 0);

    return list.map((item, idx) => ({
      ...item,
      sharePct: grandTotal > 0 ? Number(((item.totalAmount / grandTotal) * 100).toFixed(1)) : 0,
      theme: INVESTOR_PALETTE[idx % INVESTOR_PALETTE.length],
    }));
  }, [investments]);

  const totalCapital = useMemo(
    () => investments.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [investments]
  );

  // Quick-pick investor suggestions (existing investors + executive accounts)
  const suggestedInvestors = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; role: string }[] = [];
    const add = (name?: string, role?: string) => {
      const clean = (name || '').trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ name: clean, role: (role || 'MD').trim() });
      }
    };

    investorSummaries.forEach((i) => add(i.name, i.role));
    executiveAccounts.forEach((ex) => add(ex.full_name, ex.role));
    return list;
  }, [investorSummaries, executiveAccounts]);

  const filteredInvestments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return investments.filter((item) => {
      if (
        selectedInvestorFilter !== 'ALL' &&
        item.investor_name.trim().toLowerCase() !== selectedInvestorFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.investor_name.toLowerCase().includes(q) ||
        (item.investor_role || '').toLowerCase().includes(q) ||
        (item.purpose || '').toLowerCase().includes(q) ||
        (item.payment_method || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q)
      );
    });
  }, [investments, selectedInvestorFilter, searchTerm]);

  const filteredTotal = useMemo(
    () => filteredInvestments.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [filteredInvestments]
  );

  const openAddModal = (prefillName = '', prefillRole = 'MD') => {
    setEditingEntry(null);
    setFormState({
      investor_name: prefillName,
      investor_role: prefillRole,
      amount: '',
      invest_date: new Date().toISOString().split('T')[0],
      payment_method: 'Bank Transfer',
      purpose: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: CompanyInvestment) => {
    setEditingEntry(entry);
    setFormState({
      investor_name: entry.investor_name,
      investor_role: entry.investor_role || 'MD',
      amount: String(entry.amount ?? 0),
      invest_date: entry.invest_date || new Date().toISOString().split('T')[0],
      payment_method: entry.payment_method || 'Bank Transfer',
      purpose: entry.purpose || '',
      notes: entry.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.investor_name.trim()) return;
    const numericAmount = Math.max(0, Number(formState.amount) || 0);
    if (numericAmount <= 0) return;

    setIsSaving(true);
    try {
      if (editingEntry) {
        await onUpdateInvestment(editingEntry.id, {
          investor_name: formState.investor_name.trim(),
          investor_role: formState.investor_role.trim() || 'MD',
          amount: numericAmount,
          invest_date: formState.invest_date,
          payment_method: formState.payment_method,
          purpose: formState.purpose.trim(),
          notes: formState.notes.trim(),
        });
      } else {
        await onCreateInvestment({
          investor_name: formState.investor_name.trim(),
          investor_role: formState.investor_role.trim() || 'MD',
          amount: numericAmount,
          invest_date: formState.invest_date,
          payment_method: formState.payment_method,
          purpose: formState.purpose.trim(),
          notes: formState.notes.trim(),
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteInvestment(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPDF = () => {
    if (filteredInvestments.length === 0) return;
    const headers = ['#', 'Date', 'Investor / MD', 'Role', 'Method', 'Purpose', 'Amount (BDT)'];
    const rows: (string | number)[][] = filteredInvestments.map((item, idx) => [
      idx + 1,
      item.invest_date || '-',
      item.investor_name,
      item.investor_role || 'MD',
      item.payment_method || 'Bank Transfer',
      item.purpose || item.notes || '-',
      `Tk ${(Number(item.amount) || 0).toLocaleString()}`,
    ]);

    investorSummaries.forEach((inv) => {
      rows.push([
        'SUMMARY',
        '-',
        inv.name,
        inv.role,
        `${inv.count} entries`,
        `${inv.sharePct}% share`,
        `Tk ${inv.totalAmount.toLocaleString()}`,
      ]);
    });

    rows.push([
      'GRAND TOTAL',
      '-',
      `${investorSummaries.length} Investors`,
      '-',
      `${filteredInvestments.length} entries`,
      '100%',
      `Tk ${filteredTotal.toLocaleString()}`,
    ]);

    exportToPDF({
      filename: `Carelink_Investments_${new Date().toISOString().split('T')[0]}`,
      title: 'Carelink Healthineers - Partner & MD Investment Report',
      subtitle: `Total Capital Invested: Tk ${totalCapital.toLocaleString()} | Investors: ${investorSummaries.length}`,
      headers,
      rows,
    });
  };

  const handleExportExcel = () => {
    if (filteredInvestments.length === 0) return;
    const headers = [
      'Date',
      'Investor / MD',
      'Role',
      'Amount (BDT)',
      'Payment Method',
      'Purpose',
      'Notes',
      'Recorded By',
    ];
    const rows: (string | number)[][] = filteredInvestments.map((item) => [
      item.invest_date || '',
      item.investor_name,
      item.investor_role || 'MD',
      Number(item.amount) || 0,
      item.payment_method || 'Bank Transfer',
      item.purpose || '-',
      item.notes || '',
      item.recorded_by || '-',
    ]);
    rows.push([
      'TOTAL INVESTED',
      `${investorSummaries.length} Investors`,
      '-',
      filteredTotal,
      '',
      '',
      '',
      '',
    ]);

    exportToExcel({
      filename: `Carelink_Investments_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Investments',
      headers,
      rows,
    });
  };

  const topInvestor = investorSummaries[0];

  return (
    <div className="space-y-5">
      {/* Cute Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white shadow-lg border border-slate-800/80">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-emerald-400/15 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-300/25 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <Landmark size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Invest &amp; MD Capital <span className="text-emerald-300 font-bold">(বিনিয়োগ হিসাব)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Track who invested how much across your MDs &amp; partners and compare every contribution in one unified chart.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {filteredInvestments.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                >
                  <FileSpreadsheet size={14} className="text-emerald-300" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-rose-600/25 transition-all"
                >
                  <FileText size={14} />
                  <span>PDF Export</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => openAddModal()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/30 transition-all"
            >
              <Plus size={16} />
              <span>Add Investment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-gradient-to-br from-emerald-50/80 via-white to-white rounded-2xl border border-emerald-200/70 shadow-xs flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800">Total Invested Capital</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950 mt-1 tabular-nums">
              ৳{totalCapital.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">All MDs &amp; partners combined</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet size={17} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Investors / MDs</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {investorSummaries.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active contributors</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={17} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Investment Entries</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {investments.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Recorded deposits</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0">
            <TrendingUp size={17} />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50/80 via-white to-white rounded-2xl border border-amber-200/70 shadow-xs flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-amber-800">Top Investor</div>
            <div className="text-base font-extrabold text-slate-900 mt-1 truncate">
              {topInvestor ? topInvestor.name : '—'}
            </div>
            <div className="text-[11px] text-amber-700 font-bold mt-0.5 tabular-nums">
              {topInvestor ? `${topInvestor.sharePct}% · ৳${topInvestor.totalAmount.toLocaleString()}` : 'No entries yet'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Award size={17} />
          </div>
        </div>
      </div>

      {/* Empty State or Investor Cards + ONE Unified Comparison Chart */}
      {investments.length === 0 ? (
        <div className="bg-gradient-to-b from-white via-emerald-50/20 to-sky-50/20 rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Landmark size={26} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            No investments recorded yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add each MD or partner&apos;s investment amount (for example 3 MDs) to see everyone&apos;s total contribution &amp; share compared in one clear chart.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => openAddModal()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Plus size={15} />
              <span>Record First Investment</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cute Investor / MD Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investorSummaries.map((inv) => {
              const isSelected =
                selectedInvestorFilter.toLowerCase() === inv.name.toLowerCase();
              return (
                <div
                  key={inv.name}
                  className={`relative overflow-hidden rounded-3xl border p-5 transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg bg-white'
                      : `${inv.theme.border} ${inv.theme.cardBg} shadow-xs hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInvestorFilter((prev) =>
                          prev.toLowerCase() === inv.name.toLowerCase() ? 'ALL' : inv.name
                        )
                      }
                      className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                      title="Click to filter ledger by this investor"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-extrabold shrink-0 shadow-sm ${inv.theme.iconBg}`}
                      >
                        {getInitials(inv.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {inv.name}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.theme.badge}`}>
                            {inv.role}
                          </span>
                          <span>· {inv.count} {inv.count === 1 ? 'deposit' : 'deposits'}</span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAddModal(inv.name, inv.role)}
                      title={`Add investment for ${inv.name}`}
                      className="p-2 rounded-xl bg-white/90 hover:bg-emerald-600 text-slate-600 hover:text-white border border-slate-200/80 hover:border-emerald-600 shadow-2xs cursor-pointer transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <div className="text-xl font-extrabold font-mono text-slate-900 tabular-nums">
                      ৳{inv.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs font-extrabold text-slate-700 tabular-nums">
                      {inv.sharePct}% share
                    </div>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${inv.theme.barFill} transition-all duration-500`}
                      style={{ width: `${Math.max(4, inv.sharePct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ONE UNIFIED CHART FOR ALL INVESTORS / MDs */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <BarChart3 size={18} className="text-emerald-600" />
                  <span>All Investors Comparison Chart</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Who invested how much across {investorSummaries.length}{' '}
                  {investorSummaries.length === 1 ? 'investor' : 'investors'} in one clear view.
                </p>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    chartType === 'bar'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 size={13} />
                  <span>Bar Chart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    chartType === 'pie'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieChartIcon size={13} />
                  <span>Share Pie</span>
                </button>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={investorSummaries}
                    margin={{ top: 24, right: 20, left: 10, bottom: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val >= 1000 ? `৳${Math.round(val / 1000)}k` : `৳${val}`
                      }
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      formatter={(val: any, _name: any, props: any) => [
                        `৳${Number(val).toLocaleString()} (${props?.payload?.sharePct ?? 0}%)`,
                        'Invested',
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '14px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="totalAmount" radius={[12, 12, 0, 0]} maxBarSize={76}>
                      {investorSummaries.map((entry, idx) => (
                        <Cell key={entry.name} fill={INVESTOR_PALETTE[idx % INVESTOR_PALETTE.length].hex} />
                      ))}
                      <LabelList
                        dataKey="totalAmount"
                        position="top"
                        formatter={(val: any) => `৳${Number(val).toLocaleString()}`}
                        style={{ fill: '#0f172a', fontSize: 11, fontWeight: 800 }}
                      />
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={investorSummaries}
                      dataKey="totalAmount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={112}
                      paddingAngle={4}
                      label={({ name, payload }: any) =>
                        `${name} (${payload?.sharePct ?? 0}%)`
                      }
                    >
                      {investorSummaries.map((entry, idx) => (
                        <Cell key={entry.name} fill={INVESTOR_PALETTE[idx % INVESTOR_PALETTE.length].hex} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, props: any) => [
                        `৳${Number(val).toLocaleString()} (${props?.payload?.sharePct ?? 0}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '14px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search investor, purpose, method..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                {selectedInvestorFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedInvestorFilter('ALL')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
                  >
                    <span>Showing: {selectedInvestorFilter}</span>
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-slate-600 tabular-nums">
                Showing {filteredInvestments.length} entries ·{' '}
                <span className="text-emerald-700 font-mono font-extrabold">
                  ৳{filteredTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Investor / MD</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Purpose / Notes</th>
                    <th className="py-3.5 px-4 text-right">Amount (BDT)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredInvestments.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {entry.invest_date}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {entry.investor_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {entry.investor_role || 'MD'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{entry.payment_method}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {entry.purpose || entry.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 tabular-nums whitespace-nowrap">
                        ৳{(Number(entry.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(entry)}
                            title="Edit entry"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(entry)}
                            title="Delete entry"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50/60 border-t border-emerald-200 text-xs font-extrabold text-slate-900">
                    <td colSpan={5} className="py-3 px-4 text-right">
                      TOTAL INVESTED
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800 tabular-nums">
                      ৳{filteredTotal.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ADD / EDIT INVESTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Landmark size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingEntry ? 'Edit Investment' : 'Record Investment'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Log MD or partner capital contribution.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {suggestedInvestors.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                    Quick Pick MD / Investor
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedInvestors.map((sug) => {
                      const active =
                        formState.investor_name.trim().toLowerCase() === sug.name.toLowerCase();
                      return (
                        <button
                          key={sug.name}
                          type="button"
                          onClick={() =>
                            setFormState((p) => ({
                              ...p,
                              investor_name: sug.name,
                              investor_role: sug.role || p.investor_role,
                            }))
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          {sug.name} ({sug.role})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700">Investor / MD Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.investor_name}
                    onChange={(e) => setFormState((p) => ({ ...p, investor_name: e.target.value }))}
                    placeholder="e.g., MD 1 / Rahim Uddin"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Role / Designation</label>
                  <select
                    value={formState.investor_role}
                    onChange={(e) => setFormState((p) => ({ ...p, investor_role: e.target.value }))}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Invest Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={formState.amount}
                    onChange={(e) => setFormState((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="e.g., 500000"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Invest Date</label>
                  <input
                    type="date"
                    value={formState.invest_date}
                    onChange={(e) => setFormState((p) => ({ ...p, invest_date: e.target.value }))}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Payment Method</label>
                  <select
                    value={formState.payment_method}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, payment_method: e.target.value }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Purpose / Notes</label>
                  <textarea
                    rows={2}
                    value={formState.purpose}
                    onChange={(e) => setFormState((p) => ({ ...p, purpose: e.target.value }))}
                    placeholder="e.g., Initial company capital, Equipment import fund..."
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingEntry ? 'Save Changes' : 'Save Investment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Delete Investment Entry?</h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Remove{' '}
              <span className="font-bold text-slate-900">
                ৳{(Number(deleteTarget.amount) || 0).toLocaleString()}
              </span>{' '}
              from <span className="font-bold text-slate-900">{deleteTarget.investor_name}</span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
