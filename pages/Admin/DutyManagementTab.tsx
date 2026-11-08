import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  FileText,
  User,
  Trash2,
  ChevronRight,
  X,
  Loader2,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { AssignedDuty, DutyPriority, DutyStatus, Employee } from '../../types';
import {
  fetchAssignedDuties,
  createAssignedDuty,
  deleteAssignedDuty,
  CreateDutyInput,
} from '../../services/dutyService';

interface DutyManagementTabProps {
  employees: Employee[];
  onRefreshData?: () => void;
}

export const DutyManagementTab: React.FC<DutyManagementTabProps> = ({
  employees,
  onRefreshData,
}) => {
  const [duties, setDuties] = useState<AssignedDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DutyStatus>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | DutyPriority>('All');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [inspectingDuty, setInspectingDuty] = useState<AssignedDuty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    employee_id: string;
    title: string;
    description: string;
    location: string;
    priority: DutyPriority;
    assigned_date: string;
    deadline: string;
    instructions: string;
    attachmentName: string;
    attachmentUrl: string;
  }>({
    employee_id: employees[0]?.id || '',
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    assigned_date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    instructions: '',
    attachmentName: '',
    attachmentUrl: '',
  });

  const loadDuties = async () => {
    setLoading(true);
    try {
      const data = await fetchAssignedDuties();
      setDuties(data);
    } catch (err: any) {
      console.error('Failed to load duties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuties();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAssignModal = () => {
    setFormData({
      employee_id: employees[0]?.id || '',
      title: '',
      description: '',
      location: 'Central Diagnostic Bay & ICU',
      priority: 'medium',
      assigned_date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      instructions: '',
      attachmentName: '',
      attachmentUrl: '',
    });
    setFormError(null);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id) {
      setFormError('Please select an employee.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Duty title is required.');
      return;
    }

    const assignedEmp = employees.find((emp) => emp.id === formData.employee_id);
    if (!assignedEmp) {
      setFormError('Selected employee is invalid.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const attachments = [];
      if (formData.attachmentName.trim() && formData.attachmentUrl.trim()) {
        attachments.push({
          name: formData.attachmentName.trim(),
          url: formData.attachmentUrl.trim(),
        });
      }

      const input: CreateDutyInput = {
        employee_id: assignedEmp.id,
        employee_name: assignedEmp.full_name,
        employee_code: assignedEmp.employee_id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        priority: formData.priority,
        assigned_date: formData.assigned_date,
        deadline: formData.deadline,
        instructions: formData.instructions.trim(),
        attachments,
      };

      await createAssignedDuty(input);
      setIsAssignModalOpen(false);
      triggerToast(`Duty assigned to ${assignedEmp.full_name}`);
      await loadDuties();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to assign duty.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dutyId: string, title: string) => {
    if (!window.confirm(`Delete duty "${title}"?`)) return;
    try {
      await deleteAssignedDuty(dutyId);
      triggerToast('Duty assignment removed');
      if (inspectingDuty?.id === dutyId) setInspectingDuty(null);
      await loadDuties();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete duty');
    }
  };

  // Filtered Duties
  const filteredDuties = duties.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(term) ||
      d.description.toLowerCase().includes(term) ||
      d.employee_name.toLowerCase().includes(term) ||
      d.employee_code.toLowerCase().includes(term) ||
      d.location.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesEmployee = employeeFilter === 'All' || d.employee_id === employeeFilter;
    const matchesPriority = priorityFilter === 'All' || d.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesEmployee && matchesPriority;
  });

  const countNotStarted = duties.filter((d) => d.status === 'not_started').length;
  const countInProgress = duties.filter((d) => d.status === 'in_progress').length;
  const countCompleted = duties.filter((d) => d.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Duty &amp; Task Assignment Log</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 04 System
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign clinical &amp; technical duties to staff and monitor progress in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successToast && (
            <div className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{successToast}</span>
            </div>
          )}

          <button
            onClick={handleOpenAssignModal}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Assign New Duty</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Assigned
            </span>
            <span className="text-2xl font-black text-white mt-1 block">{duties.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Briefcase size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Not Started
            </span>
            <span className="text-2xl font-black text-slate-300 mt-1 block">{countNotStarted}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center border border-slate-500/20">
            <Clock size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl font-black text-sky-400 mt-1 block">{countInProgress}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Loader2 size={16} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{countCompleted}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={16} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search duty title, location, or assigned employee name..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
            {(['All', 'not_started', 'in_progress', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'not_started' ? 'Not Started' : st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>

          {/* Employee Dropdown Filter */}
          <select
            className="px-3 py-1.5 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-slate-300 outline-none focus:border-blue-500 cursor-pointer shrink-0"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="All">All Assignees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Duty Assignment Table & List */}
      <div className="bg-[#0d111a] rounded-3xl border border-[#1d2436] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={28} />
            <p className="text-xs">Loading duty assignments...</p>
          </div>
        ) : filteredDuties.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Briefcase className="text-slate-600 mx-auto" size={36} />
            <p className="text-sm font-semibold text-white">No duty assignments found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Assign duties to staff to schedule calibration, repairs, customer maintenance, and hospital field visits.
            </p>
            <button
              onClick={handleOpenAssignModal}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Assign First Duty
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1d2436]">
            {filteredDuties.map((duty) => {
              const notesCount = (duty.work_notes || []).length;
              const hasCompletion = Boolean(duty.completion_details);

              return (
                <div
                  key={duty.id}
                  className="p-5 lg:p-6 hover:bg-white/[0.01] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">{duty.title}</h3>

                      {/* Priority Tag */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          duty.priority === 'urgent'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : duty.priority === 'high'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : duty.priority === 'medium'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {duty.priority}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          duty.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : duty.status === 'in_progress'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {duty.status === 'not_started'
                          ? 'Not Started'
                          : duty.status === 'in_progress'
                          ? 'In Progress'
                          : 'Completed'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {duty.description}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-200">
                        <User size={13} className="text-blue-400" />
                        {duty.employee_name} ({duty.employee_code})
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-500" />
                        {duty.location}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar size={13} className="text-slate-500" />
                        Deadline: {duty.deadline}
                      </span>

                      {duty.acknowledged_at && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Acknowledged
                          </span>
                        </>
                      )}

                      {notesCount > 0 && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-blue-400 flex items-center gap-1">
                            <MessageSquare size={12} />
                            {notesCount} note{notesCount > 1 ? 's' : ''} logged
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setInspectingDuty(duty)}
                      className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText size={13} className="text-blue-400" />
                      <span>Inspect Progress</span>
                    </button>

                    <button
                      onClick={() => handleDelete(duty.id, duty.title)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete assignment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ASSIGN NEW DUTY */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 lg:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Assign Duty / Task to Staff</h3>
                    <p className="text-xs text-slate-400">Configure task scope, client location, and deadline.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                {/* 1. Assignee Employee */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assign To Employee *
                  </label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} — {emp.designation} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Title & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siemens Luminos DRF Calibration & Survey"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Priority *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* 3. Location & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Location / Hospital *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Evercare Hospital Radiology Bay 2"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Deadline Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>

                {/* 4. Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Task Scope &amp; Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Outline the operational requirements, client concerns, and hardware specs..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* 5. Instructions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Technical Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Ensure ESD wristband is worn; verify high-voltage generator grounding before powering."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>

                {/* 6. Attachment */}
                <div className="p-3 bg-black/30 border border-white/5 rounded-2xl space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Paperclip size={12} />
                    <span>Reference Attachment (Manual / Blueprint URL)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Attachment Name (e.g. Service Manual PDF)"
                      className="px-3 py-2 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                      value={formData.attachmentName}
                      onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="URL (e.g. https://...)"
                      className="px-3 py-2 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono text-[11px]"
                      value={formData.attachmentUrl}
                      onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Assign Duty</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INSPECT DUTY & LIVE PROGRESS */}
      <AnimatePresence>
        {inspectingDuty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        inspectingDuty.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : inspectingDuty.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {inspectingDuty.priority}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        inspectingDuty.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : inspectingDuty.status === 'in_progress'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {inspectingDuty.status === 'not_started'
                        ? 'Not Started'
                        : inspectingDuty.status === 'in_progress'
                        ? 'In Progress'
                        : 'Completed'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{inspectingDuty.title}</h3>
                </div>
                <button
                  onClick={() => setInspectingDuty(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assignee</span>
                  <span className="text-white font-bold">{inspectingDuty.employee_name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{inspectingDuty.employee_code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Location</span>
                  <span className="text-white font-bold">{inspectingDuty.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Deadline</span>
                  <span className="text-white font-bold font-mono">{inspectingDuty.deadline}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Acknowledged</span>
                  <span className="text-emerald-400 font-bold">
                    {inspectingDuty.acknowledged_at
                      ? new Date(inspectingDuty.acknowledged_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Description & Instructions */}
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Scope &amp; Description
                  </span>
                  <p className="text-slate-200 leading-relaxed">{inspectingDuty.description}</p>
                </div>

                {inspectingDuty.instructions && (
                  <div className="p-4 bg-blue-500/[0.04] border border-blue-500/20 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      Technical Instructions
                    </span>
                    <p className="text-slate-200 leading-relaxed">{inspectingDuty.instructions}</p>
                  </div>
                )}

                {/* Attachments */}
                {(inspectingDuty.attachments || []).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Attachments &amp; Manuals
                    </span>
                    <div className="space-y-1">
                      {inspectingDuty.attachments?.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Paperclip size={13} />
                            {att.name}
                          </span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Work Notes Stream */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-blue-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Work Notes Stream ({(inspectingDuty.work_notes || []).length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500">Live technician activity</span>
                </div>

                {(inspectingDuty.work_notes || []).length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 rounded-2xl bg-black/20 border border-white/5">
                    No work notes submitted yet by the engineer.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {inspectingDuty.work_notes?.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-200">{note.author}</span>
                          <span className="font-mono">
                            {new Date(note.created_at).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completion Details if Done */}
              {inspectingDuty.completion_details && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>Completion Report Submitted</span>
                    </div>
                    <span className="font-mono text-[10px]">
                      {new Date(inspectingDuty.completion_details.completed_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {inspectingDuty.completion_details.completion_notes}
                  </p>
                  {inspectingDuty.completion_details.parts_used_or_summary && (
                    <div className="text-[11px] text-emerald-200 pt-1 border-t border-emerald-500/20 font-mono">
                      Parts / Replacements: {inspectingDuty.completion_details.parts_used_or_summary}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setInspectingDuty(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
