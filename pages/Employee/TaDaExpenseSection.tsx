import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Paperclip,
  X,
  Loader2,
  ExternalLink,
  MapPin,
  Receipt,
  CreditCard,
  Send,
  Save,
  Edit2,
  Trash2,
  FileCheck,
  Building2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { TaDaClaim, TaDaClaimStatus, PaymentStatus, Employee, ExpenseAttachment } from '../../types';
import {
  fetchClaimsForEmployee,
  saveOrSubmitTaDaClaim,
  calculateTotalClaimAmount,
  TaDaClaimInput,
  deleteTaDaClaim,
} from '../../services/tadaService';
import { exportToExcel, exportToPDF } from '../../utils/exportHelper';
import { ReceiptGallery, ReceiptPreviewModal } from '../../components/common/ReceiptPreviewModal';
import { compressReceiptFile } from '../../utils/receiptHelper';

interface TaDaExpenseSectionProps {
  employee: Employee;
  onToast: (msg: string) => void;
}

export const TaDaExpenseSection: React.FC<TaDaExpenseSectionProps> = ({
  employee,
  onToast,
}) => {
  const [claims, setClaims] = useState<TaDaClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    title: string;
    travel_start_date: string;
    travel_end_date: string;
    origin: string;
    destination: string;
    travel_allowance: number;
    daily_allowance: number;
    transportation_expense: number;
    accommodation_food_expense: number;
    remarks: string;
    billName: string;
    billUrl: string;
    billsList: ExpenseAttachment[];
  }>({
    title: '',
    travel_start_date: new Date().toISOString().split('T')[0],
    travel_end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    origin: 'Dhaka HQ',
    destination: 'Chittagong Medical Hub',
    travel_allowance: 1500,
    daily_allowance: 1200,
    transportation_expense: 2500,
    accommodation_food_expense: 3500,
    remarks: '',
    billName: '',
    billUrl: '',
    billsList: [],
  });

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCompressingFiles, setIsCompressingFiles] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<{
    active: ExpenseAttachment;
    list: ExpenseAttachment[];
  } | null>(null);

  const loadMyClaims = async () => {
    setLoading(true);
    try {
      // Security Enforcement: Employees must only see their own claims
      const data = await fetchClaimsForEmployee(employee.id);
      setClaims(data);
    } catch (err: any) {
      console.error('Failed to load my TA/DA claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyClaims();
  }, [employee.id]);

  const resetForm = () => {
    setEditingClaimId(null);
    setFormState({
      title: '',
      travel_start_date: new Date().toISOString().split('T')[0],
      travel_end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      origin: 'Dhaka HQ',
      destination: 'Chittagong Medical Hub',
      travel_allowance: 1500,
      daily_allowance: 1200,
      transportation_expense: 2500,
      accommodation_food_expense: 3500,
      remarks: '',
      billName: '',
      billUrl: '',
      billsList: [],
    });
    setFormError(null);
  };

  const handleOpenNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (claim: TaDaClaim) => {
    setEditingClaimId(claim.id);
    setFormState({
      title: claim.title,
      travel_start_date: claim.travel_start_date,
      travel_end_date: claim.travel_end_date,
      origin: claim.origin,
      destination: claim.destination,
      travel_allowance: claim.travel_allowance,
      daily_allowance: claim.daily_allowance,
      transportation_expense: claim.transportation_expense,
      accommodation_food_expense: claim.accommodation_food_expense,
      remarks: claim.remarks || '',
      billName: '',
      billUrl: '',
      billsList: claim.bills_receipts || [],
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleAddBill = () => {
    if (!formState.billName.trim() || !formState.billUrl.trim()) return;
    setFormState((prev) => ({
      ...prev,
      billsList: [
        ...prev.billsList,
        { name: prev.billName.trim(), url: prev.billUrl.trim() },
      ],
      billName: '',
      billUrl: '',
    }));
  };

  const handleRemoveBill = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      billsList: prev.billsList.filter((_, i) => i !== index),
    }));
  };

  // Live calculation of current form total
  const liveTotal = calculateTotalClaimAmount(formState);

  const handleSubmitOrDraft = async (isSubmit: boolean) => {
    if (isSubmit) setIsSubmitting(true);
    else setIsSavingDraft(true);
    setFormError(null);

    try {
      let finalBills = [...formState.billsList];
      if (formState.billName.trim() && formState.billUrl.trim()) {
        finalBills.push({
          name: formState.billName.trim(),
          url: formState.billUrl.trim(),
        });
      }

      const input: TaDaClaimInput = {
        id: editingClaimId || undefined,
        title: formState.title,
        travel_start_date: formState.travel_start_date,
        travel_end_date: formState.travel_end_date,
        origin: formState.origin,
        destination: formState.destination,
        travel_allowance: formState.travel_allowance,
        daily_allowance: formState.daily_allowance,
        transportation_expense: formState.transportation_expense,
        accommodation_food_expense: formState.accommodation_food_expense,
        bills_receipts: finalBills,
        remarks: formState.remarks,
      };

      const result = await saveOrSubmitTaDaClaim(input, employee, isSubmit);
      setIsFormOpen(false);
      resetForm();
      onToast(
        isSubmit
          ? `Submitted TA/DA claim ৳${result.total_amount.toLocaleString()} for approval`
          : `Draft claim ৳${result.total_amount.toLocaleString()} saved`
      );
      await loadMyClaims();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to process TA/DA claim.');
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!window.confirm('Delete this claim draft?')) return;
    try {
      await deleteTaDaClaim(claimId);
      onToast('Claim deleted');
      await loadMyClaims();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete claim');
    }
  };

  // My totals calculation
  const myTotalApproved = claims
    .filter((c) => c.status === 'approved')
    .reduce((acc, c) => acc + (c.total_amount || 0), 0);
  const myTotalDisbursed = claims
    .filter((c) => c.payment_status === 'paid')
    .reduce((acc, c) => acc + (c.total_amount || 0), 0);

  const handleExportPDF = () => {
    const headers = ['Destination', 'Start Date', 'End Date', 'TA (BDT)', 'DA (BDT)', 'Transport', 'Hotel', 'Total (BDT)', 'Status', 'Payment'];
    const rows = claims.map((c) => [
      c.destination || '',
      c.travel_start_date || '',
      c.travel_end_date || '',
      c.travel_allowance || 0,
      c.daily_allowance || 0,
      c.transportation_expense || 0,
      c.accommodation_food_expense || 0,
      c.total_amount || 0,
      c.status?.toUpperCase() || '',
      c.payment_status?.toUpperCase() || '',
    ]);
    exportToPDF({
      filename: `my_tada_claims_${employee.employee_id}`,
      title: `${employee.full_name} (${employee.employee_id}) — TA/DA & Expense Claims`,
      subtitle: `Total Claim Value: ৳${claims.reduce((acc, c) => acc + (c.total_amount || 0), 0).toLocaleString()} · Department: ${employee.department}`,
      headers,
      rows,
    });
    onToast('Exported TA/DA claims to PDF');
  };

  const handleExportExcel = () => {
    const headers = ['Claim Title', 'Destination', 'Start Date', 'End Date', 'TA', 'DA', 'Transport', 'Hotel & Food', 'Total Amount', 'Status', 'Payment'];
    const rows = claims.map((c) => [
      c.title || '',
      c.destination || '',
      c.travel_start_date || '',
      c.travel_end_date || '',
      c.travel_allowance || 0,
      c.daily_allowance || 0,
      c.transportation_expense || 0,
      c.accommodation_food_expense || 0,
      c.total_amount || 0,
      c.status?.toUpperCase() || '',
      c.payment_status?.toUpperCase() || '',
    ]);
    exportToExcel({
      filename: `my_tada_claims_${employee.employee_id}`,
      sheetName: 'My Expenses',
      headers,
      rows,
    });
    onToast('Exported TA/DA claims to Excel');
  };

  return (
    <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">TA/DA &amp; Expense Submissions</h2>
              <span className="text-xs font-mono text-slate-400">({claims.length})</span>
            </div>
            <p className="text-xs text-slate-400">
              Submit travel allowances, transport expenses, accommodation bills, and daily field allowances.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {claims.length > 0 && (
            <>
              <button
                onClick={handleExportPDF}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export claims to PDF"
              >
                <Download size={13} />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export claims to Excel"
              >
                <FileSpreadsheet size={13} />
                <span>Excel</span>
              </button>
            </>
          )}

          <button
            onClick={handleOpenNewForm}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>New TA/DA Expense Claim</span>
          </button>
        </div>
      </div>

      {/* Aggregates row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Claims</span>
          <span className="text-lg font-black text-white font-mono">{claims.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Approved Value</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            ৳{myTotalApproved.toLocaleString()}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Disbursed (Paid)</span>
          <span className="text-lg font-black text-sky-400 font-mono">
            ৳{myTotalDisbursed.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Month & Year Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/30 border border-white/5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Calendar size={15} className="text-emerald-400" />
          <span>Filter Claims by Month &amp; Year:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-1.5 bg-black/40 border border-[#232f45] rounded-xl text-xs text-white outline-none cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="All">All Months</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            className="px-3 py-1.5 bg-black/40 border border-[#232f45] rounded-xl text-xs text-white outline-none cursor-pointer font-mono"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* My Claims Feed */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Loader2 className="animate-spin text-emerald-500 mx-auto" size={24} />
          <p className="text-xs">Loading expense claims...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Receipt className="text-slate-600 mx-auto" size={32} />
          <p className="font-semibold text-white">No TA/DA expense claims filed yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log your official travel allowances, hotel bills, transport fares, and daily field food claims to get reimbursed.
          </p>
          <button
            onClick={handleOpenNewForm}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Submit First Claim
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {claims
            .filter((claim) => {
              const dt = claim.travel_start_date || claim.created_at?.split('T')[0] || '';
              const [y, m] = dt.split('-');
              const matchesYear = selectedYear === 'All' || y === selectedYear;
              const matchesMonth = selectedMonth === 'All' || m === selectedMonth;
              return matchesYear && matchesMonth;
            })
            .map((claim) => {
            const isApproved = claim.status === 'approved';
            const isPaid = claim.payment_status === 'paid';

            return (
              <div
                key={claim.id}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                  isApproved
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                    : claim.status === 'rejected'
                    ? 'bg-rose-500/[0.03] border-rose-500/30'
                    : claim.status === 'submitted'
                    ? 'bg-amber-500/[0.02] border-amber-500/20'
                    : 'bg-white/[0.02] border-white/10'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">{claim.title}</h3>

                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          claim.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : claim.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : claim.status === 'submitted'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {claim.status}
                      </span>

                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPaid
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {isPaid ? 'Payment Disbursed' : 'Unpaid'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={12} className="text-slate-500" />
                        {claim.travel_start_date} to {claim.travel_end_date}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-500" />
                        {claim.origin} ➔ {claim.destination}
                      </span>
                    </div>
                  </div>

                  {/* Calculated Amount */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                        Total Amount
                      </span>
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        ৳{claim.total_amount.toLocaleString()}
                      </span>
                    </div>

                    {claim.status === 'draft' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditForm(claim)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          title="Edit Draft"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Draft"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Items Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-black/40 border border-white/5 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Travel (TA)</span>
                    <span className="font-mono text-slate-200 font-bold">
                      ৳{(claim.travel_allowance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Daily (DA)</span>
                    <span className="font-mono text-slate-200 font-bold">
                      ৳{(claim.daily_allowance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Transport</span>
                    <span className="font-mono text-slate-200 font-bold">
                      ৳{(claim.transportation_expense || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Accommodation/Food</span>
                    <span className="font-mono text-slate-200 font-bold">
                      ৳{(claim.accommodation_food_expense || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {(claim.bills_receipts || []).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                      Uploaded Bills &amp; Receipts (Click to Preview):
                    </span>
                    <ReceiptGallery
                      claim={claim}
                      theme="dark"
                      onPreview={(att, list) => setReceiptPreview({ active: att, list })}
                    />
                  </div>
                )}

                {claim.remarks && (
                  <p className="text-xs text-slate-400 italic">Remarks: &quot;{claim.remarks}&quot;</p>
                )}

                {claim.admin_remarks && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase block">
                      Admin Remarks:
                    </span>
                    <p className="text-slate-200">{claim.admin_remarks}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: SUBMIT / EDIT CLAIM */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 lg:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingClaimId ? 'Modify TA/DA Expense Claim' : 'Submit TA/DA Expense Claim'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Enter travel dates, route, allowance items, and bill receipts.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
                {/* 1. Claim Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Claim Title / Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field Inspection & Maintenance Trip to Chittagong Hospital"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  />
                </div>

                {/* 2. Travel Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Travel Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={formState.travel_start_date}
                      onChange={(e) => setFormState({ ...formState, travel_start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Travel End Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={formState.travel_end_date}
                      onChange={(e) => setFormState({ ...formState, travel_end_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* 3. Origin & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Origin (Departure) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dhaka Central HQ"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.origin}
                      onChange={(e) => setFormState({ ...formState, origin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Destination *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chittagong Medical Center"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.destination}
                      onChange={(e) => setFormState({ ...formState, destination: e.target.value })}
                    />
                  </div>
                </div>

                {/* 4. Individual Allowance & Expense Items */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Expense Line Items (in ৳ BDT)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">Travel Allowance (TA)</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="w-full px-3 py-2 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                        value={formState.travel_allowance}
                        onChange={(e) =>
                          setFormState({ ...formState, travel_allowance: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">Daily Allowance (DA)</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="w-full px-3 py-2 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                        value={formState.daily_allowance}
                        onChange={(e) =>
                          setFormState({ ...formState, daily_allowance: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">Transportation Fares</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="w-full px-3 py-2 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                        value={formState.transportation_expense}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            transportation_expense: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase">Accommodation &amp; Food</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="w-full px-3 py-2 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                        value={formState.accommodation_food_expense}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            accommodation_food_expense: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Calculated Total Live Display */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 pt-2">
                    <span className="font-bold text-white text-xs">Automatically Calculated Total:</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      ৳{liveTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 5. Direct Bills & Receipts Upload */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Paperclip size={13} className="text-emerald-400" />
                    <span>Upload Bills &amp; Receipts Directly</span>
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    disabled={isCompressingFiles}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-black/40 p-2 rounded-xl border border-[#232f45] disabled:opacity-60"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []) as File[];
                      e.target.value = '';
                      if (files.length === 0) return;

                      setIsCompressingFiles(true);
                      setFormError(null);
                      try {
                        const processed = await Promise.all(
                          files.map((file) => compressReceiptFile(file))
                        );
                        setFormState((prev) => ({
                          ...prev,
                          billsList: [...prev.billsList, ...processed],
                        }));
                      } catch (err: any) {
                        setFormError(err?.message || 'Could not process one or more receipt files.');
                      } finally {
                        setIsCompressingFiles(false);
                      }
                    }}
                  />

                  {isCompressingFiles && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Optimizing receipt image for fast upload...</span>
                    </div>
                  )}

                  {formState.billsList.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Uploaded Receipts ({formState.billsList.length}) — Click thumbnail to inspect:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formState.billsList.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 gap-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setReceiptPreview({ active: att, list: formState.billsList })
                              }
                              className="flex items-center gap-2 min-w-0 text-left hover:text-emerald-300 cursor-pointer"
                            >
                              {att.url.startsWith('data:image') ? (
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/15"
                                />
                              ) : (
                                <Paperclip size={14} className="text-emerald-400 shrink-0" />
                              )}
                              <span className="truncate font-medium">{att.name}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBill(i)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer p-1 shrink-0"
                              title="Remove receipt"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Remarks */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Travel Remarks / Operational Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Emergency overnight stay required due to extended MRI helium recharge..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={formState.remarks}
                    onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                  />
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSubmitOrDraft(false)}
                      disabled={isSavingDraft || isSubmitting}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingDraft ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>Save Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitOrDraft(true)}
                      disabled={isSavingDraft || isSubmitting}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Submit Claim (৳{liveTotal.toLocaleString()})</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReceiptPreviewModal
        receipt={receiptPreview?.active || null}
        receipts={receiptPreview?.list || []}
        theme="dark"
        onClose={() => setReceiptPreview(null)}
        onSelectReceipt={(att) =>
          setReceiptPreview((prev) => (prev ? { ...prev, active: att } : null))
        }
      />
    </section>
  );
};
