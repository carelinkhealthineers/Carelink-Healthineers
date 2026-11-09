import React, { useState, useMemo } from 'react';
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
  UserCheck,
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
import { TaDaClaim, CompanyNote, ProductSaleRecord } from '../../../types';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface FinancialHishabSectionProps {
  tadaClaims: TaDaClaim[];
  companyNotes: CompanyNote[];
  salesRecords: ProductSaleRecord[];
  monthlyBudget: number;
  onUpdateBudget: (newBudget: number) => Promise<void>;
  currentMonthKey: string;
}

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export const FinancialHishabSection: React.FC<FinancialHishabSectionProps> = ({
  tadaClaims,
  companyNotes,
  salesRecords,
  monthlyBudget,
  onUpdateBudget,
  currentMonthKey,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey || '2026-11');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Filter datasets by selected month (YYYY-MM)
  const filteredClaims = useMemo(() => {
    return tadaClaims.filter((c) => {
      const date = c.travel_start_date || c.created_at;
      return date && date.startsWith(selectedMonth);
    });
  }, [tadaClaims, selectedMonth]);

  const filteredNotes = useMemo(() => {
    return companyNotes.filter((n) => {
      const date = n.date || n.created_at;
      return n.category === 'expense' && date && date.startsWith(selectedMonth);
    });
  }, [companyNotes, selectedMonth]);

  const filteredSales = useMemo(() => {
    return salesRecords.filter((s) => {
      const date = s.sale_date || s.created_at;
      return date && date.startsWith(selectedMonth);
    });
  }, [salesRecords, selectedMonth]);

  // Calculations for "All Total Hishab Koto Hoilo"
  const totals = useMemo(() => {
    // 1. Personal / Staff Field Expenses
    const personalTravel = filteredClaims.reduce((acc, c) => acc + (Number(c.travel_allowance) || 0), 0);
    const personalDaily = filteredClaims.reduce((acc, c) => acc + (Number(c.daily_allowance) || 0), 0);
    const personalTransport = filteredClaims.reduce((acc, c) => acc + (Number(c.transportation_expense) || 0), 0);
    const personalFoodHotel = filteredClaims.reduce((acc, c) => acc + (Number(c.accommodation_food_expense) || 0), 0);
    const totalPersonalExpenses = filteredClaims.reduce((acc, c) => acc + (Number(c.total_amount) || 0), 0);

    // 2. Company Operational Expenses (from Notes)
    const totalCompanyExpenses = filteredNotes.reduce((acc, n) => acc + (Number(n.amount) || 0), 0);

    // 3. All Total Expenses
    const allTotalExpenses = totalPersonalExpenses + totalCompanyExpenses;

    // 4. Product Sales & Inflow
    const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + (Number(s.sale_value) || 0), 0);
    const totalCollectedCash = filteredSales.reduce((acc, s) => acc + (Number(s.paid_amount) || 0), 0);
    const totalDueReceivables = filteredSales.reduce((acc, s) => acc + (Number(s.due_amount) || 0), 0);

    // 5. Budget Tracking & Net Margin
    const budgetRemaining = monthlyBudget - allTotalExpenses;
    const budgetPercentUsed = monthlyBudget > 0 ? Math.min(Math.round((allTotalExpenses / monthlyBudget) * 100), 100) : 0;
    const netCashMargin = totalCollectedCash - allTotalExpenses;
    const netRevenueMargin = totalSalesRevenue - allTotalExpenses;

    return {
      personalTravel,
      personalDaily,
      personalTransport,
      personalFoodHotel,
      totalPersonalExpenses,
      totalCompanyExpenses,
      allTotalExpenses,
      totalSalesRevenue,
      totalCollectedCash,
      totalDueReceivables,
      budgetRemaining,
      budgetPercentUsed,
      netCashMargin,
      netRevenueMargin,
    };
  }, [filteredClaims, filteredNotes, filteredSales, monthlyBudget]);

  // Chart Data: Financial Comparison
  const comparisonChartData = useMemo(() => {
    return [
      {
        name: 'This Month Budget',
        amount: monthlyBudget,
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
        name: 'All Total Expenses',
        amount: totals.allTotalExpenses,
        color: '#e11d48',
      },
      {
        name: 'Net Cash Margin',
        amount: Math.max(0, totals.netCashMargin),
        color: '#10b981',
      },
    ];
  }, [monthlyBudget, totals]);

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
      await onUpdateBudget(val);
      setIsEditingBudget(false);
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Export Hishab to Excel
  const handleExportHishabExcel = () => {
    const headers = ['Category / Item', 'Type', 'Amount (BDT)', 'Notes / Status'];
    const rows: (string | number)[][] = [
      ['Monthly Budget Allocated', 'Target Budget', monthlyBudget, `Month: ${selectedMonth}`],
      ['Total Equipment Sales Revenue', 'Inflow (Booked)', totals.totalSalesRevenue, `${filteredSales.length} Equipment Orders`],
      ['Total Cash Collected', 'Inflow (Received)', totals.totalCollectedCash, 'Bank / Cash Clearance'],
      ['Total Due Receivables', 'Inflow (Pending)', totals.totalDueReceivables, 'Pending Doctor / Center Collection'],
      ['Personal Field Expenses (TA/DA Claims)', 'Outflow (Staff)', totals.totalPersonalExpenses, `${filteredClaims.length} Claims Filed`],
      ['  - Travel Allowance', 'Sub-Expense', totals.personalTravel, 'Bus, Train & Intercity'],
      ['  - Daily Allowance (DA)', 'Sub-Expense', totals.personalDaily, 'Per-diem field duty'],
      ['  - Transportation Expense', 'Sub-Expense', totals.personalTransport, 'Local Rickshaw, CNG, Taxi'],
      ['  - Food & Hotel Lodging', 'Sub-Expense', totals.personalFoodHotel, 'Outstation Accommodation'],
      ['Company Operational Expenses (Notes)', 'Outflow (Operations)', totals.totalCompanyExpenses, `${filteredNotes.length} Expense Notes`],
      ['ALL TOTAL EXPENSES KOTO HOILO', 'Grand Total Outflow', totals.allTotalExpenses, `${totals.budgetPercentUsed}% of Monthly Budget Used`],
      ['BUDGET REMAINING BALANCE', 'Budget Surplus', totals.budgetRemaining, totals.budgetRemaining >= 0 ? 'Within Budget' : 'Over Budget'],
      ['NET CASH SURPLUS / PROFIT MARGIN', 'Net Profit Margin', totals.netCashMargin, totals.netCashMargin >= 0 ? 'Positive Operating Surplus' : 'Deficit'],
    ];

    exportToExcel({
      filename: `Carelink_Executive_Hishab_${selectedMonth}`,
      sheetName: 'Monthly Hishab',
      headers,
      rows,
    });
  };

  // Export Hishab to PDF
  const handleExportHishabPDF = () => {
    const headers = ['Category / Item', 'Type', 'Amount (BDT)', 'Notes'];
    const rows: (string | number)[][] = [
      ['Monthly Budget Allocated', 'Target', `Tk ${monthlyBudget.toLocaleString()}`, `Period: ${selectedMonth}`],
      ['Total Equipment Sales Revenue', 'Inflow', `Tk ${totals.totalSalesRevenue.toLocaleString()}`, `${filteredSales.length} Orders`],
      ['Total Cash Collected', 'Cash In', `Tk ${totals.totalCollectedCash.toLocaleString()}`, 'Cleared'],
      ['Total Due Receivables', 'Due In', `Tk ${totals.totalDueReceivables.toLocaleString()}`, 'Pending'],
      ['Personal Field Expenses (TA/DA)', 'Staff Outflow', `Tk ${totals.totalPersonalExpenses.toLocaleString()}`, `${filteredClaims.length} Claims`],
      ['Company Operational Notes', 'Ops Outflow', `Tk ${totals.totalCompanyExpenses.toLocaleString()}`, `${filteredNotes.length} Items`],
      ['ALL TOTAL EXPENSES', 'Grand Outflow', `Tk ${totals.allTotalExpenses.toLocaleString()}`, `${totals.budgetPercentUsed}% Budget Used`],
      ['NET CASH SURPLUS (HISHAB)', 'Net Balance', `Tk ${totals.netCashMargin.toLocaleString()}`, totals.netCashMargin >= 0 ? 'Surplus' : 'Deficit'],
    ];

    exportToPDF({
      filename: `Carelink_Executive_Hishab_${selectedMonth}`,
      title: 'Carelink Healthineers — Executive Financial Hishab',
      subtitle: `Official Monthly Accounting Summary · Period: ${selectedMonth} · MD & Board of Directors`,
      headers,
      rows,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={22} />
            <span>Executive Financial & Budget Hishab (সর্বমোট হিসাব)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monthly accounting ledger: Budget targets, field TA/DA expenses, company overhead, and total balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs font-semibold">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-slate-500 text-[11px]">Select Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-hidden text-xs cursor-pointer"
            />
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportHishabExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="Download formatted Excel sheet"
          >
            <FileSpreadsheet size={15} />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportHishabPDF}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="Download PDF statement"
          >
            <Download size={15} />
            <span>PDF Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Hishab Cards Grid: All Total Hishab Koto Hoilo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Monthly Budget */}
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
              This Month Budget
            </span>
            <button
              onClick={() => {
                setBudgetInput(monthlyBudget.toString());
                setIsEditingBudget(!isEditingBudget);
              }}
              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100/70 transition-colors cursor-pointer"
              title="Edit monthly budget"
            >
              <Edit3 size={14} />
            </button>
          </div>

          {isEditingBudget ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-2.5 py-1 text-sm font-mono font-bold bg-white border border-indigo-300 rounded-lg focus:outline-hidden"
              />
              <button
                onClick={handleSaveBudget}
                disabled={isSavingBudget}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save size={14} />
              </button>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-2xl font-black font-mono text-indigo-950">
                ৳{monthlyBudget.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-indigo-600 font-medium flex items-center justify-between">
                <span>Budget Allocated</span>
                <span>{selectedMonth}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>Utilized: {totals.budgetPercentUsed}%</span>
              <span>Rem: ৳{Math.max(0, totals.budgetRemaining).toLocaleString()}</span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  totals.budgetPercentUsed > 90
                    ? 'bg-rose-500'
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
        <div className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
              Personal / Field Expenses
            </span>
            <Receipt size={16} className="text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-amber-950">
              ৳{totals.totalPersonalExpenses.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-amber-700 font-medium">
              {filteredClaims.length} employee TA/DA claims filed
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-100/70 text-[10px] text-slate-600 grid grid-cols-2 gap-1 font-mono">
            <span>Travel: ৳{totals.personalTravel.toLocaleString()}</span>
            <span>Food: ৳{totals.personalFoodHotel.toLocaleString()}</span>
            <span>Local: ৳{totals.personalTransport.toLocaleString()}</span>
            <span>DA: ৳{totals.personalDaily.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. Company Overhead Expenses */}
        <div className="p-5 bg-gradient-to-br from-rose-50 to-white rounded-3xl border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
              Company Operations Expenses
            </span>
            <Building size={16} className="text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-rose-950">
              ৳{totals.totalCompanyExpenses.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-rose-700 font-medium">
              {filteredNotes.length} office, utility & logistics notes
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100/70 text-[10px] text-slate-600 flex justify-between font-mono">
            <span>Total Outflow:</span>
            <span className="font-bold text-rose-700">৳{totals.totalCompanyExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* 4. ALL TOTAL HISHAB KOTO HOILO (Grand Total Balance) */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-700 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
              All Total Hishab (সর্বমোট হিসাব)
            </span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono text-white">
              ৳{totals.allTotalExpenses.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-medium">
              Total Expenses Spent This Month
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/80 text-[10px] flex items-center justify-between">
            <span className="text-slate-400">Net Cash In Hand:</span>
            <span
              className={`font-mono font-bold ${
                totals.netCashMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totals.netCashMargin >= 0 ? '+' : ''}৳{totals.netCashMargin.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Revenue & Collections Quick Strip */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <CreditCard size={18} />
          </div>
          <div>
            <div className="font-extrabold text-slate-900">
              This Month Product Sales Total: ৳{totals.totalSalesRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">
              Cash Received: <span className="font-bold text-emerald-700 font-mono">৳{totals.totalCollectedCash.toLocaleString()}</span> ·
              Due Receivables: <span className="font-bold text-amber-700 font-mono">৳{totals.totalDueReceivables.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 font-medium">Operating Margin:</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold font-mono">
            ৳{totals.netRevenueMargin.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Budget vs Sales vs Total Expenses */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-600" />
                <span>Financial Comparison Chart ({selectedMonth})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Budget vs Sales Inflow vs All Total Expenses vs Net Cash
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
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
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {comparisonChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Category Breakdown Pie */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <PieIcon size={16} className="text-amber-600" />
                <span>Expense Breakdown Hishab</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Personal Field Allowances, Food, Transport & Company Operations
              </p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
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
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Ledger Table: Hishab Summary (Like Excel) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Monthly Hishab Sheet: Detailed Breakdown ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-500">
              Interactive financial ledger showing every category, allocated budget, and total outflow.
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Status: {totals.budgetRemaining >= 0 ? 'Within Budget' : 'Over Budget'}
          </span>
        </div>

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
              <tr className="hover:bg-indigo-50/40">
                <td className="py-3 px-4 font-bold text-indigo-950 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  Monthly Budget Allocation
                </td>
                <td className="py-3 px-4 text-indigo-600 font-semibold">Allocated Target</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-950">
                  ৳{monthlyBudget.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">100.0%</td>
                <td className="py-3 px-4 text-indigo-700 text-[11px]">Approved Board Ceiling</td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 pl-8">↳ Field Travel Allowance (Intercity)</td>
                <td className="py-3 px-4 text-slate-500">Staff Expense</td>
                <td className="py-3 px-4 text-right font-mono text-slate-800">
                  ৳{totals.personalTravel.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  {monthlyBudget > 0 ? ((totals.personalTravel / monthlyBudget) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">Staff field visits & transit</td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 pl-8">↳ Field Daily Allowance (DA)</td>
                <td className="py-3 px-4 text-slate-500">Staff Expense</td>
                <td className="py-3 px-4 text-right font-mono text-slate-800">
                  ৳{totals.personalDaily.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  {monthlyBudget > 0 ? ((totals.personalDaily / monthlyBudget) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">Per-diem duty compensation</td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 pl-8">↳ Local Transportation (CNG/Taxi)</td>
                <td className="py-3 px-4 text-slate-500">Staff Expense</td>
                <td className="py-3 px-4 text-right font-mono text-slate-800">
                  ৳{totals.personalTransport.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  {monthlyBudget > 0 ? ((totals.personalTransport / monthlyBudget) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">Hospital & clinic site runs</td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-800 pl-8">↳ Accommodation & Food Expense</td>
                <td className="py-3 px-4 text-slate-500">Staff Expense</td>
                <td className="py-3 px-4 text-right font-mono text-slate-800">
                  ৳{totals.personalFoodHotel.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">
                  {monthlyBudget > 0 ? ((totals.personalFoodHotel / monthlyBudget) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">Night stays & meal receipts</td>
              </tr>

              <tr className="hover:bg-amber-50/30 bg-amber-50/10 font-bold">
                <td className="py-3 px-4 text-amber-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Total Personal Field Expenses (TA/DA)
                </td>
                <td className="py-3 px-4 text-amber-800">Field Subtotal</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-950">
                  ৳{totals.totalPersonalExpenses.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-amber-800">
                  {monthlyBudget > 0 ? ((totals.totalPersonalExpenses / monthlyBudget) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-amber-800 text-[11px]">{filteredClaims.length} Claims Total</td>
              </tr>

              <tr className="hover:bg-rose-50/30 bg-rose-50/10 font-bold">
                <td className="py-3 px-4 text-rose-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  Company Operational Expenses (Directives)
                </td>
                <td className="py-3 px-4 text-rose-800">Overhead Subtotal</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-950">
                  ৳{totals.totalCompanyExpenses.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-rose-800">
                  {monthlyBudget > 0 ? ((totals.totalCompanyExpenses / monthlyBudget) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-rose-800 text-[11px]">{filteredNotes.length} Directives Logged</td>
              </tr>

              {/* GRAND TOTAL ROW */}
              <tr className="bg-slate-900 text-white font-extrabold text-sm">
                <td className="py-4 px-4 tracking-wide">
                  ALL TOTAL EXPENSES (সর্বমোট খরচ)
                </td>
                <td className="py-4 px-4 text-emerald-400 font-semibold uppercase text-xs">
                  Grand Total
                </td>
                <td className="py-4 px-4 text-right font-mono text-lg text-white">
                  ৳{totals.allTotalExpenses.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono text-emerald-400">
                  {totals.budgetPercentUsed}%
                </td>
                <td className="py-4 px-4 text-slate-300 text-xs">
                  {totals.budgetRemaining >= 0
                    ? `Remaining: ৳${totals.budgetRemaining.toLocaleString()}`
                    : `Over Limit: -৳${Math.abs(totals.budgetRemaining).toLocaleString()}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
