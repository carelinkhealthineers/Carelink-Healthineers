import React, { useState, useMemo } from 'react';
import {
  Crown,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  X,
  User,
  Building2,
  Calendar,
  Check,
  MessageSquare,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  ManagementDecision,
  DecisionPriority,
  DecisionStatus,
  ExecutiveAccount,
} from '../../../types';
import { exportToExcel, exportToPDF } from '../../../utils/exportHelper';

interface ManagementDecisionsSectionProps {
  decisions: ManagementDecision[];
  onCreateDecision: (newDecision: any) => Promise<void>;
  onUpdateStatus: (id: string, status: DecisionStatus) => Promise<void>;
  onDeleteDecision?: (id: string) => Promise<void>;
  execAccount: ExecutiveAccount | null;
  departments: string[];
}

export const ManagementDecisionsSection: React.FC<ManagementDecisionsSectionProps> = ({
  decisions,
  onCreateDecision,
  onUpdateStatus,
  onDeleteDecision,
  execAccount,
  departments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_department: departments[0] || 'Executive Desk',
    assigned_manager_name: '',
    priority: 'high' as DecisionPriority,
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    remarks: '',
  });

  // Filtered decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.assigned_manager_name && d.assigned_manager_name.toLowerCase().includes(q)) ||
        d.target_department.toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'All' || d.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [decisions, searchTerm, priorityFilter, statusFilter]);

  // Aggregates
  const aggregates = useMemo(() => {
    const total = decisions.length;
    const pending = decisions.filter((d) => d.status === 'pending' || d.status === 'in_progress').length;
    const completed = decisions.filter((d) => d.status === 'completed').length;
    const urgent = decisions.filter((d) => d.priority === 'urgent' || d.priority === 'high').length;

    return { total, pending, completed, urgent };
  }, [decisions]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in both title and description for the decision.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateDecision({
        title: formData.title,
        description: formData.description,
        target_department: formData.target_department,
        assigned_manager_name: formData.assigned_manager_name,
        priority: formData.priority,
        deadline: formData.deadline,
        remarks: formData.remarks,
      });

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        target_department: departments[0] || 'Executive Desk',
        assigned_manager_name: '',
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        remarks: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Decisions to Excel
  const handleExportExcel = () => {
    const headers = [
      'Issued Date',
      'Decision Title',
      'Description / Directive',
      'Priority',
      'Status',
      'Target Department',
      'Assigned Manager / Officer',
      'Deadline',
      'Issued By Executive',
    ];

    const rows = filteredDecisions.map((d) => [
      d.created_at ? d.created_at.split('T')[0] : '',
      d.title,
      d.description,
      d.priority.toUpperCase(),
      d.status.toUpperCase(),
      d.target_department,
      d.assigned_manager_name || 'Department Manager',
      d.deadline || 'Ongoing',
      `${d.executive_name} (${d.executive_role})`,
    ]);

    exportToExcel({
      filename: `Carelink_Management_Decisions_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Decisions',
      headers,
      rows,
    });
  };

  // Export Decisions to PDF
  const handleExportPDF = () => {
    const headers = ['Date', 'Directive Title', 'Priority', 'Department', 'Assigned To', 'Deadline', 'Status'];
    const rows = filteredDecisions.map((d) => [
      d.created_at ? d.created_at.split('T')[0] : '',
      d.title,
      d.priority.toUpperCase(),
      d.target_department,
      d.assigned_manager_name || 'Manager',
      d.deadline || 'Ongoing',
      d.status.toUpperCase(),
    ]);

    exportToPDF({
      filename: `Carelink_Management_Decisions_${new Date().toISOString().split('T')[0]}`,
      title: 'Carelink Healthineers — Executive Management Decisions',
      subtitle: `Official Board Directives & Implementation Status · Total ${filteredDecisions.length} Decisions`,
      headers,
      rows,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Crown className="text-amber-500" size={22} />
            <span>Management Decisions & Executive Directives (ব্যবস্থাপনা সিদ্ধান্তসমূহ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue formal board directives, assign department managers, set deadlines, and track real-time implementation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>New Management Decision</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet size={15} />
            <span>Excel Export</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Download size={15} />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Issued Directives</span>
          <div className="text-2xl font-black text-slate-900">{aggregates.total}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Pending Implementation</span>
          <div className="text-2xl font-black text-amber-600">{aggregates.pending}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Completed &amp; Implemented</span>
          <div className="text-2xl font-black text-emerald-600">{aggregates.completed}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-rose-600 block">Urgent Priority Items</span>
          <div className="text-2xl font-black text-rose-600">{aggregates.urgent}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[260px] bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search decisions by title, manager name, department, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent focus:outline-hidden text-slate-800"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 text-[11px]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Decisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDecisions.map((dec) => (
          <div
            key={dec.id}
            className={`p-6 rounded-3xl border transition-all space-y-4 relative ${
              dec.status === 'completed'
                ? 'bg-slate-50/70 border-slate-200'
                : dec.priority === 'urgent'
                ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${
                      dec.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : dec.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : dec.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {dec.priority} Priority
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      dec.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : dec.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {dec.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug mt-1">
                  {dec.title}
                </h3>
              </div>

              {onDeleteDecision && (
                <button
                  onClick={() => {
                    if (confirm(`Delete management decision "${dec.title}"?`)) {
                      onDeleteDecision(dec.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete decision"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {dec.description}
            </p>

            {/* Target Assignment Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Building2 size={12} /> Target Department:
                </span>
                <span className="font-bold text-slate-800">{dec.target_department}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <User size={12} /> Assigned Manager:
                </span>
                <span className="font-bold text-slate-900">
                  {dec.assigned_manager_name || 'Department Manager'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Crown size={12} /> Executive Issuer:
                </span>
                <span className="font-bold text-blue-700">
                  {dec.executive_name} ({dec.executive_role})
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                Deadline: <strong className="text-slate-800">{dec.deadline || 'Ongoing'}</strong>
              </span>

              <div className="flex items-center gap-2">
                {dec.status !== 'in_progress' && dec.status !== 'completed' && (
                  <button
                    onClick={() => onUpdateStatus(dec.id, 'in_progress')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Set In Progress
                  </button>
                )}

                {dec.status !== 'completed' ? (
                  <button
                    onClick={() => onUpdateStatus(dec.id, 'completed')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check size={14} />
                    <span>Mark Implemented</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-xl text-xs flex items-center gap-1">
                    <CheckCircle2 size={14} /> Implemented
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredDecisions.length === 0 && (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-3">
            <Crown size={36} className="text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No management decisions found.</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Issue a formal management directive to department heads or field officers.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Create First Decision</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE DECISION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 lg:p-8 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Crown size={18} className="text-amber-500" />
                  <span>Issue Management Decision & Directive</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Formulate official executive instructions for department managers and staff.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Decision / Directive Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expedite Installation of X-Ray Unit at DMCH Radiology"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Directive Details &amp; Operational Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the specific instructions, requirements, and actions to be taken by the assigned team..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Department</label>
                  <select
                    value={formData.target_department}
                    onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-semibold"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Manager / Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Technical Manager"
                    value={formData.assigned_manager_name}
                    onChange={(e) => setFormData({ ...formData, assigned_manager_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as DecisionPriority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold text-slate-800"
                  >
                    <option value="urgent">🔴 Urgent Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="medium">🔵 Medium Priority</option>
                    <option value="low">⚪ Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Implementation Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
