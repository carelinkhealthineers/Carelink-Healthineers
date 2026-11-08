import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Paperclip,
  Check,
  X,
  Loader2,
  ExternalLink,
  MessageSquare,
  Building2,
  Wrench,
  AlertCircle,
  History,
  Unlock,
  Lock,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { DailyWorkReport, DailyReportStatus, Employee } from '../../types';
import {
  fetchDailyWorkReports,
  adminReviewDailyReport,
  adminToggleReportDuplicateAllowed,
  deleteDailyWorkReport,
} from '../../services/dailyReportService';

interface DailyReportsTabProps {
  employees: Employee[];
  onRefreshData?: () => void;
}

export const DailyReportsTab: React.FC<DailyReportsTabProps> = ({
  employees,
  onRefreshData,
}) => {
  const [reports, setReports] = useState<DailyWorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DailyReportStatus>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{
    report: DailyWorkReport;
    action: 'approve' | 'correction';
    remarks: string;
    allowDuplicate: boolean;
  } | null>(null);

  // History Inspector Modal State
  const [inspectingReport, setInspectingReport] = useState<DailyWorkReport | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchDailyWorkReports();
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load daily work reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
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
      const nextStatus: DailyReportStatus =
        reviewModal.action === 'approve' ? 'approved' : 'correction_requested';

      const updated = await adminReviewDailyReport(
        reviewModal.report.id,
        nextStatus,
        reviewModal.remarks,
        reviewModal.allowDuplicate
      );

      triggerToast(
        reviewModal.action === 'approve'
          ? `Approved report for ${updated.employee_name} (${updated.report_date})`
          : `Requested corrections for ${updated.employee_name}'s report`
      );

      setReviewModal(null);
      await loadReports();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err?.message || 'Failed to review report');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleDuplicatePermission = async (report: DailyWorkReport) => {
    const nextAllowed = !report.allow_duplicate;
    try {
      await adminToggleReportDuplicateAllowed(report.id, nextAllowed);
      triggerToast(
        nextAllowed
          ? `Duplicate reports unlocked for ${report.employee_name} on ${report.report_date}`
          : `Duplicate reports locked for ${report.employee_name} on ${report.report_date}`
      );
      await loadReports();
    } catch (err: any) {
      alert(err?.message || 'Failed to update duplicate permission');
    }
  };

  const handleDelete = async (reportId: string, employeeName: string, date: string) => {
    if (!window.confirm(`Delete daily activity report for ${employeeName} on ${date}?`)) return;
    try {
      await deleteDailyWorkReport(reportId);
      triggerToast('Daily work report deleted');
      if (inspectingReport?.id === reportId) setInspectingReport(null);
      await loadReports();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete report');
    }
  };

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.employee_name.toLowerCase().includes(term) ||
      r.employee_code.toLowerCase().includes(term) ||
      r.work_summary.toLowerCase().includes(term) ||
      r.work_location.toLowerCase().includes(term) ||
      (r.client_hospital && r.client_hospital.toLowerCase().includes(term)) ||
      (r.equipment_worked && r.equipment_worked.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesEmployee = employeeFilter === 'All' || r.employee_id === employeeFilter;
    const matchesDate = !dateFilter || r.report_date === dateFilter;

    return matchesSearch && matchesStatus && matchesEmployee && matchesDate;
  });

  const countSubmitted = reports.filter((r) => r.status === 'submitted').length;
  const countApproved = reports.filter((r) => r.status === 'approved').length;
  const countCorrections = reports.filter((r) => r.status === 'correction_requested').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Daily Work Activity Reports</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 05 System
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review daily technical logs, equipment serviced, hospital visits, and submission histories.
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Reports
            </span>
            <span className="text-2xl font-black text-white mt-1 block">{reports.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <FileText size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{countSubmitted}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Approved Logs
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
              Corrections Needed
            </span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">{countCorrections}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle size={16} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search work summary, hospital/client, equipment, or employee..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
            {(['All', 'submitted', 'approved', 'correction_requested', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'correction_requested' ? 'Correction' : st}
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

          {/* Date Filter */}
          <input
            type="date"
            className="px-3 py-1.5 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-slate-300 font-mono outline-none focus:border-blue-500 shrink-0"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by Report Date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Reports Feed & Table */}
      <div className="bg-[#0d111a] rounded-3xl border border-[#1d2436] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={28} />
            <p className="text-xs">Loading daily work reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <FileText className="text-slate-600 mx-auto" size={36} />
            <p className="text-sm font-semibold text-white">No daily activity reports found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When field engineers and staff submit their end-of-day reports, they will appear here for review and remarking.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1d2436]">
            {filteredReports.map((rep) => {
              const isSubmitted = rep.status === 'submitted';
              const historyCount = (rep.history || []).length;

              return (
                <div
                  key={rep.id}
                  className="p-5 lg:p-6 hover:bg-white/[0.01] transition-all space-y-4"
                >
                  {/* Top Bar: Employee info, status, date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                        {rep.employee_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{rep.employee_name}</span>
                          <span className="text-xs font-mono text-slate-400">({rep.employee_code})</span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              rep.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : rep.status === 'correction_requested'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : rep.status === 'submitted'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {rep.status === 'correction_requested'
                              ? 'Correction Requested'
                              : rep.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                          <Calendar size={11} className="text-blue-400" />
                          <span>Report Date: {rep.report_date}</span>
                          {rep.submitted_at && (
                            <span>
                              · Submitted:{' '}
                              {new Date(rep.submitted_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Duplicate Permission Toggle */}
                      <button
                        onClick={() => handleToggleDuplicatePermission(rep)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                          rep.allow_duplicate
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:text-white'
                        }`}
                        title={
                          rep.allow_duplicate
                            ? 'Duplicate report allowed by Admin'
                            : 'Click to allow duplicate report for this date'
                        }
                      >
                        {rep.allow_duplicate ? <Unlock size={11} /> : <Lock size={11} />}
                        <span>{rep.allow_duplicate ? 'Duplicate Allowed' : 'Allow Duplicate'}</span>
                      </button>

                      {/* Review Buttons */}
                      <button
                        onClick={() =>
                          setReviewModal({
                            report: rep,
                            action: 'approve',
                            remarks: 'Verified daily activity report.',
                            allowDuplicate: Boolean(rep.allow_duplicate),
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
                            report: rep,
                            action: 'correction',
                            remarks: 'Please elaborate on problems encountered and equipment models.',
                            allowDuplicate: Boolean(rep.allow_duplicate),
                          })
                        }
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <AlertTriangle size={12} />
                        <span>Request Correction</span>
                      </button>

                      <button
                        onClick={() => setInspectingReport(rep)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="View Submission History"
                      >
                        <History size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(rep.id, rep.employee_name, rep.report_date)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Operational Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl text-xs space-y-1 md:space-y-0">
                    {/* Summary */}
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Work Summary
                      </span>
                      <p className="text-slate-200 leading-relaxed">{rep.work_summary}</p>
                    </div>

                    {/* Location & Client */}
                    <div className="space-y-2">
                      {rep.work_location && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Location
                          </span>
                          <span className="text-slate-300 font-medium">{rep.work_location}</span>
                        </div>
                      )}
                      {rep.client_hospital && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Hospital / Client
                          </span>
                          <span className="text-blue-400 font-semibold">{rep.client_hospital}</span>
                        </div>
                      )}
                      {rep.equipment_worked && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Equipment Serviced
                          </span>
                          <span className="text-slate-300 font-mono text-[11px]">{rep.equipment_worked}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tasks & Problems sub-grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {rep.tasks_completed && (
                      <div className="p-3.5 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                          <CheckCircle2 size={12} /> Completed Tasks
                        </span>
                        <p className="text-slate-200 leading-relaxed">{rep.tasks_completed}</p>
                      </div>
                    )}

                    {rep.tasks_pending && (
                      <div className="p-3.5 bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                          <Clock size={12} /> Pending Tasks
                        </span>
                        <p className="text-slate-200 leading-relaxed">{rep.tasks_pending}</p>
                      </div>
                    )}
                  </div>

                  {rep.problems_encountered && (
                    <div className="p-3.5 bg-rose-500/[0.04] border border-rose-500/20 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block flex items-center gap-1">
                        <AlertTriangle size={12} /> Problems / Impediments Encountered
                      </span>
                      <p className="text-slate-200 leading-relaxed">{rep.problems_encountered}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {(rep.attachments || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        Attachments:
                      </span>
                      {rep.attachments?.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                        >
                          <Paperclip size={12} />
                          <span>{att.name}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Admin Remarks display */}
                  {rep.admin_remarks && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase block">
                        Admin Remarks &amp; Feedback:
                      </span>
                      <p className="text-slate-200">{rep.admin_remarks}</p>
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
                  <FileText size={18} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white capitalize">
                    {reviewModal.action === 'approve' ? 'Approve' : 'Request Correction'} Daily Report
                  </h3>
                </div>
                <button
                  onClick={() => setReviewModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Employee:</span>
                  <span className="font-bold text-white">{reviewModal.report.employee_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Report Date:</span>
                  <span className="font-bold font-mono text-blue-400">{reviewModal.report.report_date}</span>
                </div>
              </div>

              <form onSubmit={handleReviewConfirm} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Admin Remarks &amp; Feedback *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter review feedback for staff member..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={reviewModal.remarks}
                    onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                  />
                </div>

                <label className="flex items-center gap-2 p-3 bg-black/30 border border-white/5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewModal.allowDuplicate}
                    onChange={(e) =>
                      setReviewModal({ ...reviewModal, allowDuplicate: e.target.checked })
                    }
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Allow duplicate report submission for this date
                  </span>
                </label>

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
                      <span>
                        Confirm {reviewModal.action === 'approve' ? 'Approval' : 'Correction Request'}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HISTORY INSPECTOR MODAL */}
      <AnimatePresence>
        {inspectingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Report Submission History</h3>
                </div>
                <button
                  onClick={() => setInspectingReport(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs">
                <span className="text-slate-400">Report Date: </span>
                <span className="font-bold text-white font-mono">{inspectingReport.report_date}</span>
                <span className="text-slate-400"> by </span>
                <span className="font-bold text-blue-400">{inspectingReport.employee_name}</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {(inspectingReport.history || []).map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-200">{h.actor}</span>
                      <span className="font-mono">
                        {new Date(h.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="text-blue-400 font-semibold">{h.action}</div>
                    {h.notes && <p className="text-slate-300 italic">&quot;{h.notes}&quot;</p>}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  onClick={() => setInspectingReport(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
