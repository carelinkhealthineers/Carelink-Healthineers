import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Paperclip,
  X,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Building2,
  Wrench,
  Send,
  Save,
  Edit2,
  Trash2,
  History,
  Lock,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { DailyWorkReport, DailyReportStatus, Employee, DailyWorkReportAttachment } from '../../types';
import {
  fetchReportsForEmployee,
  saveOrSubmitDailyWorkReport,
  DailyReportInput,
  deleteDailyWorkReport,
} from '../../services/dailyReportService';
import { exportToExcel, exportToPDF } from '../../utils/exportHelper';

interface DailyWorkReportSectionProps {
  employee: Employee;
  onToast: (msg: string) => void;
}

export const DailyWorkReportSection: React.FC<DailyWorkReportSectionProps> = ({
  employee,
  onToast,
}) => {
  const [reports, setReports] = useState<DailyWorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Form & Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    report_date: string;
    work_summary: string;
    tasks_completed: string;
    tasks_pending: string;
    work_location: string;
    equipment_worked: string;
    client_hospital: string;
    problems_encountered: string;
    additional_notes: string;
    attachmentName: string;
    attachmentUrl: string;
    attachmentsList: DailyWorkReportAttachment[];
  }>({
    report_date: new Date().toISOString().split('T')[0],
    work_summary: '',
    tasks_completed: '',
    tasks_pending: '',
    work_location: 'Central Field Operations',
    equipment_worked: '',
    client_hospital: '',
    problems_encountered: '',
    additional_notes: '',
    attachmentName: '',
    attachmentUrl: '',
    attachmentsList: [],
  });

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadMyReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReportsForEmployee(employee.id);
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load my daily reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyReports();
  }, [employee.id]);

  const resetForm = () => {
    setEditingReportId(null);
    setFormState({
      report_date: new Date().toISOString().split('T')[0],
      work_summary: '',
      tasks_completed: '',
      tasks_pending: '',
      work_location: 'Central Field Operations',
      equipment_worked: '',
      client_hospital: '',
      problems_encountered: '',
      additional_notes: '',
      attachmentName: '',
      attachmentUrl: '',
      attachmentsList: [],
    });
    setFormError(null);
  };

  const handleOpenNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (report: DailyWorkReport) => {
    setEditingReportId(report.id);
    setFormState({
      report_date: report.report_date,
      work_summary: report.work_summary,
      tasks_completed: report.tasks_completed,
      tasks_pending: report.tasks_pending,
      work_location: report.work_location,
      equipment_worked: report.equipment_worked,
      client_hospital: report.client_hospital,
      problems_encountered: report.problems_encountered,
      additional_notes: report.additional_notes,
      attachmentName: '',
      attachmentUrl: '',
      attachmentsList: report.attachments || [],
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleAddAttachment = () => {
    if (!formState.attachmentName.trim() || !formState.attachmentUrl.trim()) return;
    setFormState((prev) => ({
      ...prev,
      attachmentsList: [
        ...prev.attachmentsList,
        { name: prev.attachmentName.trim(), url: prev.attachmentUrl.trim() },
      ],
      attachmentName: '',
      attachmentUrl: '',
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      attachmentsList: prev.attachmentsList.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitOrDraft = async (isSubmit: boolean) => {
    if (isSubmit) setIsSubmitting(true);
    else setIsSavingDraft(true);
    setFormError(null);

    try {
      let finalAttachments = [...formState.attachmentsList];
      if (formState.attachmentName.trim() && formState.attachmentUrl.trim()) {
        finalAttachments.push({
          name: formState.attachmentName.trim(),
          url: formState.attachmentUrl.trim(),
        });
      }

      const input: DailyReportInput = {
        id: editingReportId || undefined,
        report_date: formState.report_date,
        work_summary: formState.work_summary,
        tasks_completed: formState.tasks_completed,
        tasks_pending: formState.tasks_pending,
        work_location: formState.work_location,
        equipment_worked: formState.equipment_worked,
        client_hospital: formState.client_hospital,
        problems_encountered: formState.problems_encountered,
        additional_notes: formState.additional_notes,
        attachments: finalAttachments,
      };

      const result = await saveOrSubmitDailyWorkReport(input, employee, isSubmit);
      setIsFormOpen(false);
      resetForm();
      onToast(
        isSubmit
          ? `Daily activity report submitted for ${result.report_date}`
          : `Draft report saved for ${result.report_date}`
      );
      await loadMyReports();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save daily report.');
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Delete this report draft?')) return;
    try {
      await deleteDailyWorkReport(reportId);
      onToast('Report deleted');
      await loadMyReports();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete report');
    }
  };

  const handleExportPDF = () => {
    const headers = ['Date', 'Location', 'Hospital', 'Equipment', 'Work Summary', 'Status'];
    const rows = reports.map((r) => [
      r.report_date || '',
      r.work_location || '',
      r.client_hospital || '',
      r.equipment_worked || '',
      (r.work_summary || '').slice(0, 60),
      r.status?.toUpperCase() || '',
    ]);
    exportToPDF({
      filename: `my_daily_reports_${employee.employee_id}`,
      title: `${employee.full_name} (${employee.employee_id}) — Daily Activity Reports`,
      subtitle: `Department: ${employee.department} · Designation: ${employee.designation}`,
      headers,
      rows,
    });
    onToast('Exported daily reports to PDF');
  };

  const handleExportExcel = () => {
    const headers = ['Report Date', 'Location', 'Hospital / Client', 'Equipment', 'Work Summary', 'Completed Tasks', 'Pending Tasks', 'Status'];
    const rows = reports.map((r) => [
      r.report_date || '',
      r.work_location || '',
      r.client_hospital || '',
      r.equipment_worked || '',
      r.work_summary || '',
      r.tasks_completed || '',
      r.tasks_pending || '',
      r.status?.toUpperCase() || '',
    ]);
    exportToExcel({
      filename: `my_daily_reports_${employee.employee_id}`,
      sheetName: 'My Reports',
      headers,
      rows,
    });
    onToast('Exported daily reports to Excel');
  };

  return (
    <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Daily Activity Reports</h2>
              <span className="text-xs font-mono text-slate-400">({reports.length})</span>
            </div>
            <p className="text-xs text-slate-400">
              Record end-of-day diagnostics, completed/pending tasks, equipment worked on, and hospital visits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reports.length > 0 && (
            <>
              <button
                onClick={handleExportPDF}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export as PDF Document"
              >
                <Download size={13} />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export as Excel Sheet"
              >
                <FileSpreadsheet size={13} />
                <span>Excel</span>
              </button>
            </>
          )}

          <button
            onClick={handleOpenNewForm}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>File New Daily Report</span>
          </button>
        </div>
      </div>

      {/* Month & Year Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/30 border border-white/5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Calendar size={15} className="text-blue-400" />
          <span>Filter by Date &amp; Month:</span>
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

      {/* Reports Feed */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
          <p className="text-xs">Loading my activity reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <FileText className="text-slate-600 mx-auto" size={32} />
          <p className="font-semibold text-white">No daily reports recorded yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log your daily field work, hospital visits, equipment servicing, and task progress to keep management informed.
          </p>
          <button
            onClick={handleOpenNewForm}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            File Today&apos;s Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports
            .filter((rep) => {
              if (!rep.report_date) return true;
              const [y, m] = rep.report_date.split('-');
              const matchesYear = selectedYear === 'All' || y === selectedYear;
              const matchesMonth = selectedMonth === 'All' || m === selectedMonth;
              return matchesYear && matchesMonth;
            })
            .map((rep) => (
            <div
              key={rep.id}
              className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                rep.status === 'approved'
                  ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                  : rep.status === 'correction_requested'
                  ? 'bg-rose-500/[0.03] border-rose-500/30'
                  : rep.status === 'submitted'
                  ? 'bg-amber-500/[0.02] border-amber-500/20'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
                    {rep.report_date}
                  </span>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                      rep.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : rep.status === 'correction_requested'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : rep.status === 'submitted'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}
                  >
                    {rep.status === 'correction_requested' ? 'Correction Requested' : rep.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(rep.status === 'draft' || rep.status === 'correction_requested') && (
                    <button
                      onClick={() => handleOpenEditForm(rep)}
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 size={12} />
                      <span>{rep.status === 'draft' ? 'Edit Draft' : 'Update & Resubmit'}</span>
                    </button>
                  )}

                  {rep.status === 'draft' && (
                    <button
                      onClick={() => handleDeleteReport(rep.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Work summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Work Summary
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{rep.work_summary}</p>
              </div>

              {/* Grid metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-1 border-t border-white/5">
                {rep.work_location && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Location</span>
                    <span className="text-slate-300">{rep.work_location}</span>
                  </div>
                )}
                {rep.client_hospital && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Client / Hospital</span>
                    <span className="text-blue-400 font-semibold">{rep.client_hospital}</span>
                  </div>
                )}
                {rep.equipment_worked && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Equipment</span>
                    <span className="text-slate-300 font-mono text-[11px]">{rep.equipment_worked}</span>
                  </div>
                )}
              </div>

              {/* Tasks Subgrid */}
              {(rep.tasks_completed || rep.tasks_pending) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {rep.tasks_completed && (
                    <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                        Completed Tasks
                      </span>
                      <p className="text-slate-300 leading-relaxed">{rep.tasks_completed}</p>
                    </div>
                  )}
                  {rep.tasks_pending && (
                    <div className="p-3 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">
                        Pending Tasks
                      </span>
                      <p className="text-slate-300 leading-relaxed">{rep.tasks_pending}</p>
                    </div>
                  )}
                </div>
              )}

              {rep.problems_encountered && (
                <div className="p-3 bg-rose-500/[0.04] border border-rose-500/20 rounded-xl text-xs space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase block">
                    Problems Encountered
                  </span>
                  <p className="text-slate-300 leading-relaxed">{rep.problems_encountered}</p>
                </div>
              )}

              {/* Attachments */}
              {(rep.attachments || []).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    Attachments:
                  </span>
                  {rep.attachments?.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
                    >
                      <Paperclip size={12} />
                      <span>{att.name}</span>
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}

              {/* Admin Remarks */}
              {rep.admin_remarks && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase block">
                    Admin Feedback / Remarks:
                  </span>
                  <p className="text-slate-200">{rep.admin_remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: SUBMIT / EDIT DAILY REPORT */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 lg:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingReportId ? 'Modify Daily Report' : 'File Daily Work Activity Report'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Fill in todays accomplishments, equipment worked on, and hospital visits.
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
                {/* 1. Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Report Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={formState.report_date}
                      onChange={(e) => setFormState({ ...formState, report_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Work Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Evercare Hospital Radiology / Workshop"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.work_location}
                      onChange={(e) => setFormState({ ...formState, work_location: e.target.value })}
                    />
                  </div>
                </div>

                {/* 2. Client/Hospital & Equipment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Client or Hospital Visited (If applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Square Hospital ICU Wing"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.client_hospital}
                      onChange={(e) => setFormState({ ...formState, client_hospital: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Machines / Equipment Worked On
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dürr Dental Suction VS 900 S, Siemens MRI"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.equipment_worked}
                      onChange={(e) => setFormState({ ...formState, equipment_worked: e.target.value })}
                    />
                  </div>
                </div>

                {/* 3. Today's Work Summary */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Today&apos;s Work Summary *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide a detailed overview of clinical engineering operations completed today..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={formState.work_summary}
                    onChange={(e) => setFormState({ ...formState, work_summary: e.target.value })}
                  />
                </div>

                {/* 4. Tasks Completed & Tasks Pending */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tasks Completed
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Replaced intake filter; calibrated pressure sensor to 2.4 bar..."
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                      value={formState.tasks_completed}
                      onChange={(e) => setFormState({ ...formState, tasks_completed: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tasks Still Pending
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. High-voltage insulation testing scheduled for tomorrow morning..."
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                      value={formState.tasks_pending}
                      onChange={(e) => setFormState({ ...formState, tasks_pending: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. Problems & Additional Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Problems Encountered (If any)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unstable facility power grid causing voltage drop"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.problems_encountered}
                      onChange={(e) => setFormState({ ...formState, problems_encountered: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Additional Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Handed over spare parts log to hospital chief engineer"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formState.additional_notes}
                      onChange={(e) => setFormState({ ...formState, additional_notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* 6. Direct Photo & File Attachments */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Paperclip size={13} className="text-blue-400" />
                    <span>Upload Pictures or Documents Directly</span>
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-black/40 p-2 rounded-xl border border-[#232f45]"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file: File) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setFormState((prev) => ({
                              ...prev,
                              attachmentsList: [
                                ...prev.attachmentsList,
                                { name: file.name, url: reader.result as string },
                              ],
                            }));
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />

                  {formState.attachmentsList.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Attached Files ({formState.attachmentsList.length}):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formState.attachmentsList.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {att.url.startsWith('data:image') ? (
                                <img src={att.url} alt={att.name} className="w-7 h-7 rounded object-cover shrink-0" />
                              ) : (
                                <Paperclip size={14} className="text-blue-400 shrink-0" />
                              )}
                              <span className="truncate font-medium">{att.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(i)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                              title="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
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
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Submit Report</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
