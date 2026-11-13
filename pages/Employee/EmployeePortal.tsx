import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Building2,
  Phone,
  User,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  Loader2,
  X,
  ExternalLink,
  Camera,
  MapPin,
  ClipboardList,
  Sparkles,
  Briefcase,
  Receipt,
} from 'lucide-react';
import {
  Employee,
  EmployeeDuty,
  EmployeeTask,
  DailyServiceReport,
  EmployeeWorkspaceData,
  AssignedDuty,
  ProfileUpdateRequest,
} from '../../types';
import {
  getCurrentEmployeeSession,
  getEmployeeWorkspaceData,
  toggleDutyStatus,
  addEmployeeDuty,
  toggleTaskStatus,
  addEmployeeTask,
  deleteEmployeeTask,
  addDailyServiceReport,
  updateEmployeeProfilePhoto,
} from '../../services/employeePortalService';
import { fetchDutiesForEmployee } from '../../services/dutyService';
import { fetchRequestsForEmployee } from '../../services/profileRequestService';
import { AVAILABLE_MODULES } from '../../services/employeeService';
import { performSignOut } from '../../supabaseClient';
import { AssignedDutiesSection } from './AssignedDutiesSection';
import { EmployeeProfileSection } from './EmployeeProfileSection';
import { DailyWorkReportSection } from './DailyWorkReportSection';
import { TaDaExpenseSection } from './TaDaExpenseSection';
import { NotificationCenter } from '../../components/common/NotificationCenter';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';

export const EmployeePortal: React.FC = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [workspace, setWorkspace] = useState<EmployeeWorkspaceData | null>(null);
  const [assignedDuties, setAssignedDuties] = useState<AssignedDuty[]>([]);
  const [myProfileRequests, setMyProfileRequests] = useState<ProfileUpdateRequest[]>([]);
  const [portalView, setPortalView] = useState<'workspace' | 'reports' | 'tada' | 'profile'>('workspace');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile menu state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [isAddDutyOpen, setIsAddDutyOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Form states
  const [newDuty, setNewDuty] = useState({
    title: '',
    time: '10:00 AM',
    location: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Diagnostic',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'normal' as 'low' | 'normal' | 'high',
  });

  const [newReport, setNewReport] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    equipment_client: '',
    summary: '',
    hours_logged: 7.0,
    status: 'submitted' as 'draft' | 'submitted',
  });

  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPortalData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { session, employee: emp } = await getCurrentEmployeeSession();
      if (!session || !emp) {
        navigate('/login', { replace: true });
        return;
      }
      setEmployee(emp);

      const [data, dutiesData, requestsData] = await Promise.all([
        getEmployeeWorkspaceData(emp.id, emp),
        fetchDutiesForEmployee(emp.id).catch(() => []),
        fetchRequestsForEmployee(emp.id).catch(() => []),
      ]);

      setWorkspace(data);
      setAssignedDuties(dutiesData);
      setMyProfileRequests(requestsData);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize employee portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const triggerToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Duties handlers
  const handleToggleDuty = async (dutyId: string) => {
    if (!employee) return;
    try {
      const updated = await toggleDutyStatus(employee, dutyId);
      setWorkspace(updated);
      triggerToast('Duty status updated');
    } catch (err: any) {
      alert(err?.message || 'Failed to update duty');
    }
  };

  const handleCreateDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !newDuty.title.trim()) return;
    try {
      const updated = await addEmployeeDuty(employee, {
        title: newDuty.title.trim(),
        time: newDuty.time.trim(),
        location: newDuty.location.trim(),
        priority: newDuty.priority,
      });
      setWorkspace(updated);
      setIsAddDutyOpen(false);
      setNewDuty({ title: '', time: '10:00 AM', location: '', priority: 'medium' });
      triggerToast('Added duty to today’s schedule');
    } catch (err: any) {
      alert(err?.message || 'Failed to add duty');
    }
  };

  // Tasks handlers
  const handleToggleTask = async (taskId: string) => {
    if (!employee) return;
    try {
      const updated = await toggleTaskStatus(employee, taskId);
      setWorkspace(updated);
      triggerToast('Task status updated');
    } catch (err: any) {
      alert(err?.message || 'Failed to update task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !newTask.title.trim()) return;
    try {
      const updated = await addEmployeeTask(employee, {
        title: newTask.title.trim(),
        category: newTask.category.trim() || 'General',
        due_date: newTask.due_date,
        priority: newTask.priority,
      });
      setWorkspace(updated);
      setIsAddTaskOpen(false);
      setNewTask({
        title: '',
        category: 'Diagnostic',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'normal',
      });
      triggerToast('Task registered');
    } catch (err: any) {
      alert(err?.message || 'Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!employee) return;
    try {
      const updated = await deleteEmployeeTask(employee, taskId);
      setWorkspace(updated);
      triggerToast('Task removed');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete task');
    }
  };

  // Report handler
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !newReport.title.trim() || !newReport.summary.trim()) return;
    try {
      const updated = await addDailyServiceReport(employee, {
        title: newReport.title.trim(),
        date: newReport.date,
        equipment_client: newReport.equipment_client.trim(),
        summary: newReport.summary.trim(),
        hours_logged: Number(newReport.hours_logged) || 0,
        status: newReport.status,
      });
      setWorkspace(updated);
      setIsAddReportOpen(false);
      setNewReport({
        title: '',
        date: new Date().toISOString().split('T')[0],
        equipment_client: '',
        summary: '',
        hours_logged: 7.0,
        status: 'submitted',
      });
      triggerToast('Daily service report recorded');
    } catch (err: any) {
      alert(err?.message || 'Failed to submit report');
    }
  };

  // Profile photo update
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !photoUrlInput.trim()) return;
    try {
      const updated = await updateEmployeeProfilePhoto(employee.id, photoUrlInput.trim());
      setEmployee(updated);
      setIsPhotoModalOpen(false);
      triggerToast('Profile photo updated');
    } catch (err: any) {
      alert(err?.message || 'Failed to update photo');
    }
  };

  const handleLogout = async () => {
    await performSignOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d14] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
        <span className="text-xs font-semibold tracking-wide">Connecting to Employee Terminal...</span>
      </div>
    );
  }

  if (errorMsg || !employee) {
    return (
      <div className="min-h-screen bg-[#090d14] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0e1420] border border-rose-500/30 rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="text-rose-400 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-white">Access Notification</h2>
          <p className="text-xs text-rose-300 leading-relaxed">
            {errorMsg || 'Unable to load employee credentials. Please sign in again.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Filter allowed modules
  const allowedModules = AVAILABLE_MODULES.filter((m) =>
    (employee.accessible_modules || []).includes(m.id)
  );

  const pendingTasks = (workspace?.tasks || []).filter((t) => t.status === 'pending');
  const completedTasks = (workspace?.tasks || []).filter((t) => t.status === 'completed');
  const duties = workspace?.duties || [];
  const completedDutiesCount = duties.filter((d) => d.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-200 antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. TOP BAR (Minimalistic corporate contract) */}
      <header className="sticky top-0 z-40 bg-[#0e1422]/90 backdrop-blur-md border-b border-[#1c2638] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block leading-tight">
              Carelink Healthineers
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Technical Staff Portal
            </span>
          </div>
        </div>

        {/* Profile Menu & Notifications Zone */}
        <div className="flex items-center gap-2.5 sm:gap-3 relative" ref={profileMenuRef}>
          {actionSuccess && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium">
              <Check size={12} />
              <span>{actionSuccess}</span>
            </div>
          )}

          <PWAInstallButton theme="dark" />

          <NotificationCenter
            viewerRole="employee"
            viewerId={`emp_${employee.id}`}
            employeeId={employee.id}
            actorName={employee.full_name}
            theme="dark"
            onNavigate={(linkTab) => {
              if (linkTab === 'tada') setPortalView('tada');
              else if (linkTab === 'reports') setPortalView('reports');
              else if (linkTab === 'profile') setPortalView('profile');
              else setPortalView('workspace');
            }}
          />

          {/* Profile Trigger Button */}
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer text-left"
          >
            {/* Avatar */}
            {employee.profile_picture ? (
              <img
                src={employee.profile_picture}
                alt={employee.full_name}
                className="w-8 h-8 rounded-lg object-cover border border-blue-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center justify-center shrink-0">
                {employee.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white truncate max-w-[130px] leading-tight">
                {employee.full_name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-tight">
                {employee.employee_id}
              </div>
            </div>

            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-72 bg-[#0e1422] border border-[#232f45] rounded-2xl shadow-2xl p-4 space-y-3 z-50 text-xs"
              >
                {/* Employee Card Details */}
                <div className="pb-3 border-b border-white/10 space-y-1">
                  <div className="font-bold text-white text-sm">{employee.full_name}</div>
                  <div className="text-[11px] text-blue-400 font-medium">
                    {employee.designation}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Building2 size={11} />
                    <span>{employee.department}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: <span className="text-slate-200">{employee.employee_id}</span> · User:{' '}
                    <span className="text-slate-200">{employee.username}</span>
                  </div>
                </div>

                {/* Quick Profile Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPortalView('workspace');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                      portalView === 'workspace' ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Briefcase size={14} className="text-blue-400" />
                    <span>Assigned Duties &amp; Ops</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPortalView('reports');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                      portalView === 'reports' ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText size={14} className="text-blue-400" />
                    <span>Daily Activity Report</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPortalView('tada');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                      portalView === 'tada' ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Receipt size={14} className="text-blue-400" />
                    <span>TA/DA &amp; Expense Claims</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPortalView('profile');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                      portalView === 'profile' ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <User size={14} className="text-blue-400" />
                    <span>My Profile &amp; Credentials</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setPhotoUrlInput(employee.profile_picture || '');
                      setIsPhotoModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Camera size={14} className="text-blue-400" />
                    <span>Update Profile Picture</span>
                  </button>

                  <Link
                    to="/"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>Public Catalog &amp; Website</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. MAIN DASHBOARD CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* A. Identity Banner */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0e1422] border border-[#1c2638] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Profile Picture */}
            <div className="relative group shrink-0">
              {employee.profile_picture ? (
                <img
                  src={employee.profile_picture}
                  alt={employee.full_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500/40 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-sky-600 text-white font-bold text-xl sm:text-2xl flex items-center justify-center border border-white/10 shadow-lg">
                  {employee.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
              )}
              <button
                onClick={() => {
                  setPhotoUrlInput(employee.profile_picture || '');
                  setIsPhotoModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 p-1.5 bg-[#0e1422] border border-white/20 text-slate-300 hover:text-white rounded-lg shadow cursor-pointer"
                title="Change Photo"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Name, Designation, ID */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {employee.full_name}
                </h1>
                <span className="text-[11px] font-mono text-slate-400">
                  ({employee.employee_id})
                </span>
              </div>

              {/* Unboxed Metadata Line with typographic separators */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-blue-400 font-semibold">{employee.designation}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{employee.department}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300 font-medium">{employee.role}</span>
              </div>

              {employee.phone_number && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <Phone size={12} />
                  <span>{employee.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Date Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8 gap-2 shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Today’s Date
              </span>
              <span className="text-xs font-semibold text-white">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Duties Progress
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {completedDutiesCount} / {duties.length} Complete
              </span>
            </div>
          </div>
        </section>

        {/* Navigation Switcher Bar */}
        <div className="flex items-center gap-2 border-b border-[#1c2638] pb-3 overflow-x-auto">
          <button
            onClick={() => setPortalView('workspace')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalView === 'workspace'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-[#0e1422] text-slate-400 hover:text-white border border-[#1c2638]'
            }`}
          >
            <Briefcase size={15} />
            <span>Assigned Duties &amp; Ops</span>
            {assignedDuties.filter((d) => d.status !== 'completed').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {assignedDuties.filter((d) => d.status !== 'completed').length} Active
              </span>
            )}
          </button>

          <button
            onClick={() => setPortalView('reports')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalView === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-[#0e1422] text-slate-400 hover:text-white border border-[#1c2638]'
            }`}
          >
            <FileText size={15} />
            <span>Daily Work Report</span>
          </button>

          <button
            onClick={() => setPortalView('tada')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalView === 'tada'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-[#0e1422] text-slate-400 hover:text-white border border-[#1c2638]'
            }`}
          >
            <Receipt size={15} />
            <span>TA/DA &amp; Expenses</span>
          </button>

          <button
            onClick={() => setPortalView('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalView === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-[#0e1422] text-slate-400 hover:text-white border border-[#1c2638]'
            }`}
          >
            <User size={15} />
            <span>My Profile &amp; Credentials</span>
            {myProfileRequests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {myProfileRequests.filter((r) => r.status === 'pending').length} Requested
              </span>
            )}
          </button>
        </div>

        {portalView === 'profile' ? (
          <EmployeeProfileSection
            employee={employee}
            myRequests={myProfileRequests}
            onRefreshPortal={loadPortalData}
            onToast={triggerToast}
          />
        ) : portalView === 'reports' ? (
          <DailyWorkReportSection employee={employee} onToast={triggerToast} />
        ) : portalView === 'tada' ? (
          <TaDaExpenseSection employee={employee} onToast={triggerToast} />
        ) : (
          <div className="space-y-8">
            {/* Phase 04 Admin Assigned Duties Section */}
            <AssignedDutiesSection
              employee={employee}
              duties={assignedDuties}
              onRefreshDuties={loadPortalData}
              onToast={triggerToast}
            />

            {/* B. 2-COLUMN OPERATIONAL DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Today's Duties & Tasks */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. TODAY'S DUTIES */}
            <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-blue-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Today’s Duties</h2>
                  <span className="text-xs font-mono text-slate-400">
                    ({duties.length})
                  </span>
                </div>

                <button
                  onClick={() => setIsAddDutyOpen(true)}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Duty</span>
                </button>
              </div>

              {duties.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No scheduled duties recorded for today. Click &quot;Add Duty&quot; to log a shift requirement.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {duties.map((duty) => {
                    const isDone = duty.status === 'completed';
                    return (
                      <div
                        key={duty.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          isDone
                            ? 'bg-black/20 border-white/5 opacity-75'
                            : 'bg-white/[0.02] border-white/10 hover:border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            onClick={() => handleToggleDuty(duty.id)}
                            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              isDone
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'border-slate-600 hover:border-slate-400'
                            }`}
                            title={isDone ? 'Mark Pending' : 'Mark Completed'}
                          >
                            {isDone && <Check size={12} />}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <span
                              className={`text-xs font-semibold block leading-snug ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {duty.title}
                            </span>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              {duty.time && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock size={11} className="text-slate-500" /> {duty.time}
                                </span>
                              )}
                              {duty.location && (
                                <>
                                  <span aria-hidden="true" className="text-slate-600">·</span>
                                  <span className="flex items-center gap-1 truncate max-w-xs">
                                    <MapPin size={11} className="text-slate-500" /> {duty.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            isDone ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {isDone ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 2. PENDING TASKS */}
            <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <ClipboardList size={16} className="text-blue-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Pending Tasks</h2>
                  <span className="text-xs font-mono text-slate-400">
                    ({pendingTasks.length})
                  </span>
                </div>

                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Task</span>
                </button>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  All assigned technical tasks have been completed.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-blue-500/30 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-100 leading-snug">
                          {task.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-slate-300 font-medium">{task.category}</span>
                          {task.due_date && (
                            <>
                              <span aria-hidden="true" className="text-slate-600">·</span>
                              <span className="font-mono">Due: {task.due_date}</span>
                            </>
                          )}
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span
                            className={`font-semibold capitalize ${
                              task.priority === 'high'
                                ? 'text-rose-400'
                                : task.priority === 'low'
                                ? 'text-slate-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {task.priority} priority
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                          title="Mark as Completed"
                        >
                          <Check size={12} />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. COMPLETED TASKS TOGGLE */}
              {completedTasks.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                    className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {showCompletedTasks ? 'Hide' : 'Show'} Completed Tasks ({completedTasks.length})
                    </span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${showCompletedTasks ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showCompletedTasks && (
                    <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between gap-3 text-xs opacity-75"
                        >
                          <div className="min-w-0">
                            <span className="line-through text-slate-400 block truncate">
                              {task.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Completed{' '}
                              {task.completed_at
                                ? new Date(task.completed_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer shrink-0"
                          >
                            Reopen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Quick Actions & Recent Daily Reports */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <section className="p-6 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5">
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setIsAddReportOpen(true)}
                  className="w-full p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} />
                    <span>File Daily Service Report</span>
                  </div>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => setIsAddDutyOpen(true)}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 font-medium text-xs flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-blue-400" />
                    <span>Schedule Today&apos;s Duty</span>
                  </div>
                  <Plus size={14} />
                </button>

                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 font-medium text-xs flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList size={15} className="text-blue-400" />
                    <span>Add Technical Task</span>
                  </div>
                  <Plus size={14} />
                </button>
              </div>
            </section>

            {/* Recent Daily Reports */}
            <section className="p-6 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">Recent Daily Reports</h3>
                </div>
                <button
                  onClick={() => setIsAddReportOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  + New
                </button>
              </div>

              {(workspace?.reports || []).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No service reports submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {(workspace?.reports || []).map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white leading-tight">
                          {rep.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            rep.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {rep.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span className="font-mono">{rep.date}</span>
                        {rep.hours_logged > 0 && (
                          <span className="font-mono text-slate-300">
                            {rep.hours_logged} hrs logged
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
      )}
      </main>

      {/* MODAL 1: ADD DUTY */}
      <AnimatePresence>
        {isAddDutyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Schedule Today’s Duty</h3>
                <button
                  onClick={() => setIsAddDutyOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateDuty} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Duty Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suction Motor Preventive Maintenance"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                    value={newDuty.title}
                    onChange={(e) => setNewDuty({ ...newDuty, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 02:30 PM"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={newDuty.time}
                      onChange={(e) => setNewDuty({ ...newDuty, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                      value={newDuty.priority}
                      onChange={(e) =>
                        setNewDuty({ ...newDuty, priority: e.target.value as any })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Location / Client</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Central Hospital Radiology Bay 1"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                    value={newDuty.location}
                    onChange={(e) => setNewDuty({ ...newDuty, location: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddDutyOpen(false)}
                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Save Duty
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD TASK */}
      <AnimatePresence>
        {isAddTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Add Technical Task</h3>
                <button
                  onClick={() => setIsAddTaskOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calibrate optical sensor gain on VistaPano unit"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Diagnostic"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'normal', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        className={`py-2 rounded-xl text-xs font-semibold uppercase transition-colors cursor-pointer ${
                          newTask.priority === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/30 border border-white/5 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(false)}
                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SUBMIT DAILY REPORT */}
      <AnimatePresence>
        {isAddReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Submit Daily Service Report</h3>
                <button
                  onClick={() => setIsAddReportOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Report Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Field Inspection & Radiation Leakage Survey"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital / Equipment</label>
                    <input
                      type="text"
                      placeholder="e.g. Square Hospital ICU Unit 4"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                      value={newReport.equipment_client}
                      onChange={(e) =>
                        setNewReport({ ...newReport, equipment_client: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hours Logged</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                      value={newReport.hours_logged}
                      onChange={(e) =>
                        setNewReport({ ...newReport, hours_logged: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Work Summary &amp; Findings *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe diagnostics conducted, replacement parts installed, calibration readings, and system status..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={newReport.summary}
                    onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddReportOpen(false)}
                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: PROFILE PHOTO */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Update Profile Picture</h3>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Choose Picture File from Device
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-black/40 p-2 rounded-2xl border border-[#232f45]"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setPhotoUrlInput(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {photoUrlInput && (
                    <div className="text-center space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 block font-semibold">Photo Preview:</span>
                      <img
                        src={photoUrlInput}
                        alt="Preview"
                        className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-blue-500/50 shadow-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="px-3.5 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!photoUrlInput}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                  >
                    Save Photo
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
