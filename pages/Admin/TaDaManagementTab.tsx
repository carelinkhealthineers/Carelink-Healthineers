import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  Check,
  X,
  Loader2,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Receipt,
  CreditCard,
  Building2,
  FileCheck,
  Filter,
} from 'lucide-react';
import { TaDaClaim, TaDaClaimStatus, PaymentStatus, Employee, ExpenseAttachment } from '../../types';
import {
  fetchTaDaClaims,
  adminReviewTaDaClaim,
  adminTogglePaymentStatus,
  deleteTaDaClaim,
} from '../../services/tadaService';
import { ReceiptGallery, ReceiptPreviewModal } from '../../components/common/ReceiptPreviewModal';

interface TaDaManagementTabProps {
  employees: Employee[];
  onRefreshData?: () => void;
}

export const TaDaManagementTab: React.FC<TaDaManagementTabProps> = ({
  employees,
  onRefreshData,
}) => {
  const [claims, setClaims] = useState<TaDaClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaDaClaimStatus>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{
    claim: TaDaClaim;
    action: 'approve' | 'reject';
    remarks: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<{
    active: ExpenseAttachment;
    list: ExpenseAttachment[];
  } | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await fetchTaDaClaims();
      setClaims(data);
    } catch (err: any) {
      console.error('Failed to load TA/DA claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleReviewConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal) return;
    setIsProcessing(true);

    try {
      const nextStatus: TaDaClaimStatus = reviewModal.action === 'approve' ? 'approved' : 'rejected';
      const updated = await adminReviewTaDaClaim(
        reviewModal.claim.id,
        nextStatus,
        reviewModal.remarks
      );

      triggerToast(
        reviewModal.action === 'approve'
          ? `Approved TA/DA claim ৳${updated.total_amount.toLocaleString()} for ${updated.employee_name}`
          : `Rejected TA/DA claim for ${updated.employee_name}`
      );

      setReviewModal(null);
      await loadClaims();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err?.message || 'Failed to review claim');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePayment = async (claim: TaDaClaim) => {
    const nextPayment: PaymentStatus = claim.payment_status === 'paid' ? 'unpaid' : 'paid';
    try {
      await adminTogglePaymentStatus(claim.id, nextPayment);
      triggerToast(
        nextPayment === 'paid'
          ? `Payment recorded as PAID (৳${claim.total_amount.toLocaleString()})`
          : `Payment status reset to UNPAID`
      );
      await loadClaims();
    } catch (err: any) {
      alert(err?.message || 'Failed to update payment status');
    }
  };

  const handleDelete = async (claimId: string, title: string) => {
    if (!window.confirm(`Delete TA/DA expense claim "${title}"?`)) return;
    try {
      await deleteTaDaClaim(claimId);
      triggerToast('TA/DA expense claim deleted');
      await loadClaims();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete claim');
    }
  };

  // Filtered Claims
  const filteredClaims = claims.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(term) ||
      c.employee_name.toLowerCase().includes(term) ||
      c.employee_code.toLowerCase().includes(term) ||
      c.origin.toLowerCase().includes(term) ||
      c.destination.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || c.payment_status === paymentFilter;
    const matchesEmployee = employeeFilter === 'All' || c.employee_id === employeeFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesEmployee;
  });

  // Calculate Aggregates
  const totalClaimedAmount = claims.reduce((acc, c) => acc + (c.total_amount || 0), 0);
  const totalApprovedAmount = claims
    .filter((c) => c.status === 'approved')
    .reduce((acc, c) => acc + (c.total_amount || 0), 0);
  const totalPaidAmount = claims
    .filter((c) => c.payment_status === 'paid')
    .reduce((acc, c) => acc + (c.total_amount || 0), 0);
  const pendingCount = claims.filter((c) => c.status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">TA/DA &amp; Expense Submissions</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 06 Finance System
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review travel allowances, daily food/accommodation claims, receipts, and payment dispatches.
            </p>
          </div>
        </div>

        {successToast && (
          <div className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Claims Value
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              ৳{totalClaimedAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Receipt size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Approval
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Approved Claims Sum
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
              ৳{totalApprovedAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Disbursed / Paid Total
            </span>
            <span className="text-2xl font-black text-sky-400 mt-1 block font-mono">
              ৳{totalPaidAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <CreditCard size={16} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search claim title, employee name, origin, destination..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Claim Status Filter */}
          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
            {(['All', 'submitted', 'approved', 'rejected', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
            {(['All', 'unpaid', 'paid'] as const).map((pay) => (
              <button
                key={pay}
                onClick={() => setPaymentFilter(pay)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase ${
                  paymentFilter === pay
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pay}
              </button>
            ))}
          </div>

          {/* Employee Filter */}
          <select
            className="px-3 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-slate-300 outline-none focus:border-blue-500 cursor-pointer shrink-0"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="All">All Staff</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-[#0d111a] rounded-3xl border border-[#1d2436] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={28} />
            <p className="text-xs">Loading TA/DA expense claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Receipt className="text-slate-600 mx-auto" size={36} />
            <p className="text-sm font-semibold text-white">No TA/DA expense claims found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When field technical staff submit travel and daily allowance claims, they will be listed here for approval and disbursement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1d2436]">
            {filteredClaims.map((claim) => {
              const isApproved = claim.status === 'approved';
              const isPaid = claim.payment_status === 'paid';

              return (
                <div
                  key={claim.id}
                  className="p-5 lg:p-6 hover:bg-white/[0.01] transition-all space-y-4"
                >
                  {/* Header Row: Title, Employee, Amount, Status */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">{claim.title}</h3>

                        {/* Status Tag */}
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

                        {/* Payment Status Tag */}
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isPaid
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {isPaid ? 'Payment Disbursed (Paid)' : 'Unpaid'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">
                          {claim.employee_name} ({claim.employee_code})
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
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

                    {/* Total Amount Badge & Admin Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                          Total Amount
                        </span>
                        <span className="text-xl font-black text-emerald-400 font-mono">
                          ৳{claim.total_amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Review buttons */}
                        <button
                          onClick={() =>
                            setReviewModal({
                              claim,
                              action: 'approve',
                              remarks: 'TA/DA expenses approved for payment.',
                            })
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Check size={12} />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() =>
                            setReviewModal({
                              claim,
                              action: 'reject',
                              remarks: 'Discrepancy in receipt documentation.',
                            })
                          }
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <X size={12} />
                          <span>Reject</span>
                        </button>

                        {/* Toggle Payment Button */}
                        <button
                          onClick={() => handleTogglePayment(claim)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            isPaid
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
                          }`}
                          title="Toggle Payment Status"
                        >
                          <CreditCard size={12} />
                          <span>{isPaid ? 'Mark Unpaid' : 'Mark Paid'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(claim.id, claim.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Claim"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Line Item Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-black/40 border border-white/5 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Travel Allowance (TA)</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ৳{(claim.travel_allowance || 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Daily Allowance (DA)</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ৳{(claim.daily_allowance || 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Transportation</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ৳{(claim.transportation_expense || 0).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Accommodation &amp; Food</span>
                      <span className="font-mono text-slate-200 font-bold">
                        ৳{(claim.accommodation_food_expense || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {(claim.bills_receipts || []).length > 0 && (
                    <div className="space-y-1.5 text-xs">
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

                  {/* Remarks */}
                  {claim.remarks && (
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                      Employee Remarks: &quot;{claim.remarks}&quot;
                    </p>
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
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white capitalize">
                    {reviewModal.action} TA/DA Claim
                  </h3>
                </div>
                <button
                  onClick={() => setReviewModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Employee:</span>
                  <span className="font-bold text-white">{reviewModal.claim.employee_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Claim Title:</span>
                  <span className="font-bold text-slate-200">{reviewModal.claim.title}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-400">Calculated Total:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    ৳{reviewModal.claim.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleReviewConfirm} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Admin Review Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter review note or payment clearance instructions..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={reviewModal.remarks}
                    onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setReviewModal(null)}
                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`px-5 py-2 rounded-xl font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md ${
                      reviewModal.action === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span>Confirm {reviewModal.action === 'approve' ? 'Approval' : 'Rejection'}</span>
                    )}
                  </button>
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
    </div>
  );
};
