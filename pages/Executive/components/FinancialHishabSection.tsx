import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Edit3,
  Save,
  X,
  CreditCard,
  Building,
  Users,
  Plus,
  Clock,
  Paperclip,
  ArrowRight,
  Wallet,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { TaDaClaim, CompanyNote, ProductSaleRecord, ExpenseAttachment } from '../../../types';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';
import { ReceiptGallery, ReceiptPreviewModal } from '../../../components/common/ReceiptPreviewModal';
import {
  isCompanyOpsNote,
  getCompanyNoteAmount,
  getCompanyNoteMonthKey,
  getTaDaClaimTotal,
  getTaDaClaimMonthKey,
  getSaleMonthKey,
  extractMonthKey,
} from '../../../utils/financialHelper';

interface FinancialHishabSectionProps {
  tadaClaims: TaDaClaim[];
  companyNotes: CompanyNote[];
  salesRecords: ProductSaleRecord[];
  monthlyBudget: number;
  monthlyBudgets?: Record<string, number>;
  onUpdateBudget: (newBudget: number, monthKey?: string) => Promise<void>;
  currentMonthKey: string;
  onReviewTaDa?: (claimId: string, status: 'approved' | 'rejected', remarks?: string) => Promise<void>;
  onToggleTaDaPayment?: (claimId: string, currentStatus: 'unpaid' | 'paid') => Promise<void>;
  onAddExpenseNote?: (note: { title: string; content: string; amount: number; date: string }) => Promise<void>;
  onDeleteExpenseNote?: (noteId: string) => Promise<void>;
}

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

type ScopeMode = 'monthly' | 'all';
type TaDaInclusionMode = 'active' | 'approved' | 'paid' | 'all';
type LedgerSubTab = 'summary' | 'tada-items' | 'company-items' | 'staff-breakdown';

export const FinancialHishabSection: React.FC<FinancialHishabSectionProps> = ({
  tadaClaims,
  companyNotes,
  salesRecords,
  monthlyBudget,
  monthlyBudgets,
  onUpdateBudget,
  currentMonthKey,
  onReviewTaDa,
  onToggleTaDaPayment,
  onAddExpenseNote,
  onDeleteExpenseNote,
}) => {
  const [scope, setScope] = useState<ScopeMode>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    currentMonthKey || new Date().toISOString().slice(0, 7)
  );
  const [tadaInclusion, setTadaInclusion] = useState<TaDaInclusionMode>('active');
  const [ledgerTab, setLedgerTab] = useState<LedgerSubTab>('summary');
  const [receiptPreview, setReceiptPreview] = useState<{
    active: ExpenseAttachment;
    list: ExpenseAttachment[];
  } | null>(null);

  const activeMonthBudget = useMemo(() => {
    if (monthlyBudgets && monthlyBudgets[selectedMonth] !== undefined) {
      return monthlyBudgets[selectedMonth];
    }
    return monthlyBudget;
  }, [monthlyBudgets, selectedMonth, monthlyBudget]);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(activeMonthBudget.toString());
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Quick Add Company Expense Modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
  });
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  useEffect(() => {
    setBudgetInput(activeMonthBudget.toString());
  }, [activeMonthBudget, selectedMonth]);

  // Helper to check if a claim passes the TA/DA status filter
  const matchesTaDaStatusFilter = (c: TaDaClaim, mode: TaDaInclusionMode) => {
    if (mode === 'active') return c.status !== 'rejected' && c.status !== 'draft';
    if (mode === 'approved') return c.status === 'approved';
    if (mode === 'paid') return c.payment_status === 'paid' && c.status !== 'rejected';
    return true;
  };

  // All valid active TA/DA claims across entire DB (used to detect other-month mismatches)
  const allActiveClaims = useMemo(
    () => tadaClaims.filter((c) => matchesTaDaStatusFilter(c, tadaInclusion)),
    [tadaClaims, tadaInclusion]
  );

  // All Company Operational Expense entries across entire DB (any 'expense' note OR note with amount > 0)
  const allOpsNotes = useMemo(
    () => companyNotes.filter(isCompanyOpsNote),
    [companyNotes]
  );

  const allOpsTotal = useMemo(
    () => allOpsNotes.reduce((acc, n) => acc + getCompanyNoteAmount(n), 0),
    [allOpsNotes]
  );

  // Available months containing TA/DA claims (sorted descending)
  const claimMonthsSummary = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    allActiveClaims.forEach((c) => {
      const m = getTaDaClaimMonthKey(c);
      if (!m) return;
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += getTaDaClaimTotal(c);
    });
    return Object.entries(map)
      .map(([month, info]) => ({ month, ...info }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [allActiveClaims]);

  // Available months containing Company Ops expenses (sorted descending)
  const opsMonthsSummary = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    allOpsNotes.forEach((n) => {
      const m = getCompanyNoteMonthKey(n);
      if (!m) return;
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += getCompanyNoteAmount(n);
    });
    return Object.entries(map)
      .map(([month, info]) => ({ month, ...info }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [allOpsNotes]);

  // Filter datasets by scope (monthly vs all) + TA/DA status filter
  const filteredClaims = useMemo(() => {
    return allActiveClaims.filter((c) => {
      if (scope === 'all') return true;
      const claimMonth = getTaDaClaimMonthKey(c);
      const startM = extractMonthKey(c.travel_start_date);
      const endM = extractMonthKey(c.travel_end_date);
      const subM = extractMonthKey(c.submitted_at);
      return (
        claimMonth === selectedMonth ||
        startM === selectedMonth ||
        endM === selectedMonth ||
        subM === selectedMonth
      );
    });
  }, [allActiveClaims, scope, selectedMonth]);

  // Count excluded claims in current scope so nothing feels silently missing
  const scopedExcludedCounts = useMemo(() => {
    const inPeriod = tadaClaims.filter((c) => {
      if (scope === 'all') return true;
      const claimMonth = getTaDaClaimMonthKey(c);
      const startM = extractMonthKey(c.travel_start_date);
      const endM = extractMonthKey(c.travel_end_date);
      const subM = extractMonthKey(c.submitted_at);
      return (
        claimMonth === selectedMonth ||
        startM === selectedMonth ||
        endM === selectedMonth ||
        subM === selectedMonth
      );
    });
    return {
      drafts: inPeriod.filter((c) => c.status === 'draft').length,
      rejected: inPeriod.filter((c) => c.status === 'rejected').length,
      submittedPending: inPeriod.filter((c) => c.status === 'submitted').length,
    };
  }, [tadaClaims, scope, selectedMonth]);

  const filteredNotes = useMemo(() => {
    return allOpsNotes.filter((n) => {
      if (scope === 'all') return true;
      return getCompanyNoteMonthKey(n) === selectedMonth;
    });
  }, [allOpsNotes, scope, selectedMonth]);

  const filteredSales = useMemo(() => {
    return salesRecords.filter((s) => {
      if (scope === 'all') return true;
      return getSaleMonthKey(s) === selectedMonth;
    });
  }, [salesRecords, scope, selectedMonth]);

  // Budget calculation (single month or cumulative across active months if All Time)
  const effectiveBudget = useMemo(() => {
    if (scope === 'monthly') return activeMonthBudget;
    if (!monthlyBudgets || Object.keys(monthlyBudgets).length === 0) return monthlyBudget;
    return Object.values(monthlyBudgets).reduce<number>((acc, v) => acc + (Number(v) || 0), 0);
  }, [scope, activeMonthBudget, monthlyBudgets, monthlyBudget]);

  // Calculations for "All Total Hishab Koto Hoilo"
  const totals = useMemo(() => {
    // 1. Personal / Staff Field Expenses (TA/DA)
    const personalTravel = filteredClaims.reduce((acc, c) => acc + (Number(c.travel_allowance) || 0), 0);
    const personalDaily = filteredClaims.reduce((acc, c) => acc + (Number(c.daily_allowance) || 0), 0);
    const personalTransport = filteredClaims.reduce((acc, c) => acc + (Number(c.transportation_expense) || 0), 0);
    const personalFoodHotel = filteredClaims.reduce((acc, c) => acc + (Number(c.accommodation_food_expense) || 0), 0);
    const totalPersonalExpenses = filteredClaims.reduce((acc, c) => acc + getTaDaClaimTotal(c), 0);

    // Sub-breakdowns for TA/DA disbursement visibility
    const tadaPaidAmount = filteredClaims
      .filter((c) => c.payment_status === 'paid')
      .reduce((acc, c) => acc + getTaDaClaimTotal(c), 0);
    const tadaApprovedUnpaid = filteredClaims
      .filter((c) => c.status === 'approved' && c.payment_status !== 'paid')
      .reduce((acc, c) => acc + getTaDaClaimTotal(c), 0);
    const tadaPendingApproval = filteredClaims
      .filter((c) => c.status === 'submitted')
      .reduce((acc, c) => acc + getTaDaClaimTotal(c), 0);

    // 2. Company Operational Expenses (from Company Ops Notes)
    const totalCompanyExpenses = filteredNotes.reduce((acc, n) => acc + getCompanyNoteAmount(n), 0);

    // 3. All Total Expenses
    const allTotalExpenses = totalPersonalExpenses + totalCompanyExpenses;

    // 4. Product Sales & Inflow
    const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + (Number(s.sale_value) || 0), 0);
    const totalCollectedCash = filteredSales.reduce((acc, s) => acc + (Number(s.paid_amount) || 0), 0);
    const totalDueReceivables = filteredSales.reduce((acc, s) => acc + (Number(s.due_amount) || 0), 0);

    // 5. Budget Tracking & Net Margin
    const budgetRemaining = effectiveBudget - allTotalExpenses;
    const budgetPercentUsed =
      effectiveBudget > 0 ? Math.min(Math.round((allTotalExpenses / effectiveBudget) * 100), 100) : 0;
    const netCashMargin = totalCollectedCash - allTotalExpenses;
    const netRevenueMargin = totalSalesRevenue - allTotalExpenses;
    const collectionRate =
      totalSalesRevenue > 0 ? Math.round((totalCollectedCash / totalSalesRevenue) * 100) : 0;

    return {
      personalTravel,
      personalDaily,
      personalTransport,
      personalFoodHotel,
      totalPersonalExpenses,
      tadaPaidAmount,
      tadaApprovedUnpaid,
      tadaPendingApproval,
      totalCompanyExpenses,
      allTotalExpenses,
      totalSalesRevenue,
      totalCollectedCash,
      totalDueReceivables,
      budgetRemaining,
      budgetPercentUsed,
      netCashMargin,
      netRevenueMargin,
      collectionRate,
    };
  }, [filteredClaims, filteredNotes, filteredSales, effectiveBudget]);

  // Employee-wise TA/DA Aggregation
  const staffExpenseBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        employee_id: string;
        employee_name: string;
        employee_code: string;
        claimCount: number;
        ta: number;
        da: number;
        transport: number;
        foodHotel: number;
        total: number;
        paid: number;
        unpaid: number;
      }
    > = {};

    filteredClaims.forEach((c) => {
      const key = c.employee_id || c.employee_name || 'unknown';
      if (!map[key]) {
        map[key] = {
          employee_id: key,
          employee_name: c.employee_name || 'Unknown Staff',
          employee_code: c.employee_code || '—',
          claimCount: 0,
          ta: 0,
          da: 0,
          transport: 0,
          foodHotel: 0,
          total: 0,
          paid: 0,
          unpaid: 0,
        };
      }
      const amt = getTaDaClaimTotal(c);
      map[key].claimCount += 1;
      map[key].ta += Number(c.travel_allowance) || 0;
      map[key].da += Number(c.daily_allowance) || 0;
      map[key].transport += Number(c.transportation_expense) || 0;
      map[key].foodHotel += Number(c.accommodation_food_expense) || 0;
      map[key].total += amt;
      if (c.payment_status === 'paid') map[key].paid += amt;
      else map[key].unpaid += amt;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredClaims]);

  // 6-Month Cash Flow & Profit Trend Data
  const monthlyTrendData = useMemo(() => {
    const monthSet = new Set<string>();
    const baseDate = new Date(`${selectedMonth}-01T00:00:00`);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const months = Array.from(monthSet).sort();

    return months.map((m) => {
      const mSales = salesRecords.filter((s) => getSaleMonthKey(s) === m);
      const mClaims = allActiveClaims.filter((c) => getTaDaClaimMonthKey(c) === m);
      const mNotes = allOpsNotes.filter((n) => getCompanyNoteMonthKey(n) === m);

      const collected = mSales.reduce((acc, s) => acc + (Number(s.paid_amount) || 0), 0);
      const tada = mClaims.reduce((acc, c) => acc + getTaDaClaimTotal(c), 0);
      const ops = mNotes.reduce((acc, n) => acc + getCompanyNoteAmount(n), 0);
      const totalExpense = tada + ops;

      return {
        month: m,
        Collected: collected,
        'TA/DA Expense': tada,
        'Company Ops': ops,
        'Net Balance': collected - totalExpense,
      };
    });
  }, [selectedMonth, salesRecords, allActiveClaims, allOpsNotes]);

  // Chart Data: Financial Comparison
  const comparisonChartData = useMemo(() => {
    return [
      {
        name: scope === 'all' ? 'Budget Ref' : 'Month Budget',
        amount: effectiveBudget,
        color: '#6366f1',
      },
      {
        name: 'Sales Revenue',
        amount: totals.totalSalesRevenue,
        color: '#0d9488',
      },
      {
        name: 'Collected Cash',
        amount: totals.totalCollectedCash,
        color: '#0284c7',
      },
      {
        name: 'Staff TA/DA',
        amount: totals.totalPersonalExpenses,
        color: '#f59e0b',
      },
      {
        name: 'Company Ops',
        amount: totals.totalCompanyExpenses,
        color: '#e11d48',
      },
      {
        name: 'Net Cash',
        amount: Math.max(0, totals.netCashMargin),
        color: '#10b981',
      },
    ];
  }, [effectiveBudget, totals, scope]);

  // Chart Data: Expense Category Breakdown
  const expensePieData = useMemo(() => {
    const data = [
      { name: 'Field Travel Allowance', value: totals.personalTravel },
      { name: 'Daily Field Allowance', value: totals.personalDaily },
      { name: 'Local Transportation', value: totals.personalTransport },
      { name: 'Hotel & Fooding', value: totals.personalFoodHotel },
      { name: 'Company Office / Ops Expenses', value: totals.totalCompanyExpenses },
    ].filter((item) => item.value > 0);

    return data.length > 0 ? data : [{ name: 'No Expenses Logged', value: 1 }];
  }, [totals]);

  const handleSaveBudget = async () => {
    const val = Number(budgetInput);
    if (isNaN(val) || val < 0) return;
    setIsSavingBudget(true);
    try {
      await onUpdateBudget(val, selectedMonth);
      setIsEditingBudget(false);
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleAddQuickExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddExpenseNote || !expenseForm.title.trim()) return;
    const amt = Number(expenseForm.amount) || 0;
    if (amt <= 0) {
      setExpenseError('Please enter a valid expense amount greater than 0.');
      return;
    }
    setExpenseError(null);
    setIsSavingExpense(true);
    try {
      const targetDate = expenseForm.date || new Date().toISOString().split('T')[0];
      await onAddExpenseNote({
        title: expenseForm.title.trim(),
        content: expenseForm.content.trim() || 'Recorded via Financial & Budget Hub',
        amount: amt,
        date: targetDate,
      });
      const savedMonth = extractMonthKey(targetDate);
      if (scope === 'monthly' && savedMonth && savedMonth !== selectedMonth) {
        setSelectedMonth(savedMonth);
      }
      setExpenseForm({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        content: '',
      });
      setShowAddExpenseModal(false);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const periodLabel = scope === 'all' ? 'All_Time_Cumulative' : selectedMonth;

  // Export Hishab to Excel
  const handleExportHishabExcel = () => {
    const headers = ['Category / Item', 'Type', 'Amount (BDT)', 'Notes / Status'];
    const rows: (string | number)[][] = [
      ['Budget Allocated Ceiling', 'Target Budget', effectiveBudget, `Scope: ${periodLabel}`],
      ['Total Equipment Sales Revenue', 'Inflow (Booked)', totals.totalSalesRevenue, `${filteredSales.length} Equipment Orders`],
      ['Total Cash Collected', 'Inflow (Received)', totals.totalCollectedCash, `${totals.collectionRate}% Realization`],
      ['Total Due Receivables', 'Inflow (Pending)', totals.totalDueReceivables, 'Pending Doctor / Center Collection'],
      ['Personal Field Expenses (TA/DA Claims)', 'Outflow (Staff)', totals.totalPersonalExpenses, `${filteredClaims.length} Claims (Paid: Tk ${totals.tadaPaidAmount.toLocaleString()}, Unpaid Approved: Tk ${totals.tadaApprovedUnpaid.toLocaleString()})`],
      ['  - Travel Allowance', 'Sub-Expense', totals.personalTravel, 'Bus, Train & Intercity'],
      ['  - Daily Allowance (DA)', 'Sub-Expense', totals.personalDaily, 'Per-diem field duty'],
      ['  - Transportation Expense', 'Sub-Expense', totals.personalTransport, 'Local Rickshaw, CNG, Taxi'],
      ['  - Food & Hotel Lodging', 'Sub-Expense', totals.personalFoodHotel, 'Outstation Accommodation'],
      ['Company Operational Expenses (Notes)', 'Outflow (Operations)', totals.totalCompanyExpenses, `${filteredNotes.length} Expense Notes`],
      ['ALL TOTAL EXPENSES KOTO HOILO', 'Grand Total Outflow', totals.allTotalExpenses, `${totals.budgetPercentUsed}% of Budget Used`],
      ['BUDGET REMAINING BALANCE', 'Budget Surplus', totals.budgetRemaining, totals.budgetRemaining >= 0 ? 'Within Budget' : 'Over Budget'],
      ['NET CASH SURPLUS / PROFIT MARGIN', 'Net Profit Margin', totals.netCashMargin, totals.netCashMargin >= 0 ? 'Positive Operating Surplus' : 'Deficit'],
    ];

    exportToExcel({
      filename: `Carelink_Executive_Hishab_${periodLabel}`,
      sheetName: 'Financial Hishab',
      headers,
      rows,
    });
  };

  // Export Hishab to PDF
  const handleExportHishabPDF = () => {
    const headers = ['Category / Item', 'Type', 'Amount (BDT)', 'Notes'];
    const rows: (string | number)[][] = [
      ['Budget Allocated', 'Target', `Tk ${effectiveBudget.toLocaleString()}`, `Scope: ${scope === 'all' ? 'All Time' : selectedMonth}`],
      ['Total Equipment Sales Revenue', 'Inflow', `Tk ${totals.totalSalesRevenue.toLocaleString()}`, `${filteredSales.length} Orders`],
      ['Total Cash Collected', 'Cash In', `Tk ${totals.totalCollectedCash.toLocaleString()}`, `${totals.collectionRate}% Collected`],
      ['Total Due Receivables', 'Due In', `Tk ${totals.totalDueReceivables.toLocaleString()}`, 'Pending Receivables'],
      ['Personal Field Expenses (TA/DA)', 'Staff Outflow', `Tk ${totals.totalPersonalExpenses.toLocaleString()}`, `${filteredClaims.length} Claims`],
      ['Company Operational Notes', 'Ops Outflow', `Tk ${totals.totalCompanyExpenses.toLocaleString()}`, `${filteredNotes.length} Items`],
      ['ALL TOTAL EXPENSES', 'Grand Outflow', `Tk ${totals.allTotalExpenses.toLocaleString()}`, `${totals.budgetPercentUsed}% Budget Used`],
      ['NET CASH SURPLUS (HISHAB)', 'Net Balance', `Tk ${totals.netCashMargin.toLocaleString()}`, totals.netCashMargin >= 0 ? 'Surplus' : 'Deficit'],
    ];

    exportToPDF({
      filename: `Carelink_Executive_Hishab_${periodLabel}`,
      title: 'Carelink Healthineers — Executive Financial Hishab',
      subtitle: `Official Accounting Summary · Period: ${scope === 'all' ? 'Cumulative All Months' : selectedMonth} · MD & Board of Directors`,
      headers,
      rows,
    });
  };

  const latestOtherTaDaMonth = claimMonthsSummary.find((m) => m.month !== selectedMonth);
  const latestOtherOpsMonth = opsMonthsSummary.find((m) => m.month !== selectedMonth);
  const showTaDaMismatch = scope === 'monthly' && filteredClaims.length === 0 && Boolean(latestOtherTaDaMonth);
  const showOpsMismatch = scope === 'monthly' && filteredNotes.length === 0 && Boolean(latestOtherOpsMonth);
  const recommendedJumpMonth = latestOtherOpsMonth?.month || latestOtherTaDaMonth?.month || '';

  return (
    <div className="space-y-6">
      {/* Top Controls, Scope Toggle, Month Picker & Quick Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 lg:p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-600 shrink-0" size={22} />
            <span>Executive Financial &amp; Budget Hishab (সর্বমোট হিসাব)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified accounting hub combining Staff TA/DA Claims, Company Operational Expenses, Equipment Sales &amp; Cash Balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scope Segmented Toggle: Monthly vs All Time */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setScope('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scope === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scope === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time (সর্বমোট)
            </button>
          </div>

          {/* Month Selector */}
          {scope === 'monthly' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-hidden text-xs cursor-pointer tabular-nums"
              />
            </div>
          )}

          {/* TA/DA Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap">TA/DA Scope:</span>
            <select
              value={tadaInclusion}
              onChange={(e) => setTadaInclusion(e.target.value as TaDaInclusionMode)}
              className="bg-transparent text-slate-900 font-bold focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="active">Active (Submitted + Approved)</option>
              <option value="approved">Approved Only</option>
              <option value="paid">Paid / Disbursed Only</option>
              <option value="all">All (Incl. Draft/Rejected)</option>
            </select>
          </div>

          {onAddExpenseNote && (
            <button
              onClick={() => {
                setExpenseError(null);
                setShowAddExpenseModal(true);
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Plus size={14} />
              <span>Log Expense</span>
            </button>
          )}

          <button
            onClick={handleExportHishabExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet size={15} />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportHishabPDF}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Download size={15} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* SMART ALERT BANNER: If selected month is missing TA/DA or Company Ops entries that exist in other months */}
      {(showTaDaMismatch || showOpsMismatch) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3 text-amber-900">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-1">
              {showTaDaMismatch && latestOtherTaDaMonth && (
                <div className="font-bold">
                  No active TA/DA claims in {selectedMonth}, but {allActiveClaims.length} claim(s) totaling{' '}
                  <span className="font-mono tabular-nums">
                    ৳{allActiveClaims.reduce((s, c) => s + getTaDaClaimTotal(c), 0).toLocaleString()}
                  </span>{' '}
                  exist in {claimMonthsSummary.map((m) => m.month).slice(0, 3).join(', ')}.
                </div>
              )}
              {showOpsMismatch && latestOtherOpsMonth && (
                <div className="font-bold text-rose-900">
                  No Company Ops expenses in {selectedMonth}, but {allOpsNotes.length} entry/entries totaling{' '}
                  <span className="font-mono tabular-nums">
                    ৳{allOpsTotal.toLocaleString()}
                  </span>{' '}
                  exist in {opsMonthsSummary.map((m) => m.month).slice(0, 3).join(', ')}.
                </div>
              )}
              <div className="text-[11px] text-amber-800">
                Switch to &quot;All Time (সর্বমোট)&quot; for cumulative Hishab or jump directly to {recommendedJumpMonth}.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {recommendedJumpMonth && (
              <button
                onClick={() => setSelectedMonth(recommendedJumpMonth)}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Jump to {recommendedJumpMonth}
              </button>
            )}
            <button
              onClick={() => setScope('all')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Show All Time
            </button>
          </div>
        </div>
      )}

      {/* KPI Hishab Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Monthly / Period Budget */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              {scope === 'all' ? 'Cumulative Budget Ref' : 'This Month Budget'}
            </span>
            {scope === 'monthly' && (
              <button
                onClick={() => {
                  setBudgetInput(activeMonthBudget.toString());
                  setIsEditingBudget(!isEditingBudget);
                }}
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                title="Edit budget for selected month"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>

          {isEditingBudget && scope === 'monthly' ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-2.5 py-1 text-sm font-mono tabular-nums font-bold bg-slate-50 border border-indigo-300 rounded-lg focus:outline-hidden"
              />
              <button
                onClick={handleSaveBudget}
                disabled={isSavingBudget}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                <Save size={14} />
              </button>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
                ৳{effectiveBudget.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium flex items-center justify-between">
                <span>Budget Allocated</span>
                <span className="font-mono tabular-nums">{scope === 'all' ? 'All Months' : selectedMonth}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 tabular-nums">
              <span>Utilized: {totals.budgetPercentUsed}%</span>
              <span>Rem: ৳{Math.max(0, totals.budgetRemaining).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  totals.budgetPercentUsed > 90
                    ? 'bg-rose-600'
                    : totals.budgetPercentUsed > 70
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${totals.budgetPercentUsed}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Personal & Field Staff Expenses (TA/DA) */}
        <div
          onClick={() => setLedgerTab('tada-items')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
          title="Click to view itemized TA/DA claims"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Staff Field Expenses (TA/DA)
            </span>
            <Receipt size={16} className="text-amber-600 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
              ৳{totals.totalPersonalExpenses.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-amber-700 font-medium flex items-center justify-between">
              <span>{filteredClaims.length} active claims</span>
              <span className="font-mono tabular-nums">Paid: ৳{totals.tadaPaidAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-600 grid grid-cols-2 gap-1 font-mono tabular-nums">
            <span>Travel: ৳{totals.personalTravel.toLocaleString()}</span>
            <span>Food/Htl: ৳{totals.personalFoodHotel.toLocaleString()}</span>
            <span>Local: ৳{totals.personalTransport.toLocaleString()}</span>
            <span>DA: ৳{totals.personalDaily.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. Company Operational Expenses */}
        <div
          onClick={() => setLedgerTab('company-items')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer"
          title="Click to view itemized company operational expenses"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Company Operations Expenses
            </span>
            <Building size={16} className="text-rose-600 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
              ৳{totals.totalCompanyExpenses.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-rose-700 font-medium">
              {scope === 'monthly' && filteredNotes.length === 0 && allOpsNotes.length > 0
                ? `${allOpsNotes.length} entries in All Time (৳${allOpsTotal.toLocaleString()})`
                : `${filteredNotes.length} office, utility & ops entries`}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-600 flex justify-between font-mono tabular-nums">
            <span>Share of Outflow:</span>
            <span className="font-bold text-rose-700">
              {totals.allTotalExpenses > 0
                ? Math.round((totals.totalCompanyExpenses / totals.allTotalExpenses) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* 4. ALL TOTAL HISHAB KOTO HOILO */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              All Total Expenses (সর্বমোট)
            </span>
            <TrendingUp size={16} className="text-emerald-400 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tabular-nums text-white">
              ৳{totals.allTotalExpenses.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-medium">
              TA/DA + Company Ops Combined
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] flex items-center justify-between">
            <span className="text-slate-400">Net Cash Balance:</span>
            <span
              className={`font-mono tabular-nums font-bold ${
                totals.netCashMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totals.netCashMargin >= 0 ? '+' : ''}৳{totals.netCashMargin.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Cash Flow, Payables & Receivables Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
              <CreditCard size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">
                Sales Revenue: <span className="font-mono tabular-nums">৳{totals.totalSalesRevenue.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                Collected: <strong className="text-emerald-700">৳{totals.totalCollectedCash.toLocaleString()}</strong> ({totals.collectionRate}%)
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block">Operating Margin</span>
            <span className={`font-mono tabular-nums font-black ${totals.netRevenueMargin >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              ৳{totals.netRevenueMargin.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 shrink-0">
              <Wallet size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">
                TA/DA Liabilities (Staff Payable)
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                Approved Unpaid: <strong className="text-amber-700">৳{totals.tadaApprovedUnpaid.toLocaleString()}</strong> · Pending: <strong className="text-slate-800">৳{totals.tadaPendingApproval.toLocaleString()}</strong>
              </div>
            </div>
          </div>
          {scopedExcludedCounts.submittedPending > 0 && (
            <button
              onClick={() => setLedgerTab('tada-items')}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Review ({scopedExcludedCounts.submittedPending})
            </button>
          )}
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 shrink-0">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">
                Hospital / Doctor Due Receivables
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                Outstanding Due: <strong className="text-rose-700">৳{totals.totalDueReceivables.toLocaleString()}</strong>
              </div>
            </div>
          </div>
          {(scopedExcludedCounts.drafts > 0 || scopedExcludedCounts.rejected > 0) && (
            <span className="text-[10px] text-slate-400 font-mono shrink-0 text-right">
              Excluded: {scopedExcludedCounts.rejected} rej / {scopedExcludedCounts.drafts} draft
            </span>
          )}
        </div>
      </div>

      {/* Interactive Charts Grid: Comparison, Expense Breakdown & 6-Month Cash Flow Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Financial Comparison */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" />
              <span>Financial Comparison ({scope === 'all' ? 'All Time' : selectedMonth})</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Budget vs Sales vs Collected Cash vs Staff TA/DA vs Ops
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-18}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {comparisonChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Category Breakdown Pie */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <PieIcon size={16} className="text-amber-600" />
              <span>Expense Breakdown Hishab</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Field TA/DA allowances, hotel/food &amp; company operations
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expensePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend verticalAlign="bottom" height={42} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: 6-Month Cash Flow & Expense Trend */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              <span>6-Month Cash Flow &amp; Expense Trend</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Monthly collected cash vs TA/DA &amp; operational outflows
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="Collected" stroke="#0284c7" fill="#0284c7" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="TA/DA Expense" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} strokeWidth={2} />
                <Area type="monotone" dataKey="Company Ops" stroke="#e11d48" fill="#e11d48" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sub-Navigation & Detailed Ledger Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setLedgerTab('summary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                ledgerTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Hishab Summary
            </button>
            <button
              onClick={() => setLedgerTab('tada-items')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                ledgerTab === 'tada-items' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TA/DA Claims ({filteredClaims.length})
            </button>
            <button
              onClick={() => setLedgerTab('staff-breakdown')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                ledgerTab === 'staff-breakdown' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff-wise Expenses ({staffExpenseBreakdown.length})
            </button>
            <button
              onClick={() => setLedgerTab('company-items')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                ledgerTab === 'company-items' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Company Ops Expenses ({filteredNotes.length})
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
            <span>
              Status:{' '}
              <strong className={totals.budgetRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                {totals.budgetRemaining >= 0 ? 'Within Budget' : 'Over Budget'}
              </strong>
            </span>
          </div>
        </div>

        {/* SUB-TAB 1: SUMMARY HISHAB SHEET */}
        {ledgerTab === 'summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Financial Metric / Item</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  <th className="py-3 px-4 text-right">% of Budget</th>
                  <th className="py-3 px-4">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-indigo-950">Budget Allocation Ceiling</td>
                  <td className="py-3 px-4 text-indigo-700 font-semibold">Allocated Target</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-indigo-950">
                    ৳{effectiveBudget.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">100.0%</td>
                  <td className="py-3 px-4 text-indigo-700 text-[11px]">
                    {scope === 'all' ? 'Cumulative Reference' : `Approved Ceiling (${selectedMonth})`}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800 pl-8">Field Travel Allowance (Intercity)</td>
                  <td className="py-3 px-4 text-slate-500">Staff TA/DA</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                    ৳{totals.personalTravel.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                    {effectiveBudget > 0 ? ((totals.personalTravel / effectiveBudget) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">Bus, train &amp; intercity field transit</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800 pl-8">Field Daily Allowance (DA)</td>
                  <td className="py-3 px-4 text-slate-500">Staff TA/DA</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                    ৳{totals.personalDaily.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                    {effectiveBudget > 0 ? ((totals.personalDaily / effectiveBudget) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">Per-diem duty compensation</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800 pl-8">Local Transportation (CNG/Taxi)</td>
                  <td className="py-3 px-4 text-slate-500">Staff TA/DA</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                    ৳{totals.personalTransport.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                    {effectiveBudget > 0 ? ((totals.personalTransport / effectiveBudget) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">Hospital &amp; clinic local conveyance</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-800 pl-8">Accommodation &amp; Food Expense</td>
                  <td className="py-3 px-4 text-slate-500">Staff TA/DA</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                    ৳{totals.personalFoodHotel.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                    {effectiveBudget > 0 ? ((totals.personalFoodHotel / effectiveBudget) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">Outstation lodging &amp; meal bills</td>
                </tr>

                <tr className="bg-amber-50/40 font-bold">
                  <td className="py-3 px-4 text-amber-950">Total Staff Field Expenses (TA/DA)</td>
                  <td className="py-3 px-4 text-amber-800">Field Subtotal</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-amber-950">
                    ৳{totals.totalPersonalExpenses.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-800">
                    {effectiveBudget > 0 ? ((totals.totalPersonalExpenses / effectiveBudget) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-4 text-amber-800 text-[11px]">
                    {filteredClaims.length} Claims · Paid: ৳{totals.tadaPaidAmount.toLocaleString()} · Payable: ৳{totals.tadaApprovedUnpaid.toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-rose-50/40 font-bold">
                  <td className="py-3 px-4 text-rose-950">Company Operational Expenses (Notes)</td>
                  <td className="py-3 px-4 text-rose-800">Overhead Subtotal</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-rose-950">
                    ৳{totals.totalCompanyExpenses.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-800">
                    {effectiveBudget > 0 ? ((totals.totalCompanyExpenses / effectiveBudget) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-4 text-rose-800 text-[11px]">{filteredNotes.length} Expense Entries Logged</td>
                </tr>

                <tr className="bg-slate-900 text-white font-extrabold text-sm">
                  <td className="py-4 px-4 tracking-wide">ALL TOTAL EXPENSES (সর্বমোট খরচ)</td>
                  <td className="py-4 px-4 text-emerald-400 font-semibold uppercase text-xs">Grand Total</td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums text-lg text-white">
                    ৳{totals.allTotalExpenses.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums text-emerald-400">
                    {totals.budgetPercentUsed}%
                  </td>
                  <td className="py-4 px-4 text-slate-300 text-xs font-mono tabular-nums">
                    {totals.budgetRemaining >= 0
                      ? `Remaining: ৳${totals.budgetRemaining.toLocaleString()}`
                      : `Over Limit: -৳${Math.abs(totals.budgetRemaining).toLocaleString()}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-TAB 2: ITEMIZED TA/DA CLAIMS DIRECTLY IN FINANCIAL HUB */}
        {ledgerTab === 'tada-items' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Duty / Route &amp; Dates</th>
                  <th className="py-3 px-4">Breakdown (TA / DA / Local / Food)</th>
                  <th className="py-3 px-4 text-right">Total (BDT)</th>
                  <th className="py-3 px-4">Status &amp; Disbursement</th>
                  <th className="py-3 px-4 text-right">Executive Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No TA/DA expense claims matched the current filter ({scope === 'all' ? 'All Time' : selectedMonth}, {tadaInclusion}).
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => {
                    const totalVal = getTaDaClaimTotal(claim);
                    return (
                      <tr key={claim.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{claim.employee_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{claim.employee_code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{claim.title || claim.destination}</div>
                          <div className="text-[11px] text-slate-500">
                            {claim.origin || 'HQ'} <ArrowRight size={10} className="inline" /> {claim.destination} ·{' '}
                            <span className="font-mono tabular-nums">
                              {claim.travel_start_date} to {claim.travel_end_date}
                            </span>
                          </div>
                          {(claim.bills_receipts || []).length > 0 && (
                            <div className="mt-1.5">
                              <ReceiptGallery
                                claim={claim}
                                theme="light"
                                compact
                                onPreview={(att, list) => setReceiptPreview({ active: att, list })}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[11px] text-slate-600">
                          TA: ৳{(Number(claim.travel_allowance) || 0).toLocaleString()} · DA: ৳
                          {(Number(claim.daily_allowance) || 0).toLocaleString()}
                          <br />
                          Local: ৳{(Number(claim.transportation_expense) || 0).toLocaleString()} · Food/Htl: ৳
                          {(Number(claim.accommodation_food_expense) || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-slate-900 text-sm">
                          ৳{totalVal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <div
                            className={`text-[10px] font-bold uppercase ${
                              claim.status === 'approved'
                                ? 'text-emerald-700'
                                : claim.status === 'rejected'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {claim.status}
                          </div>
                          <div
                            className={`text-[10px] font-bold uppercase font-mono ${
                              claim.payment_status === 'paid' ? 'text-sky-700' : 'text-slate-500'
                            }`}
                          >
                            {claim.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {onReviewTaDa && claim.status !== 'approved' && (
                              <button
                                onClick={() => onReviewTaDa(claim.id, 'approved', 'Approved from Financial Hub')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {onReviewTaDa && claim.status !== 'rejected' && (
                              <button
                                onClick={() => onReviewTaDa(claim.id, 'rejected', 'Rejected from Financial Hub')}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                            {onToggleTaDaPayment && claim.status === 'approved' && (
                              <button
                                onClick={() => onToggleTaDaPayment(claim.id, claim.payment_status)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] cursor-pointer"
                              >
                                {claim.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-TAB 3: STAFF-WISE EXPENSE LEADERBOARD */}
        {ledgerTab === 'staff-breakdown' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Staff / Engineer</th>
                  <th className="py-3 px-4 text-center">Claims</th>
                  <th className="py-3 px-4 text-right">Travel (TA)</th>
                  <th className="py-3 px-4 text-right">Daily (DA)</th>
                  <th className="py-3 px-4 text-right">Transport</th>
                  <th className="py-3 px-4 text-right">Hotel &amp; Food</th>
                  <th className="py-3 px-4 text-right">Total Claimed</th>
                  <th className="py-3 px-4 text-right">Paid / Unpaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffExpenseBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No staff TA/DA breakdown available for the selected scope.
                    </td>
                  </tr>
                ) : (
                  staffExpenseBreakdown.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Users size={13} className="text-slate-400" />
                          <span>{emp.employee_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono pl-5">{emp.employee_code}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-bold">{emp.claimCount}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">৳{emp.ta.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">৳{emp.da.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">৳{emp.transport.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">৳{emp.foodHotel.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-slate-900">
                        ৳{emp.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[11px]">
                        <span className="text-emerald-700 font-bold">৳{emp.paid.toLocaleString()}</span> /{' '}
                        <span className="text-amber-700 font-bold">৳{emp.unpaid.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SUB-TAB 4: COMPANY OPERATIONAL EXPENSE NOTES */}
        {ledgerTab === 'company-items' && (
          <div className="overflow-x-auto">
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <span>
                  Showing <strong className="font-mono tabular-nums">{filteredNotes.length}</strong> Company Ops{' '}
                  {scope === 'all' ? 'across all months' : `in ${selectedMonth}`}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-mono tabular-nums font-bold text-rose-700">
                  Total: ৳{totals.totalCompanyExpenses.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {scope === 'monthly' && allOpsNotes.length > filteredNotes.length && (
                  <button
                    onClick={() => setScope('all')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    Show All {allOpsNotes.length} Entries (৳{allOpsTotal.toLocaleString()})
                  </button>
                )}
                {onAddExpenseNote && (
                  <button
                    onClick={() => {
                      setExpenseError(null);
                      setShowAddExpenseModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Log Company Expense</span>
                  </button>
                )}
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title / Expense Head</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                  {onDeleteExpenseNote && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotes.length === 0 ? (
                  <tr>
                    <td colSpan={onDeleteExpenseNote ? 7 : 6} className="py-10 text-center text-slate-500 space-y-3">
                      <div className="font-semibold">
                        {scope === 'monthly' && allOpsNotes.length > 0
                          ? `No Company Ops entries in ${selectedMonth}, but ${allOpsNotes.length} entry/entries totaling ৳${allOpsTotal.toLocaleString()} exist in other months.`
                          : 'No company operational expense entries found for this period.'}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {scope === 'monthly' && latestOtherOpsMonth && (
                          <button
                            onClick={() => setSelectedMonth(latestOtherOpsMonth.month)}
                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Jump to {latestOtherOpsMonth.month}
                          </button>
                        )}
                        {scope === 'monthly' && allOpsNotes.length > 0 && (
                          <button
                            onClick={() => setScope('all')}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Show All Time
                          </button>
                        )}
                        {onAddExpenseNote && (
                          <button
                            onClick={() => {
                              setExpenseError(null);
                              setShowAddExpenseModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Plus size={13} />
                            <span>Log Company Expense</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {note.date || (note.created_at ? note.created_at.slice(0, 10) : '—')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                          {note.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{note.title}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-md">{note.content}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {note.author_name} ({note.author_role})
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-rose-700">
                        ৳{getCompanyNoteAmount(note).toLocaleString()}
                      </td>
                      {onDeleteExpenseNote && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onDeleteExpenseNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete company expense"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK LOG COMPANY EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building size={18} className="text-rose-600" />
                <span>Log Company Expense</span>
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddQuickExpense} className="space-y-3 text-xs">
              {expenseError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold">
                  {expenseError}
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Office Rent, Courier Dispatch, Generator Fuel"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 25000"
                    value={expenseForm.amount}
                    onChange={(e) => {
                      setExpenseError(null);
                      setExpenseForm({ ...expenseForm, amount: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Voucher / Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Optional invoice no., vendor name, or payment details..."
                  value={expenseForm.content}
                  onChange={(e) => setExpenseForm({ ...expenseForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingExpense}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSavingExpense ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ReceiptPreviewModal
        receipt={receiptPreview?.active || null}
        receipts={receiptPreview?.list || []}
        theme="light"
        onClose={() => setReceiptPreview(null)}
        onSelectReceipt={(att) =>
          setReceiptPreview((prev) => (prev ? { ...prev, active: att } : null))
        }
      />
    </div>
  );
};
