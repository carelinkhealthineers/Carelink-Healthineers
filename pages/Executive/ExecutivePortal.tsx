import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown,
  LogOut,
  Building2,
  Users,
  FileText,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Search,
  Download,
  Printer,
  Plus,
  MessageSquare,
  Flag,
  Calendar,
  DollarSign,
  MapPin,
  Paperclip,
  ExternalLink,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  PieChart,
  Bell,
  RefreshCw,
  Loader2,
  X,
  ChevronDown,
  Receipt,
  FileSpreadsheet,
  StickyNote,
  Pin,
  Trash2,
  Stethoscope,
  BookOpen,
} from 'lucide-react';
import {
  ExecutiveAccount,
  ExecutiveRole,
  DailyWorkReport,
  AssignedDuty,
  TaDaClaim,
  Employee,
  ManagementDecision,
  DecisionPriority,
  DecisionStatus,
  ExecutiveRemark,
  CompanyNote,
  NoteCategory,
  ProductSaleRecord,
  CustomExcelPreset,
} from '../../types';
import {
  getCurrentExecutiveSession,
  fetchExecutiveAccounts,
  fetchManagementDecisions,
  createManagementDecision,
  updateDecisionStatus,
  deleteManagementDecision,
  fetchExecutiveRemarks,
  addExecutiveRemark,
  setExecutiveSession,
  fetchCompanyNotes,
  createCompanyNote,
  deleteCompanyNote,
  togglePinCompanyNote,
  fetchSalesRecords,
  createSalesRecord,
  deleteSalesRecord,
  fetchMonthlyBudget,
  saveMonthlyBudget,
  fetchCustomExcelPresets,
  saveCustomExcelPreset,
  deleteCustomExcelPreset,
} from '../../services/executiveService';
import { fetchEmployees, DEPARTMENTS } from '../../services/employeeService';
import { fetchDailyWorkReports, adminReviewDailyReport } from '../../services/dailyReportService';
import { fetchAssignedDuties } from '../../services/dutyService';
import { fetchTaDaClaims, adminReviewTaDaClaim, adminTogglePaymentStatus } from '../../services/tadaService';
import { performSignOut } from '../../supabaseClient';
import { exportToExcel, exportToPDF } from '../../utils/exportHelper';
import { FinancialHishabSection } from './components/FinancialHishabSection';
import { DoctorSalesLedgerSection } from './components/DoctorSalesLedgerSection';
import { CustomExcelPortalSection } from './components/CustomExcelPortalSection';
import { ExecutiveUserManualBangla } from './components/ExecutiveUserManualBangla';
import { ManagementDecisionsSection } from './components/ManagementDecisionsSection';

type TabView =
  | 'overview'
  | 'hishab'
  | 'sales'
  | 'custom-excel'
  | 'manual'
  | 'reports'
  | 'tada'
  | 'notes'
  | 'decisions'
  | 'analytics'
  | 'alerts';

export const ExecutivePortal: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [execAccount, setExecAccount] = useState<ExecutiveAccount | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core Datasets
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyWorkReport[]>([]);
  const [assignedDuties, setAssignedDuties] = useState<AssignedDuty[]>([]);
  const [tadaClaims, setTadaClaims] = useState<TaDaClaim[]>([]);
  const [decisions, setDecisions] = useState<ManagementDecision[]>([]);
  const [remarks, setRemarks] = useState<ExecutiveRemark[]>([]);
  const [companyNotes, setCompanyNotes] = useState<CompanyNote[]>([]);
  const [salesRecords, setSalesRecords] = useState<ProductSaleRecord[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500000);
  const [customExcelPresets, setCustomExcelPresets] = useState<CustomExcelPreset[]>([]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [execMonth, setExecMonth] = useState<string>('All');
  const [execYear, setExecYear] = useState<string>('All');
  const [timeFrame, setTimeFrame] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modal States
  const [selectedReport, setSelectedReport] = useState<DailyWorkReport | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [targetReportForRemark, setTargetReportForRemark] = useState<DailyWorkReport | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [isFlagUrgent, setIsFlagUrgent] = useState(false);

  // Note Form
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    category: NoteCategory;
    amount: string;
    is_pinned: boolean;
  }>({
    title: '',
    content: '',
    category: 'expense',
    amount: '',
    is_pinned: false,
  });

  // Decision Form
  const [newDecision, setNewDecision] = useState<{
    title: string;
    description: string;
    target_department: string;
    assigned_manager_name: string;
    priority: DecisionPriority;
    deadline: string;
    remarks: string;
  }>({
    title: '',
    description: '',
    target_department: DEPARTMENTS[0],
    assigned_manager_name: '',
    priority: 'high',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    remarks: '',
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadExecutiveData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Verify executive session
      const { execAccount: currentExec } = await getCurrentExecutiveSession();

      if (!currentExec) {
        // Check if user has an active executive account list and pick top
        const allExecs = await fetchExecutiveAccounts();
        const activeExec = allExecs.find((e) => e.status === 'active') || allExecs[0];
        
        const fallbackExec: ExecutiveAccount = activeExec || {
          id: 'exec-md-default',
          full_name: 'Managing Director (MD)',
          username: 'md@exec',
          auth_email: 'md@exec.carelinkhealthineers.com',
          title_designation: 'Managing Director (MD)',
          role: 'MD',
          accessible_departments: ['all'],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setExecAccount(fallbackExec);
        setExecutiveSession(fallbackExec);
      } else {
        setExecAccount(currentExec);
      }

      // 2. Fetch all real enterprise data in parallel
      const [
        empList,
        reportList,
        dutyList,
        claimList,
        decisionList,
        remarkList,
        notesList,
        salesList,
        budgetAmount,
        presetList,
      ] = await Promise.all([
        fetchEmployees().catch(() => []),
        fetchDailyWorkReports().catch(() => []),
        fetchAssignedDuties().catch(() => []),
        fetchTaDaClaims().catch(() => []),
        fetchManagementDecisions().catch(() => []),
        fetchExecutiveRemarks().catch(() => []),
        fetchCompanyNotes().catch(() => []),
        fetchSalesRecords().catch(() => []),
        fetchMonthlyBudget('2026-11').catch(() => 500000),
        fetchCustomExcelPresets().catch(() => []),
      ]);

      setEmployees(empList);
      setDailyReports(reportList);
      setAssignedDuties(dutyList);
      setTadaClaims(claimList);
      setDecisions(decisionList);
      setRemarks(remarkList);
      setCompanyNotes(notesList);
      setSalesRecords(salesList);
      setMonthlyBudget(budgetAmount);
      setCustomExcelPresets(presetList);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize Executive Management Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutiveData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSwitchAccount = async (exec: ExecutiveAccount) => {
    setExecAccount(exec);
    setExecutiveSession(exec);
    triggerToast(`Switched active view to ${exec.full_name} (${exec.role})`);
  };

  const handleLogout = async () => {
    setExecutiveSession(null);
    await performSignOut();
    navigate('/login');
  };

  // Executive Decisions Handler
  const handleCreateDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execAccount || !newDecision.title.trim() || !newDecision.description.trim()) return;

    try {
      const created = await createManagementDecision({
        executive: execAccount,
        title: newDecision.title,
        description: newDecision.description,
        target_department: newDecision.target_department,
        assigned_manager_name: newDecision.assigned_manager_name,
        priority: newDecision.priority,
        deadline: newDecision.deadline,
        remarks: newDecision.remarks,
        related_report_id: selectedReport?.id,
        related_employee_id: selectedReport?.employee_id,
      });

      setDecisions([created, ...decisions]);
      setIsDecisionModalOpen(false);
      setNewDecision({
        title: '',
        description: '',
        target_department: DEPARTMENTS[0],
        assigned_manager_name: '',
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        remarks: '',
      });
      triggerToast(`Management Decision "${created.title}" recorded.`);
    } catch (err: any) {
      alert(`Failed to save decision: ${err?.message}`);
    }
  };

  const handleUpdateDecisionStatus = async (id: string, newStatus: DecisionStatus) => {
    try {
      const updated = await updateDecisionStatus(id, newStatus);
      setDecisions(decisions.map((d) => (d.id === id ? updated : d)));
      triggerToast(`Decision status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      alert(`Update failed: ${err?.message}`);
    }
  };

  // Remark Handler
  const handleAddRemarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execAccount || !targetReportForRemark || !remarkInput.trim()) return;

    try {
      const newRemark = await addExecutiveRemark(
        targetReportForRemark.id,
        execAccount,
        remarkInput.trim(),
        isFlagUrgent
      );

      setRemarks([newRemark, ...remarks]);
      setIsRemarkModalOpen(false);
      setRemarkInput('');
      setIsFlagUrgent(false);
      setTargetReportForRemark(null);
      triggerToast('Executive remark & instructions logged.');
    } catch (err: any) {
      alert(`Failed to add remark: ${err?.message}`);
    }
  };

  // Executive TA/DA Claim Review Handlers
  const handleReviewTaDaClaim = async (claimId: string, status: 'approved' | 'rejected', remarks: string = 'Reviewed by Executive') => {
    try {
      const updated = await adminReviewTaDaClaim(claimId, status, remarks);
      setTadaClaims(tadaClaims.map((c) => (c.id === claimId ? updated : c)));
      triggerToast(`Claim ${status === 'approved' ? 'APPROVED' : 'REJECTED'}`);
    } catch (err: any) {
      alert(`Review failed: ${err?.message}`);
    }
  };

  const handleToggleClaimPayment = async (claimId: string, currentStatus: 'unpaid' | 'paid') => {
    try {
      const nextStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
      const updated = await adminTogglePaymentStatus(claimId, nextStatus);
      setTadaClaims(tadaClaims.map((c) => (c.id === claimId ? updated : c)));
      triggerToast(`Payment status updated to ${nextStatus.toUpperCase()}`);
    } catch (err: any) {
      alert(`Payment update failed: ${err?.message}`);
    }
  };

  const handleReviewReport = async (reportId: string, status: 'approved' | 'correction_requested', remarks: string = 'Reviewed by Executive') => {
    try {
      const updated = await adminReviewDailyReport(reportId, status, remarks);
      setDailyReports(dailyReports.map((r) => (r.id === reportId ? updated : r)));
      triggerToast(`Report status set to ${status.toUpperCase()}`);
    } catch (err: any) {
      alert(`Report review failed: ${err?.message}`);
    }
  };

  // Company Note Handlers
  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execAccount || !newNote.title.trim() || !newNote.content.trim()) return;

    try {
      const created = await createCompanyNote({
        author_id: execAccount.id,
        author_name: execAccount.full_name,
        author_role: execAccount.role,
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        category: newNote.category,
        is_pinned: newNote.is_pinned,
        amount: newNote.amount ? parseFloat(newNote.amount) : undefined,
      });

      setCompanyNotes([created, ...companyNotes]);
      setIsNoteModalOpen(false);
      setNewNote({
        title: '',
        content: '',
        category: 'expense',
        amount: '',
        is_pinned: false,
      });
      triggerToast('Company Note / Directive saved.');
    } catch (err: any) {
      alert(`Failed to save company note: ${err?.message}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Delete this company note?')) return;
    try {
      await deleteCompanyNote(id);
      setCompanyNotes(companyNotes.filter((n) => n.id !== id));
      triggerToast('Company note removed.');
    } catch (err: any) {
      alert(`Delete failed: ${err?.message}`);
    }
  };

  const handleTogglePinNote = async (id: string) => {
    try {
      const updated = await togglePinCompanyNote(id);
      setCompanyNotes(companyNotes.map((n) => (n.id === id ? updated : n)));
      triggerToast(updated.is_pinned ? 'Note pinned to top' : 'Note unpinned');
    } catch (err: any) {
      alert(`Pin toggle failed: ${err?.message}`);
    }
  };

  // Budget Handlers
  const handleUpdateBudget = async (newBudget: number) => {
    try {
      await saveMonthlyBudget('2026-11', newBudget);
      setMonthlyBudget(newBudget);
      triggerToast(`Monthly budget updated to ৳${newBudget.toLocaleString()}`);
    } catch (err: any) {
      alert(`Budget update failed: ${err?.message}`);
    }
  };

  // Sales Handlers
  const handleAddSale = async (newSaleInput: any) => {
    try {
      const created = await createSalesRecord(newSaleInput);
      setSalesRecords([created, ...salesRecords]);
      triggerToast(`Sale recorded for ${created.doctor_name} (${created.product_name})`);
    } catch (err: any) {
      alert(`Failed to record sale: ${err?.message}`);
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSalesRecord(id);
      setSalesRecords(salesRecords.filter((s) => s.id !== id));
      triggerToast('Equipment sale record removed.');
    } catch (err: any) {
      alert(`Failed to delete sale: ${err?.message}`);
    }
  };

  // Custom Excel Presets Handlers
  const handleSaveCustomPreset = async (presetInput: any) => {
    try {
      const created = await saveCustomExcelPreset(presetInput);
      setCustomExcelPresets([created, ...customExcelPresets]);
      triggerToast(`Custom sheet "${created.name}" saved in portal.`);
    } catch (err: any) {
      alert(`Failed to save preset: ${err?.message}`);
    }
  };

  const handleDeleteCustomPreset = async (id: string) => {
    try {
      await deleteCustomExcelPreset(id);
      setCustomExcelPresets(customExcelPresets.filter((p) => p.id !== id));
      triggerToast('Custom sheet preset removed.');
    } catch (err: any) {
      alert(`Failed to delete preset: ${err?.message}`);
    }
  };

  // Helper for Date & Week range filtering
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  const matchesTimeFrame = (dateStr: string) => {
    if (!dateStr) return true;
    if (timeFrame === 'all') return true;
    if (timeFrame === 'today') return dateStr === todayStr || dateStr.startsWith(todayStr);
    if (timeFrame === 'week') return dateStr >= startOfWeekStr;
    if (timeFrame === 'month') return dateStr >= startOfMonthStr;
    return true;
  };

  // Data Calculations & Briefing Aggregations
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const reportsToday = dailyReports.filter((r) => r.report_date === todayStr || r.submitted_at?.startsWith(todayStr));
  
  // Roster of employees who submitted vs missing today
  const submittedEmpIdsToday = new Set(reportsToday.map((r) => r.employee_id));
  const missingReportEmployees = activeEmployees.filter((e) => !submittedEmpIdsToday.has(e.id));

  const completedDutiesCount = assignedDuties.filter((d) => d.status === 'completed').length;
  const ongoingDutiesCount = assignedDuties.filter((d) => d.status === 'in_progress' || d.status === 'not_started').length;
  const urgentDuties = assignedDuties.filter((d) => d.priority === 'urgent' || d.priority === 'high');
  
  const pendingDecisions = decisions.filter((d) => d.status === 'pending' || d.status === 'in_progress');

  // Multi-format Export Handlers (Excel, PDF, CSV)
  const handleExportReportsExcel = () => {
    const headers = ['Report Date', 'Employee Name', 'Employee Code', 'Location', 'Hospital / Client', 'Equipment', 'Work Summary', 'Status'];
    const rows = dailyReports.map((r) => [
      r.report_date || '',
      r.employee_name || '',
      r.employee_code || '',
      r.work_location || '',
      r.client_hospital || '',
      r.equipment_worked || '',
      r.work_summary || '',
      r.status || '',
    ]);
    exportToExcel({
      filename: `carelink_daily_reports_${todayStr}`,
      sheetName: 'Daily Reports',
      headers,
      rows,
    });
    triggerToast('Daily reports exported to Excel (.xlsx)');
  };

  const handleExportReportsPDF = () => {
    const headers = ['Date', 'Employee', 'ID', 'Location / Hospital', 'Equipment', 'Work Summary', 'Status'];
    const rows = dailyReports.map((r) => [
      r.report_date || '',
      r.employee_name || '',
      r.employee_code || '',
      r.client_hospital || r.work_location || '',
      r.equipment_worked || '—',
      (r.work_summary || '').slice(0, 70),
      r.status?.toUpperCase() || '',
    ]);
    exportToPDF({
      filename: `carelink_daily_reports_${todayStr}`,
      title: 'Carelink Healthineers — Employee Daily Activity Report',
      subtitle: `Generated on ${todayStr} · Total Reports: ${dailyReports.length}`,
      headers,
      rows,
    });
    triggerToast('Daily reports exported to PDF (.pdf)');
  };

  const handleExportTaDaExcel = () => {
    const headers = ['Employee Name', 'Employee Code', 'Destination', 'Start Date', 'End Date', 'TA (BDT)', 'DA (BDT)', 'Transport (BDT)', 'Hotel/Food (BDT)', 'Total (BDT)', 'Status', 'Payment'];
    const rows = tadaClaims.map((c) => [
      c.employee_name || '',
      c.employee_code || '',
      c.destination || '',
      c.start_date || '',
      c.end_date || '',
      c.travel_allowance || 0,
      c.daily_allowance || 0,
      c.transport_expense || 0,
      c.accommodation_expense || 0,
      c.total_amount || 0,
      c.status?.toUpperCase() || '',
      c.payment_status?.toUpperCase() || '',
    ]);
    exportToExcel({
      filename: `carelink_tada_claims_${todayStr}`,
      sheetName: 'TA-DA Claims',
      headers,
      rows,
    });
    triggerToast('TA/DA expense claims exported to Excel (.xlsx)');
  };

  const handleExportTaDaPDF = () => {
    const headers = ['Employee', 'Destination', 'Dates', 'TA', 'DA', 'Transport', 'Hotel', 'Total (BDT)', 'Claim Status', 'Payment'];
    const rows = tadaClaims.map((c) => [
      c.employee_name || '',
      c.destination || '',
      `${c.start_date || ''} - ${c.end_date || ''}`,
      `৳${c.travel_allowance || 0}`,
      `৳${c.daily_allowance || 0}`,
      `৳${c.transport_expense || 0}`,
      `৳${c.accommodation_expense || 0}`,
      `৳${(c.total_amount || 0).toLocaleString()}`,
      c.status?.toUpperCase() || '',
      c.payment_status?.toUpperCase() || '',
    ]);
    exportToPDF({
      filename: `carelink_tada_claims_${todayStr}`,
      title: 'Carelink Healthineers — Official TA/DA & Expense Claims Log',
      subtitle: `Total Claim Value: ৳${tadaClaims.reduce((acc, c) => acc + (c.total_amount || 0), 0).toLocaleString()} · Generated on ${todayStr}`,
      headers,
      rows,
    });
    triggerToast('TA/DA expense claims exported to PDF (.pdf)');
  };

  const handleExportNotesExcel = () => {
    const headers = ['Date', 'Author', 'Role', 'Category', 'Title', 'Content', 'Amount (BDT)', 'Pinned'];
    const rows = companyNotes.map((n) => [
      n.date || '',
      n.author_name || '',
      n.author_role || '',
      n.category.toUpperCase(),
      n.title || '',
      n.content || '',
      n.amount || 0,
      n.is_pinned ? 'YES' : 'NO',
    ]);
    exportToExcel({
      filename: `carelink_company_notes_${todayStr}`,
      sheetName: 'Company Notes',
      headers,
      rows,
    });
    triggerToast('Company notes exported to Excel (.xlsx)');
  };

  const handleExportNotesPDF = () => {
    const headers = ['Date', 'Author', 'Category', 'Title', 'Expense/Budget (BDT)', 'Directives & Notes'];
    const rows = companyNotes.map((n) => [
      n.date || '',
      `${n.author_name} (${n.author_role})`,
      n.category.toUpperCase(),
      n.title || '',
      n.amount ? `৳${n.amount.toLocaleString()}` : '—',
      (n.content || '').slice(0, 80),
    ]);
    exportToPDF({
      filename: `carelink_company_notes_${todayStr}`,
      title: 'Carelink Healthineers — Executive Directives & Company Notes',
      subtitle: `Official Records · Generated on ${todayStr}`,
      headers,
      rows,
    });
    triggerToast('Company notes exported to PDF (.pdf)');
  };

  // CSV Fallback Exporter
  const exportToCSV = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) {
      alert('No data rows available to export.');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const body = rows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${body}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-700">
        <Loader2 className="animate-spin text-blue-700 mb-3" size={36} />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Connecting to Executive Briefing Terminal...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col md:flex-row">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl">
        <div>
          {/* Executive Brand Badge */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Crown size={20} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                Carelink Healthineers
              </h1>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Executive Portal
              </span>
            </div>
          </div>

          {/* Active Executive Profile Card */}
          {execAccount && (
            <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {execAccount.role} Access
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white truncate">{execAccount.full_name}</div>
                <div className="text-[10px] text-slate-400 truncate">{execAccount.title_designation}</div>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 size={16} />
              <span>Executive Briefing</span>
            </button>

            <button
              onClick={() => setActiveTab('hishab')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hishab'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign size={16} />
                <span>Financial &amp; Budget Hishab</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                ৳ Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Stethoscope size={16} />
                <span>Doctor &amp; Center Sales</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                {salesRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('custom-excel')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'custom-excel'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Custom Excel Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                  : 'text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={16} />
                <span>ব্যবহার বিধি (User Manual)</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-400/20 text-amber-300 font-bold">
                বাংলা
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText size={16} />
              <span>Employee Daily Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('tada')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tada'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt size={16} />
                <span>Employee TA/DA Claims</span>
              </div>
              {tadaClaims.filter((c) => c.status === 'pending').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-extrabold">
                  {tadaClaims.filter((c) => c.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <StickyNote size={16} />
                <span>Company Notes &amp; Expenses</span>
              </div>
              {companyNotes.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300 font-semibold">
                  {companyNotes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('decisions')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'decisions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Crown size={16} />
                <span>Management Decisions</span>
              </div>
              {pendingDecisions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-extrabold">
                  {pendingDecisions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp size={16} />
              <span>Reports &amp; Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell size={16} />
                <span>Alert Center</span>
              </div>
              {missingReportEmployees.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-extrabold">
                  {missingReportEmployees.length} Alert
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/command-nexus"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" />
              <span>Admin Panel</span>
            </div>
            <ChevronRight size={14} />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Executive Management Terminal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Read-Only Overview
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live corporate briefing, department activity monitoring &amp; decision tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {toastMsg && (
              <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>{toastMsg}</span>
              </div>
            )}

            <button
              onClick={loadExecutiveData}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
              title="Refresh Briefing Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              <BookOpen size={15} className="text-amber-700" />
              <span>সহজ বাংলা গাইড</span>
            </button>

            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
            >
              <Crown size={15} />
              <span>New Decision</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="p-4 lg:p-6 space-y-6 w-full max-w-none">
          {/* TAB 1: EXECUTIVE BRIEFING & OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Staff</span>
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{employees.length}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">{activeEmployees.length} Active</div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Reports Today</span>
                    <FileText size={18} className="text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{reportsToday.length}</div>
                  <div className="text-[11px] text-amber-600 font-semibold">{missingReportEmployees.length} Missing</div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Duties Complete</span>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{completedDutiesCount}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{ongoingDutiesCount} In Progress</div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Urgent Matters</span>
                    <AlertTriangle size={18} className="text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-600">{urgentDuties.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Requires Inspection</div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pending Decisions</span>
                    <Crown size={18} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-600">{pendingDecisions.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Management Actions</div>
                </div>
              </div>

              {/* DAILY EXECUTIVE BRIEFING PANEL (Main Feature) */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Today’s Daily Executive Briefing</h2>
                      <p className="text-xs text-slate-400">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExportReportsPDF}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Export as PDF Document"
                    >
                      <Download size={13} />
                      <span>PDF Brief</span>
                    </button>
                    <button
                      onClick={handleExportReportsExcel}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Export as Excel Spreadsheet"
                    >
                      <FileSpreadsheet size={13} />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => exportToCSV('daily_executive_briefing', reportsToday)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 lg:p-8 space-y-8">
                  {/* Briefing Highlights Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Work Summary */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                        <Briefcase size={16} />
                        <span>Field &amp; Technical Activity</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {reportsToday.length > 0
                          ? `${reportsToday.length} technical field report(s) submitted today across active hospital & client installations.`
                          : 'No field daily activity reports logged yet for today.'}
                      </p>
                    </div>

                    {/* Reported Problems & Urgent Field Matters */}
                    <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                        <AlertTriangle size={16} />
                        <span>Reported Field Problems</span>
                      </div>
                      <p className="text-xs text-rose-800 leading-relaxed">
                        {reportsToday.filter((r) => r.problems_encountered).length > 0
                          ? `${reportsToday.filter((r) => r.problems_encountered).length} engineer(s) reported equipment or site problems requiring attention.`
                          : 'No critical equipment problems or site delays reported today.'}
                      </p>
                    </div>

                    {/* Missing Daily Reports Alert List */}
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                          <Clock size={16} />
                          <span>Missing Reports ({missingReportEmployees.length})</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {missingReportEmployees.length === 0 ? (
                          <span className="text-xs text-emerald-700 font-semibold">
                            All active employees have submitted today&apos;s activity report!
                          </span>
                        ) : (
                          missingReportEmployees.slice(0, 4).map((emp) => (
                            <div key={emp.id} className="text-xs text-slate-700 font-medium flex items-center justify-between">
                              <span className="truncate">{emp.full_name}</span>
                              <span className="text-[10px] text-slate-500">{emp.department}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TODAY'S REPORTS DETAILED TABLE */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Today’s Submitted Activity Logs ({reportsToday.length})
                      </h3>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View All Reports Archive <ChevronRight size={14} />
                      </button>
                    </div>

                    {reportsToday.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                        No employee reports filed for today yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Employee</th>
                              <th className="px-4 py-3">Department</th>
                              <th className="px-4 py-3">Work Summary</th>
                              <th className="px-4 py-3">Equipment / Hospital</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {reportsToday.map((rep) => (
                              <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900">{rep.employee_name}</td>
                                <td className="px-4 py-3 text-slate-600">{rep.employee_code}</td>
                                <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{rep.work_summary}</td>
                                <td className="px-4 py-3 text-slate-600">{rep.client_hospital || rep.equipment_worked || '—'}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => setSelectedReport(rep)}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Full Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB: FINANCIAL HISHAB & BUDGET */}
          {activeTab === 'hishab' && (
            <FinancialHishabSection
              tadaClaims={tadaClaims}
              companyNotes={companyNotes}
              salesRecords={salesRecords}
              monthlyBudget={monthlyBudget}
              onUpdateBudget={handleUpdateBudget}
              currentMonthKey="2026-11"
            />
          )}

          {/* TAB: DOCTOR & MEDICAL CENTER SALES LEDGER */}
          {activeTab === 'sales' && (
            <DoctorSalesLedgerSection
              salesRecords={salesRecords}
              onAddSale={handleAddSale}
              onDeleteSale={handleDeleteSale}
              userName={execAccount?.full_name || 'Executive Desk'}
            />
          )}

          {/* TAB: CUSTOM EXCEL STUDIO & IN-PORTAL SPREADSHEET */}
          {activeTab === 'custom-excel' && (
            <CustomExcelPortalSection
              salesRecords={salesRecords}
              tadaClaims={tadaClaims}
              companyNotes={companyNotes}
              monthlyBudget={monthlyBudget}
              presets={customExcelPresets}
              onSavePreset={handleSaveCustomPreset}
              onDeletePreset={handleDeleteCustomPreset}
            />
          )}

          {/* TAB: BENGALI USER MANUAL (সহজ বাংলা নির্দেশিকা) */}
          {activeTab === 'manual' && <ExecutiveUserManualBangla />}

          {/* TAB 3: EMPLOYEE REPORTS BROWSER */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Employee Activity Reports Directory</h2>
                  <p className="text-xs text-slate-500">
                    Browse submitted work reports, equipment logs, and field activity records with date, week and month filters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportReportsPDF}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export all reports to PDF"
                  >
                    <Download size={14} />
                    <span>PDF Export</span>
                  </button>
                  <button
                    onClick={handleExportReportsExcel}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export all reports to Excel"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Excel Export</span>
                  </button>
                  <button
                    onClick={() => exportToCSV('all_employee_reports', dailyReports)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters Toolbar with Week/Month Selector */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => { setTimeFrame('all'); setDateFilter(''); }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        timeFrame === 'all' && !dateFilter ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      onClick={() => { setTimeFrame('today'); setDateFilter(todayStr); }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        timeFrame === 'today' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => { setTimeFrame('week'); setDateFilter(''); }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        timeFrame === 'week' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => { setTimeFrame('month'); setDateFilter(''); }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        timeFrame === 'month' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      This Month
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    Showing reports filtered by schedule &amp; department
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by employee name, ID, hospital, equipment, or summary..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer"
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                    >
                      <option value="All">All Departments</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    <select
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer"
                      value={execMonth}
                      onChange={(e) => setExecMonth(e.target.value)}
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
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer font-mono"
                      value={execYear}
                      onChange={(e) => setExecYear(e.target.value)}
                    >
                      <option value="All">All Years</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>

                    <input
                      type="date"
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none cursor-pointer font-mono"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        if (e.target.value) setTimeFrame('all');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Reports Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Report Date</th>
                        <th className="px-6 py-4">Work Summary &amp; Tasks</th>
                        <th className="px-6 py-4">Location &amp; Equipment</th>
                        <th className="px-6 py-4">Status &amp; Remarks</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dailyReports.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No employee daily reports found in registry.
                          </td>
                        </tr>
                      ) : (
                        dailyReports
                          .filter((rep) => {
                            const term = searchTerm.toLowerCase();
                            const matchesSearch =
                              rep.employee_name.toLowerCase().includes(term) ||
                              rep.work_summary.toLowerCase().includes(term) ||
                              rep.work_location.toLowerCase().includes(term) ||
                              rep.equipment_worked.toLowerCase().includes(term);

                            const [y, m] = (rep.report_date || '').split('-');
                            const matchesYear = execYear === 'All' || y === execYear;
                            const matchesMonth = execMonth === 'All' || m === execMonth;
                            const matchesDate = !dateFilter || rep.report_date === dateFilter;
                            const matchesTf = matchesTimeFrame(rep.report_date);

                            // Department match
                            const emp = employees.find((e) => e.id === rep.employee_id);
                            const matchesDept = deptFilter === 'All' || (emp && emp.department === deptFilter);

                            return matchesSearch && matchesYear && matchesMonth && matchesDate && matchesTf && matchesDept;
                          })
                          .map((rep) => (
                            <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{rep.employee_name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{rep.employee_code}</div>
                              </td>

                              <td className="px-6 py-4 font-mono text-slate-700">{rep.report_date}</td>

                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800 line-clamp-2 max-w-xs">{rep.work_summary}</div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-slate-700 font-medium">{rep.client_hospital || rep.work_location || '—'}</div>
                                <div className="text-[11px] text-slate-500 truncate max-w-xs">{rep.equipment_worked}</div>
                              </td>

                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                  {rep.status}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {rep.status !== 'approved' && (
                                    <button
                                      onClick={() => handleReviewReport(rep.id, 'approved', 'Approved by Executive')}
                                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                      title="Approve Report"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {rep.status !== 'correction_requested' && (
                                    <button
                                      onClick={() => handleReviewReport(rep.id, 'correction_requested', 'Correction requested by Executive')}
                                      className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                      title="Request Correction"
                                    >
                                      Request Correction
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setTargetReportForRemark(rep);
                                      setIsRemarkModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 cursor-pointer"
                                    title="Add Executive Remark"
                                  >
                                    <MessageSquare size={14} />
                                  </button>
                                  <button
                                    onClick={() => setSelectedReport(rep)}
                                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                                  >
                                    Inspect Report
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEE TA/DA CLAIMS & EXPENSES */}
          {activeTab === 'tada' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Employee TA/DA Claims &amp; Expense Oversight</h2>
                  <p className="text-xs text-slate-500">
                    Review employee travel allowance, daily allowance claims, receipts, and authorize payments.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportTaDaPDF}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export TA/DA Claims as PDF"
                  >
                    <Download size={14} />
                    <span>PDF Export</span>
                  </button>
                  <button
                    onClick={handleExportTaDaExcel}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export TA/DA Claims as Excel"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Excel Export</span>
                  </button>
                  <button
                    onClick={() => exportToCSV('tada_expense_claims', tadaClaims)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Claims summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Claims Value</span>
                  <div className="text-2xl font-black font-mono text-slate-900">
                    ৳{tadaClaims.reduce((acc, c) => acc + (c.total_amount || 0), 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Claims</span>
                  <div className="text-2xl font-black font-mono text-amber-600">
                    {tadaClaims.filter((c) => c.status === 'pending').length} Claims
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Disbursed (Paid)</span>
                  <div className="text-2xl font-black font-mono text-emerald-600">
                    ৳{tadaClaims.filter((c) => c.payment_status === 'paid').reduce((acc, c) => acc + (c.total_amount || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Claims table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Travel Dates &amp; Destination</th>
                        <th className="px-6 py-4">Expense Breakdown</th>
                        <th className="px-6 py-4">Total Amount</th>
                        <th className="px-6 py-4">Receipts / Bills</th>
                        <th className="px-6 py-4">Status &amp; Payment</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tadaClaims.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No employee TA/DA claims submitted yet.
                          </td>
                        </tr>
                      ) : (
                        tadaClaims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{claim.employee_name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{claim.employee_code}</div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800">{claim.destination}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {claim.start_date} to {claim.end_date}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-slate-700">
                              <div className="space-y-0.5 text-[11px]">
                                {claim.travel_allowance > 0 && <div>TA: ৳{claim.travel_allowance}</div>}
                                {claim.daily_allowance > 0 && <div>DA: ৳{claim.daily_allowance}</div>}
                                {claim.transport_expense > 0 && <div>Transport: ৳{claim.transport_expense}</div>}
                                {claim.accommodation_expense > 0 && <div>Hotel/Food: ৳{claim.accommodation_expense}</div>}
                              </div>
                            </td>

                            <td className="px-6 py-4 font-mono font-black text-slate-900 text-sm">
                              ৳{claim.total_amount?.toLocaleString()}
                            </td>

                            <td className="px-6 py-4">
                              {claim.receipt_urls && claim.receipt_urls.length > 0 ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {claim.receipt_urls.map((url, idx) => (
                                    url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                                        <img src={url} alt={`Receipt ${idx + 1}`} className="w-9 h-9 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                                      </a>
                                    ) : (
                                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                        <Paperclip size={12} />
                                        <span>Receipt #{idx + 1}</span>
                                      </a>
                                    )
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No receipts attached</span>
                              )}
                            </td>

                            <td className="px-6 py-4 space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                  claim.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : claim.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {claim.status}
                              </span>
                              <div>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                    claim.payment_status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {claim.payment_status === 'paid' ? 'DISBURSED (PAID)' : 'UNPAID'}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  {claim.status !== 'approved' && (
                                    <button
                                      onClick={() => handleReviewTaDaClaim(claim.id, 'approved', 'Approved by Executive')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {claim.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleReviewTaDaClaim(claim.id, 'rejected', 'Rejected by Executive')}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleToggleClaimPayment(claim.id, claim.payment_status)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] cursor-pointer"
                                >
                                  {claim.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Disbursed (Paid)'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMPANY NOTES & EXPENSE DIRECTIVES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Company Notes &amp; Expense Directives</h2>
                  <p className="text-xs text-slate-500">
                    Official management notes, corporate budget allocations, expense records, and internal policies.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportNotesPDF}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export Company Notes to PDF"
                  >
                    <Download size={14} />
                    <span>PDF Export</span>
                  </button>
                  <button
                    onClick={handleExportNotesExcel}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Export Company Notes to Excel"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Excel Export</span>
                  </button>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus size={15} />
                    <span>Add Company Note</span>
                  </button>
                </div>
              </div>

              {/* Notes Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Corporate Notes</span>
                  <div className="text-2xl font-black text-slate-900">{companyNotes.length}</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Expense Notes Logged</span>
                  <div className="text-2xl font-black font-mono text-amber-600">
                    ৳{companyNotes.filter((n) => n.category === 'expense').reduce((acc, n) => acc + (n.amount || 0), 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pinned Directives</span>
                  <div className="text-2xl font-black text-blue-600">
                    {companyNotes.filter((n) => n.is_pinned).length} Pinned
                  </div>
                </div>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyNotes.length === 0 ? (
                  <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-3">
                    <StickyNote size={36} className="text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No company notes or expense records added yet.</p>
                    <p className="text-slate-400 max-w-sm mx-auto">
                      Post operational directives, company-wide expense guidelines, or financial notices for board review.
                    </p>
                    <button
                      onClick={() => setIsNoteModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Write First Note</span>
                    </button>
                  </div>
                ) : (
                  companyNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                        note.is_pinned
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                note.category === 'expense'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : note.category === 'urgent'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : note.category === 'policy'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {note.category}
                            </span>
                            {note.amount && note.amount > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">
                                ৳{note.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{note.title}</h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleTogglePinNote(note.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              note.is_pinned ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            title={note.is_pinned ? 'Unpin' : 'Pin note'}
                          >
                            <Pin size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span className="font-semibold text-slate-600">
                          {note.author_name} ({note.author_role})
                        </span>
                        <span className="font-mono text-slate-400">{note.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: MANAGEMENT DECISIONS ENGINE */}
          {activeTab === 'decisions' && (
            <ManagementDecisionsSection
              decisions={decisions}
              onCreateDecision={async (newDec) => {
                if (!execAccount) return;
                const created = await createManagementDecision({
                  executive: execAccount,
                  title: newDec.title,
                  description: newDec.description,
                  target_department: newDec.target_department,
                  assigned_manager_name: newDec.assigned_manager_name,
                  priority: newDec.priority,
                  deadline: newDec.deadline,
                  remarks: newDec.remarks,
                });
                setDecisions([created, ...decisions]);
                triggerToast('Management decision issued and saved.');
              }}
              onUpdateStatus={handleUpdateDecisionStatus}
              onDeleteDecision={async (id) => {
                await deleteManagementDecision(id);
                setDecisions(decisions.filter((d) => d.id !== id));
                triggerToast('Management decision removed.');
              }}
              execAccount={execAccount}
              departments={DEPARTMENTS}
            />
          )}

          {/* TAB 5: REPORTS & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Executive Corporate Analytics</h2>
                  <p className="text-xs text-slate-500">
                    High-level financial and operational summary reports for board review.
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer size={15} />
                  <span>Print Board Report</span>
                </button>
              </div>

              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="text-emerald-600" size={18} />
                    <span>TA/DA Financial Expense Summary</span>
                  </h3>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-900">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700">
                      Total TA/DA Expense Claims
                    </span>
                    <span className="text-3xl font-black font-mono">
                      ৳{tadaClaims.reduce((acc, c) => acc + (c.total_amount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="text-blue-600" size={18} />
                    <span>Duty Completion Analytics</span>
                  </h3>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-900">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-700">
                      Total Technical Duties Assigned
                    </span>
                    <span className="text-3xl font-black font-mono">{assignedDuties.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ALERT CENTER */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Executive Alert Center</h2>
                <p className="text-xs text-slate-500">
                  Real-time alerts for unsubmitted daily reports, urgent technical issues, and delayed duties.
                </p>
              </div>

              <div className="space-y-4">
                {missingReportEmployees.map((emp) => (
                  <div key={emp.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Clock className="text-amber-600" size={18} />
                      <div>
                        <div className="font-bold">{emp.full_name} ({emp.employee_id})</div>
                        <div className="text-[11px] text-amber-700">Missing daily activity report for {todayStr}.</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-amber-200/60 px-2.5 py-1 rounded font-bold uppercase">
                      Report Pending
                    </span>
                  </div>
                ))}

                {missingReportEmployees.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                    No active executive alerts at this time. All reports and duties are operating smoothly.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: FULL REPORT INSPECTION */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 lg:p-8 space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Daily Activity Report: {selectedReport.employee_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedReport.employee_code} · Date: {selectedReport.report_date}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Work Summary</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed font-medium">
                    {selectedReport.work_summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Tasks Completed</span>
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed">{selectedReport.tasks_completed || '—'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Tasks Pending</span>
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed">{selectedReport.tasks_pending || '—'}</p>
                  </div>
                </div>

                {selectedReport.problems_encountered && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                    <span className="font-bold uppercase text-[10px] block text-rose-700">Problems Encountered</span>
                    <p className="mt-0.5">{selectedReport.problems_encountered}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CREATE MANAGEMENT DECISION */}
      <AnimatePresence>
        {isDecisionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 lg:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <Crown className="text-amber-600" size={22} />
                  <h3 className="text-base font-extrabold text-slate-900">Record Management Decision</h3>
                </div>
                <button onClick={() => setIsDecisionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateDecisionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Decision Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standardize Calibration Logs for Siemens MRI"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Directive Details *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detail the management directive and expected operational output..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                    value={newDecision.description}
                    onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Target Department</label>
                    <select
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                      value={newDecision.target_department}
                      onChange={(e) => setNewDecision({ ...newDecision, target_department: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Priority</label>
                    <select
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                      value={newDecision.priority}
                      onChange={(e) => setNewDecision({ ...newDecision, priority: e.target.value as DecisionPriority })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDecisionModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    Issue Directive
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ADD EXECUTIVE REMARK */}
      <AnimatePresence>
        {isRemarkModalOpen && targetReportForRemark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Executive Remark for {targetReportForRemark.employee_name}
                </h3>
                <button onClick={() => setIsRemarkModalOpen(false)} className="p-1 text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddRemarkSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Remark / Directive Notes *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter management guidance or request..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFlagUrgent}
                    onChange={(e) => setIsFlagUrgent(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600"
                  />
                  <span className="font-bold text-rose-700">Flag report as urgent for management review</span>
                </label>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRemarkModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    Save Executive Remark
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CREATE COMPANY NOTE / EXPENSE RECORD */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 lg:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <StickyNote className="text-blue-700" size={22} />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Add Company Note / Expense Directive</h3>
                    <p className="text-xs text-slate-500">Record corporate guidelines, budget decisions, or operational notices.</p>
                  </div>
                </div>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateNoteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Note Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Technical Field Travel Allowance Budget Approval"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none cursor-pointer"
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value as NoteCategory })}
                    >
                      <option value="expense">Expense &amp; Finance</option>
                      <option value="policy">Company Policy</option>
                      <option value="operational">Operational Note</option>
                      <option value="urgent">Urgent Matter</option>
                      <option value="general">General Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount / Budget (BDT, Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono outline-none focus:border-blue-600"
                      value={newNote.amount}
                      onChange={(e) => setNewNote({ ...newNote, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Content &amp; Directives *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write details, expense parameters, authorized expenditures, or guidelines..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 leading-relaxed"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={newNote.is_pinned}
                    onChange={(e) => setNewNote({ ...newNote, is_pinned: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Pin this note to top for all executives</span>
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Save Company Note
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
