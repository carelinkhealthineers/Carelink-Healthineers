import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Users,
  Search,
  RefreshCw,
  Shield,
  Key,
  Wrench,
  UserCheck,
  UserX,
  AlertOctagon,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Building2,
  Phone,
  Calendar,
  Lock,
  Layers,
  Edit2,
  Trash2,
  ShieldAlert,
  ArrowRight,
  Info,
  Briefcase,
  Inbox,
  MapPin,
  FileText,
  Receipt,
  Crown,
} from 'lucide-react';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
} from '../../types';
import {
  fetchEmployees,
  createEmployeeAccount,
  updateEmployeeAccount,
  setEmployeeStatus,
  deleteEmployeeAccount,
  generateSecurePassword,
  getCanonicalAuthEmail,
  AVAILABLE_MODULES,
  DEPARTMENTS,
  CreateEmployeeInput,
} from '../../services/employeeService';
import { fetchAssignedDuties } from '../../services/dutyService';
import { fetchProfileUpdateRequests } from '../../services/profileRequestService';
import { DutyManagementTab } from './DutyManagementTab';
import { ProfileRequestsTab } from './ProfileRequestsTab';
import { DailyReportsTab } from './DailyReportsTab';
import { TaDaManagementTab } from './TaDaManagementTab';
import { ExecutiveManagementTab } from './ExecutiveManagementTab';

export const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'duties' | 'requests' | 'reports' | 'tada' | 'executives'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | EmployeeRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | EmployeeStatus>('All');
  const [dutiesCount, setDutiesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [credentialsNotice, setCredentialsNotice] = useState<{
    employee: Employee;
    initialPassword?: string;
  } | null>(null);

  // Form State for Creation / Editing
  const [formData, setFormData] = useState<{
    full_name: string;
    employee_id: string;
    username: string;
    password: string;
    designation: string;
    department: string;
    phone_number: string;
    joining_date: string;
    address: string;
    emergency_contact: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    accessible_modules: string[];
  }>({
    full_name: '',
    employee_id: '',
    username: '',
    password: '',
    designation: '',
    department: DEPARTMENTS[0],
    phone_number: '',
    joining_date: new Date().toISOString().split('T')[0],
    address: '',
    emergency_contact: '',
    role: 'Engineer',
    status: 'active',
    accessible_modules: ['products', 'inquiries'],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, dutiesData, requestsData] = await Promise.all([
        fetchEmployees(),
        fetchAssignedDuties().catch(() => []),
        fetchProfileUpdateRequests().catch(() => []),
      ]);
      setEmployees(empData);
      setDutiesCount(dutiesData.length);
      setPendingRequestsCount(requestsData.filter((r) => r.status === 'pending').length);
    } catch (err: any) {
      console.error('Failed to load employee management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    const nextSeq = String(employees.length + 1).padStart(3, '0');
    setFormData({
      full_name: '',
      employee_id: `ENG-2026-${nextSeq}`,
      username: '',
      password: generateSecurePassword(14),
      designation: 'Biomedical Support Engineer',
      department: DEPARTMENTS[0],
      phone_number: '',
      joining_date: new Date().toISOString().split('T')[0],
      address: '',
      emergency_contact: '',
      role: 'Engineer',
      status: 'active',
      accessible_modules: ['products', 'inquiries', 'divisions'],
    });
    setFormError(null);
    setShowPassword(false);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      full_name: emp.full_name,
      employee_id: emp.employee_id,
      username: emp.username,
      password: '',
      designation: emp.designation,
      department: emp.department,
      phone_number: emp.phone_number || '',
      joining_date: emp.joining_date || new Date().toISOString().split('T')[0],
      address: emp.address || '',
      emergency_contact: emp.emergency_contact || '',
      role: emp.role,
      status: emp.status,
      accessible_modules: emp.accessible_modules || [],
    });
    setFormError(null);
  };

  const handleGeneratePassword = () => {
    const pwd = generateSecurePassword(14);
    setFormData((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const handleGenerateId = (role: EmployeeRole) => {
    const prefix = role === 'Engineer' ? 'ENG' : role === 'Technician' ? 'TECH' : 'EMP';
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({
      ...prev,
      employee_id: `${prefix}-2026-${rand}`,
    }));
  };

  const handleToggleModule = (moduleId: string) => {
    setFormData((prev) => {
      const current = prev.accessible_modules;
      if (current.includes(moduleId)) {
        return {
          ...prev,
          accessible_modules: current.filter((m) => m !== moduleId),
        };
      } else {
        return {
          ...prev,
          accessible_modules: [...current, moduleId],
        };
      }
    });
  };

  const applyModulePreset = (preset: 'all' | 'engineer' | 'technician' | 'clear') => {
    if (preset === 'all') {
      setFormData((prev) => ({
        ...prev,
        accessible_modules: AVAILABLE_MODULES.map((m) => m.id),
      }));
    } else if (preset === 'engineer') {
      setFormData((prev) => ({
        ...prev,
        accessible_modules: ['products', 'inquiries', 'divisions', 'editorial'],
      }));
    } else if (preset === 'technician') {
      setFormData((prev) => ({
        ...prev,
        accessible_modules: ['products', 'inquiries'],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        accessible_modules: [],
      }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const input: CreateEmployeeInput = {
        full_name: formData.full_name,
        employee_id: formData.employee_id,
        username: formData.username,
        password: formData.password,
        designation: formData.designation,
        department: formData.department,
        phone_number: formData.phone_number,
        joining_date: formData.joining_date,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        role: formData.role,
        status: formData.status,
        accessible_modules: formData.accessible_modules,
      };

      const result = await createEmployeeAccount(input);
      setIsCreateModalOpen(false);
      setCredentialsNotice({
        employee: result.employee,
        initialPassword: result.initialPassword,
      });
      setSuccessToast(`Account created for ${result.employee.full_name}`);
      setTimeout(() => setSuccessToast(null), 4000);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create employee account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      await updateEmployeeAccount(editingEmployee.id, {
        full_name: formData.full_name,
        employee_id: formData.employee_id,
        designation: formData.designation,
        department: formData.department,
        phone_number: formData.phone_number,
        joining_date: formData.joining_date,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        role: formData.role,
        status: formData.status,
        accessible_modules: formData.accessible_modules,
      });

      setEditingEmployee(null);
      setSuccessToast(`Account updated for ${formData.full_name}`);
      setTimeout(() => setSuccessToast(null), 3000);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update employee account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (employee: Employee, newStatus: EmployeeStatus) => {
    try {
      await setEmployeeStatus(employee.id, newStatus);
      setSuccessToast(`${employee.full_name} status set to ${newStatus.toUpperCase()}`);
      setTimeout(() => setSuccessToast(null), 3000);
      await loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err?.message}`);
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to remove ${employee.full_name} (${employee.username})?`)) {
      return;
    }
    try {
      await deleteEmployeeAccount(employee.id);
      setSuccessToast(`Removed account for ${employee.full_name}`);
      setTimeout(() => setSuccessToast(null), 3000);
      await loadData();
    } catch (err: any) {
      alert(`Deletion failed: ${err?.message}`);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered List
  const filtered = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      emp.full_name.toLowerCase().includes(term) ||
      emp.username.toLowerCase().includes(term) ||
      emp.employee_id.toLowerCase().includes(term) ||
      emp.designation.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term);

    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const countEngineers = employees.filter((e) => e.role === 'Engineer').length;
  const countTechnicians = employees.filter((e) => e.role === 'Technician').length;
  const countActive = employees.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header Card */}
      <header className="p-6 lg:p-8 rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Employee Accounts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 01 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, configure, and manage engineer and staff credentials securely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span>{successToast}</span>
            </motion.div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh Registry"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-400' : ''} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1d2436] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'employees'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
          }`}
        >
          <Users size={15} />
          <span>Staff Accounts ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('duties')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'duties'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
          }`}
        >
          <Briefcase size={15} />
          <span>Duty &amp; Task Assignments ({dutiesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
          }`}
        >
          <Inbox size={15} />
          <span>Profile Update Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
          }`}
        >
          <FileText size={15} />
          <span>Daily Activity Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('tada')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'tada'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-[#0d111a] text-slate-400 hover:text-white border border-[#1d2436]'
          }`}
        >
          <Receipt size={15} />
          <span>TA/DA &amp; Expenses</span>
        </button>

        <button
          onClick={() => setActiveTab('executives')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'executives'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/25'
              : 'bg-[#0d111a] text-amber-400 hover:text-amber-300 border border-amber-500/30'
          }`}
        >
          <Crown size={15} />
          <span>Executive Accounts (Phase 09)</span>
        </button>
      </div>

      {activeTab === 'duties' && (
        <DutyManagementTab employees={employees} onRefreshData={loadData} />
      )}

      {activeTab === 'requests' && (
        <ProfileRequestsTab onRefreshEmployees={loadData} />
      )}

      {activeTab === 'reports' && (
        <DailyReportsTab employees={employees} onRefreshData={loadData} />
      )}

      {activeTab === 'tada' && (
        <TaDaManagementTab employees={employees} onRefreshData={loadData} />
      )}

      {activeTab === 'executives' && <ExecutiveManagementTab />}

      {activeTab === 'employees' && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="p-4 lg:p-5 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Accounts
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {employees.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Users size={18} />
          </div>
        </div>

        <div className="p-4 lg:p-5 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Engineers
            </span>
            <span className="text-2xl font-black text-sky-400 mt-1 block">
              {countEngineers}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Wrench size={18} />
          </div>
        </div>

        <div className="p-4 lg:p-5 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Technicians
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {countTechnicians}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Key size={18} />
          </div>
        </div>

        <div className="p-4 lg:p-5 rounded-2xl bg-[#0d111a] border border-[#1d2436] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Status
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {countActive}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <UserCheck size={18} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, username (ashik@engnr), ID, or department..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
            {(['All', 'Engineer', 'Technician', 'Employee'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
            {(['All', 'active', 'inactive', 'suspended'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#07090e]/60 border-b border-[#1d2436] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Engineer / Employee</th>
                <th className="px-6 py-4">Credentials</th>
                <th className="px-6 py-4">Role &amp; Status</th>
                <th className="px-6 py-4">Module Access</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d2436]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
                    <span>Loading employee registry...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
                        <UserPlus size={22} />
                      </div>
                      <p className="text-sm font-bold text-white">No accounts found</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {employees.length === 0
                          ? 'No engineer or employee accounts have been created yet. Click "Create Account" above to initialize your first team member.'
                          : 'No employees matched your search query or active filter.'}
                      </p>
                      {employees.length === 0 && (
                        <button
                          onClick={openCreateModal}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          + Create First Account
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 border ${
                            emp.role === 'Engineer'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : emp.role === 'Technician'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                          }`}
                        >
                          {emp.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || 'EM'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">
                            {emp.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {emp.designation}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 size={10} />
                            <span>{emp.department}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ID & Username */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                            {emp.username}
                          </span>
                          <button
                            onClick={() => copyToClipboard(emp.username, `user_${emp.id}`)}
                            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                            title="Copy username"
                          >
                            {copiedKey === `user_${emp.id}` ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: <span className="text-slate-300 font-bold">{emp.employee_id}</span>
                        </div>
                        {emp.phone_number && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Phone size={10} /> {emp.phone_number}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            emp.role === 'Engineer'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : emp.role === 'Technician'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {emp.role}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              emp.status === 'active'
                                ? 'bg-emerald-400 animate-pulse'
                                : emp.status === 'inactive'
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Module Access */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(emp.accessible_modules || []).slice(0, 3).map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[9px] font-bold text-slate-300 capitalize"
                          >
                            {m}
                          </span>
                        ))}
                        {(emp.accessible_modules || []).length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20">
                            +{emp.accessible_modules.length - 3} more
                          </span>
                        )}
                        {(!emp.accessible_modules || emp.accessible_modules.length === 0) && (
                          <span className="text-[10px] text-slate-500 italic">No modules</span>
                        )}
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{emp.joining_date || '—'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Status Dropdown / Action */}
                        {emp.status !== 'active' ? (
                          <button
                            onClick={() => handleStatusChange(emp, 'active')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                            title="Activate Account"
                          >
                            <UserCheck size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(emp, 'inactive')}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                            title="Deactivate Account"
                          >
                            <UserX size={14} />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleStatusChange(
                              emp,
                              emp.status === 'suspended' ? 'active' : 'suspended'
                            )
                          }
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            emp.status === 'suspended'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-white/[0.04] text-slate-400 hover:text-rose-400 border-white/5'
                          }`}
                          title={emp.status === 'suspended' ? 'Unsuspend' : 'Suspend Account'}
                        >
                          <AlertOctagon size={14} />
                        </button>

                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-[#21293d] transition-all cursor-pointer"
                          title="Edit Details & Modules"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
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
      </>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-[#0d111a] border border-[#222b3d] rounded-[2rem] shadow-2xl p-6 lg:p-8 space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Create Employee Account</h3>
                    <p className="text-xs text-slate-400">
                      Issue secure access credentials for engineers and technical staff.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                {/* 1. Basic Identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Ashikur Rahman"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Employee ID *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGenerateId(formData.role)}
                        className="text-[9px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={10} /> Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ENG-2026-001"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all uppercase"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                {/* 2. Credentials: Username & Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Username (Login Handle) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ashik@engnr"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs font-mono text-sky-400 placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    />
                    {formData.username && (
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        Mapped Auth: {getCanonicalAuthEmail(formData.username)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Initial Password *
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[9px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={10} /> Generate Secure
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Secure Password (min. 6 chars)"
                        className="w-full pl-4 pr-10 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Designation & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biomedical Systems Engineer"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Department *
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Phone & Joining Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +880 1712-345678"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. Address & Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. House 14, Road 7, Dhanmondi, Dhaka"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. K. Rahman (Brother) - +880 1819-000000"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. Role Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assign Role *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Engineer', 'Technician', 'Employee'] as const).map((r) => {
                      const isSel = formData.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, role: r }));
                            handleGenerateId(r);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20'
                              : 'bg-[#07090e] border-[#222b3d] text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs">{r}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {r === 'Engineer'
                              ? 'Technical & Machinery'
                              : r === 'Technician'
                              ? 'Field Diagnostics'
                              : 'Standard Staff'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Module Access Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Module Access Permissions
                      </label>
                      <span className="text-[10px] text-slate-500">
                        Select which sections of the workspace this account can view
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => applyModulePreset('all')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded cursor-pointer"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyModulePreset('engineer')}
                        className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded cursor-pointer"
                      >
                        Engineer
                      </button>
                      <button
                        type="button"
                        onClick={() => applyModulePreset('clear')}
                        className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {AVAILABLE_MODULES.map((mod) => {
                      const hasAccess = formData.accessible_modules.includes(mod.id);
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            hasAccess
                              ? 'bg-blue-500/10 border-blue-500/30 text-white'
                              : 'bg-[#07090e] border-[#1d2436] text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            onChange={() => handleToggleModule(mod.id)}
                            className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block leading-tight">
                              {mod.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                              {mod.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT EMPLOYEE MODAL */}
      <AnimatePresence>
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0d111a] border border-[#222b3d] rounded-[2rem] shadow-2xl p-6 lg:p-8 space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Modify Employee Account</h3>
                  <p className="text-xs text-slate-400">
                    Update status, permissions, or position details for {editingEmployee.full_name}.
                  </p>
                </div>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Username (Fixed)</label>
                    <input
                      type="text"
                      disabled
                      value={formData.username}
                      className="w-full px-3.5 py-2 bg-black/50 border border-white/5 rounded-xl text-xs text-slate-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Designation</label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone, Address & Emergency Contact in Edit */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      placeholder="e.g. +880 1712-345678"
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        placeholder="Residential address"
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</label>
                      <input
                        type="text"
                        value={formData.emergency_contact}
                        placeholder="Person & Phone"
                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggle in Edit Modal */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Account Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['active', 'inactive', 'suspended'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`p-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                          formData.status === s
                            ? s === 'active'
                              ? 'bg-emerald-600 text-white'
                              : s === 'inactive'
                              ? 'bg-amber-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-[#07090e] border border-[#222b3d] text-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Engineer', 'Technician', 'Employee'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r })}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.role === r
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#07090e] border border-[#222b3d] text-slate-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modules in Edit */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">
                    Accessible Modules
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {AVAILABLE_MODULES.map((mod) => {
                      const hasAccess = formData.accessible_modules.includes(mod.id);
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                            hasAccess
                              ? 'bg-blue-500/10 border-blue-500/30 text-white font-bold'
                              : 'bg-[#07090e] border-[#1d2436] text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            onChange={() => handleToggleModule(mod.id)}
                            className="rounded border-slate-700 text-blue-600"
                          />
                          <span className="truncate">{mod.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREDENTIALS SUCCESS HANDOVER MODAL */}
      <AnimatePresence>
        {credentialsNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-[#0d111a] border border-emerald-500/30 rounded-[2.5rem] p-6 lg:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Account Initialized Successfully
                </h3>
                <p className="text-xs text-slate-400">
                  Please securely convey these credentials to {credentialsNotice.employee.full_name}.
                </p>
              </div>

              {/* Credentials Box */}
              <div className="p-5 rounded-2xl bg-[#07090e] border border-[#1d2436] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">
                    Full Name:
                  </span>
                  <span className="text-white font-sans font-bold">
                    {credentialsNotice.employee.full_name}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">
                    Employee ID:
                  </span>
                  <span className="text-sky-400 font-bold">
                    {credentialsNotice.employee.employee_id}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">
                    Username:
                  </span>
                  <span className="text-blue-400 font-bold">
                    {credentialsNotice.employee.username}
                  </span>
                </div>

                {credentialsNotice.initialPassword && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">
                      Initial Password:
                    </span>
                    <span className="text-emerald-400 font-black tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                      {credentialsNotice.initialPassword}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">
                    Role &amp; Status:
                  </span>
                  <span className="text-slate-300 font-sans font-bold capitalize">
                    {credentialsNotice.employee.role} • {credentialsNotice.employee.status}
                  </span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-slate-300 text-[11px] leading-relaxed">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Passwords are cryptographically secured using bcrypt through the existing authentication engine. They will never be visible again in the database or frontend.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Carelink Healthineers Employee Portal\nName: ${credentialsNotice.employee.full_name}\nEmployee ID: ${credentialsNotice.employee.employee_id}\nUsername: ${credentialsNotice.employee.username}\nInitial Password: ${credentialsNotice.initialPassword || '(as set)'}\nLogin URL: ${window.location.origin}/login`;
                    copyToClipboard(text, 'modal_creds');
                  }}
                  className="flex-1 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedKey === 'modal_creds' ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCredentialsNotice(null)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
