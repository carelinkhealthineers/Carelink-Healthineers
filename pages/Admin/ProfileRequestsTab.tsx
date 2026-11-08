import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Shield,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  FileText,
  ArrowRight,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { ProfileUpdateRequest, Employee } from '../../types';
import {
  fetchProfileUpdateRequests,
  approveProfileUpdateRequest,
  rejectProfileUpdateRequest,
} from '../../services/profileRequestService';

interface ProfileRequestsTabProps {
  onRefreshEmployees?: () => void;
}

export const ProfileRequestsTab: React.FC<ProfileRequestsTabProps> = ({
  onRefreshEmployees,
}) => {
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'approved' | 'rejected'>('All');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{
    request: ProfileUpdateRequest;
    action: 'approve' | 'reject';
    note: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchProfileUpdateRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Failed to load profile update requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
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
      if (reviewModal.action === 'approve') {
        const { request, updatedEmployee } = await approveProfileUpdateRequest(
          reviewModal.request.id,
          reviewModal.note
        );
        triggerToast(`Approved: Updated ${request.field_label} for ${updatedEmployee.full_name}`);
      } else {
        await rejectProfileUpdateRequest(reviewModal.request.id, reviewModal.note);
        triggerToast(`Request rejected for ${reviewModal.request.employee_name}`);
      }

      setReviewModal(null);
      await loadRequests();
      if (onRefreshEmployees) onRefreshEmployees();
    } catch (err: any) {
      alert(err?.message || 'Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.employee_name.toLowerCase().includes(term) ||
      r.employee_code.toLowerCase().includes(term) ||
      r.field_label.toLowerCase().includes(term) ||
      r.requested_value.toLowerCase().includes(term) ||
      (r.reason && r.reason.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countPending = requests.filter((r) => r.status === 'pending').length;
  const countApproved = requests.filter((r) => r.status === 'approved').length;
  const countRejected = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Inbox size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Profile Update Requests</h2>
              {countPending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {countPending} Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and approve locked corporate information changes submitted by staff members.
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

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{countPending}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Approved Changes
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{countApproved}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Rejected Requests
            </span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">{countRejected}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <XCircle size={16} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search employee name, code, or field name..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
          {(['All', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-[#0d111a] rounded-3xl border border-[#1d2436] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={28} />
            <p className="text-xs">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Inbox className="text-slate-600 mx-auto" size={36} />
            <p className="text-sm font-semibold text-white">No profile change requests found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When an employee requests an update to an official field (designation, department, employee ID, phone), it will appear here for one-click approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1d2436]">
            {filteredRequests.map((req) => {
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id}
                  className="p-5 lg:p-6 hover:bg-white/[0.01] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {req.employee_code}
                      </span>
                      <span className="text-sm font-bold text-white">{req.employee_name}</span>

                      {/* Status Tag */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Change Comparison */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-300">{req.field_label}:</span>
                      <span className="line-through text-slate-500 bg-black/30 px-2 py-0.5 rounded">
                        {req.current_value || '(Empty)'}
                      </span>
                      <ArrowRight size={12} className="text-blue-400" />
                      <span className="font-bold text-white bg-blue-600/20 border border-blue-500/30 px-2 py-0.5 rounded">
                        {req.requested_value}
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        &quot;{req.reason}&quot;
                      </p>
                    )}

                    {/* Review Notes if processed */}
                    {req.review_notes && !isPending && (
                      <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Admin Note:</span>
                        <span>{req.review_notes}</span>
                        {req.reviewed_at && (
                          <span className="text-slate-500 font-mono text-[10px]">
                            ({new Date(req.reviewed_at).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  {isPending ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setReviewModal({
                            request: req,
                            action: 'approve',
                            note: 'Approved by Administrator.',
                          })
                        }
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() =>
                          setReviewModal({
                            request: req,
                            action: 'reject',
                            note: 'Requires formal HR documentation.',
                          })
                        }
                        className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                      Submitted {new Date(req.submitted_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEW CONFIRMATION MODAL */}
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
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      reviewModal.action === 'approve'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {reviewModal.action === 'approve' ? <Check size={18} /> : <X size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize">
                      {reviewModal.action} Profile Update
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {reviewModal.action === 'approve'
                        ? 'Update will apply to employee record immediately'
                        : 'Employee will be notified of decline'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Employee:</span>
                  <span className="font-bold text-white">
                    {reviewModal.request.employee_name} ({reviewModal.request.employee_code})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Field Target:</span>
                  <span className="font-bold text-blue-400">{reviewModal.request.field_label}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-400">New Value:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {reviewModal.request.requested_value}
                  </span>
                </div>
              </div>

              <form onSubmit={handleReviewConfirm} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reviewer Note / Justification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Approved and verified with HR records"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                    value={reviewModal.note}
                    onChange={(e) => setReviewModal({ ...reviewModal, note: e.target.value })}
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
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Confirm {reviewModal.action === 'approve' ? 'Approval' : 'Decline'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
