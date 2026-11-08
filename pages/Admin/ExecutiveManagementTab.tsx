import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  UserPlus,
  Shield,
  Search,
  RefreshCw,
  Key,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Building2,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ExecutiveAccount, ExecutiveRole, ExecutiveStatus } from '../../types';
import {
  fetchExecutiveAccounts,
  createExecutiveAccount,
  updateExecutiveAccount,
  deleteExecutiveAccount,
  CreateExecutiveInput,
} from '../../services/executiveService';
import { DEPARTMENTS } from '../../services/employeeService';
import { generateSecurePassword } from '../../services/employeeService';

export const ExecutiveManagementTab: React.FC = () => {
  const [executives, setExecutives] = useState<ExecutiveAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | ExecutiveRole>('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExec, setEditingExec] = useState<ExecutiveAccount | null>(null);
  const [handoverNotice, setHandoverNotice] = useState<{
    account: ExecutiveAccount;
    initialPassword?: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    full_name: string;
    username: string;
    password: string;
    title_designation: string;
    role: ExecutiveRole;
    accessible_departments: string[]; // ['all'] or array
    phone_number: string;
    status: ExecutiveStatus;
  }>({
    full_name: '',
    username: '',
    password: '',
    title_designation: 'Director of Operations',
    role: 'Director',
    accessible_departments: ['all'],
    phone_number: '',
    status: 'active',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchExecutiveAccounts();
      setExecutives(data);
    } catch (err: any) {
      console.error('Failed to fetch executive accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openCreateModal = () => {
    setFormData({
      full_name: '',
      username: '',
      password: generateSecurePassword(14),
      title_designation: 'Director of Operations',
      role: 'Director',
      accessible_departments: ['all'],
      phone_number: '',
      status: 'active',
    });
    setFormError(null);
    setShowPassword(false);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (exec: ExecutiveAccount) => {
    setEditingExec(exec);
    setFormData({
      full_name: exec.full_name,
      username: exec.username,
      password: '',
      title_designation: exec.title_designation,
      role: exec.role,
      accessible_departments: exec.accessible_departments || ['all'],
      phone_number: exec.phone_number || '',
      status: exec.status,
    });
    setFormError(null);
  };

  const handleGenerateUsername = (role: ExecutiveRole) => {
    const slug = role.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rand = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({
      ...prev,
      username: `${slug}${rand}@exec`,
    }));
  };

  const handleGeneratePassword = () => {
    const pwd = generateSecurePassword(14);
    setFormData((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const handleToggleDepartment = (dept: string) => {
    setFormData((prev) => {
      let current = [...prev.accessible_departments];
      if (dept === 'all') {
        return { ...prev, accessible_departments: ['all'] };
      }

      current = current.filter((d) => d !== 'all');
      if (current.includes(dept)) {
        current = current.filter((d) => d !== dept);
        if (current.length === 0) current = ['all'];
      } else {
        current.push(dept);
      }
      return { ...prev, accessible_departments: current };
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const input: CreateExecutiveInput = {
        full_name: formData.full_name,
        username: formData.username,
        password: formData.password,
        title_designation: formData.title_designation,
        role: formData.role,
        accessible_departments: formData.accessible_departments,
        phone_number: formData.phone_number,
        status: formData.status,
      };

      const result = await createExecutiveAccount(input);
      setIsCreateModalOpen(false);
      setHandoverNotice({
        account: result,
        initialPassword: formData.password,
      });
      triggerToast(`Executive account issued for ${result.full_name}`);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create executive account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExec) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      await updateExecutiveAccount(editingExec.id, {
        full_name: formData.full_name,
        title_designation: formData.title_designation,
        role: formData.role,
        accessible_departments: formData.accessible_departments,
        phone_number: formData.phone_number,
        status: formData.status,
      });

      setEditingExec(null);
      triggerToast(`Updated account for ${formData.full_name}`);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update executive account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (exec: ExecutiveAccount) => {
    if (!confirm(`Are you sure you want to remove executive access for ${exec.full_name} (${exec.role})?`)) {
      return;
    }
    try {
      await deleteExecutiveAccount(exec.id);
      triggerToast(`Removed executive account for ${exec.full_name}`);
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

  const filtered = executives.filter((e) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.full_name.toLowerCase().includes(term) ||
      e.username.toLowerCase().includes(term) ||
      e.title_designation.toLowerCase().includes(term);

    const matchesRole = roleFilter === 'All' || e.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#0d1222] via-[#10182e] to-[#0f172a] border border-[#1e293b] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Crown size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                Executive Management Accounts
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 09 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage MD, Chairman, and Board Director portal access credentials and department monitoring rights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span>{toastMsg}</span>
            </motion.div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl border border-[#21293d] transition-all cursor-pointer"
            title="Refresh Executive Roster"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-amber-400' : ''} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Issue Executive Account</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#0d111a] rounded-2xl border border-[#1d2436] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search executive by name, handle (e.g. chairman@exec), or designation..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090e] border border-[#1d2436] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1d2436] shrink-0">
          {(['All', 'Chairman', 'MD', 'Director', 'Executive'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                roleFilter === r ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Executives Roster Table */}
      <div className="rounded-3xl bg-[#0d111a] border border-[#1d2436] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#07090e]/60 border-b border-[#1d2436] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Executive Name &amp; Title</th>
                <th className="px-6 py-4">Credentials Handle</th>
                <th className="px-6 py-4">Role Tier</th>
                <th className="px-6 py-4">Monitored Departments</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d2436]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Loader2 className="animate-spin text-amber-500 mx-auto mb-2" size={24} />
                    <span>Loading Executive Roster...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <Crown className="text-slate-600 mx-auto mb-2" size={32} />
                    <p className="text-sm font-bold text-white">No Executive Accounts Found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click &quot;Issue Executive Account&quot; to initialize top management credentials.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((exec) => (
                  <tr key={exec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                          {exec.role === 'Chairman' ? 'CH' : exec.role === 'MD' ? 'MD' : 'DIR'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{exec.full_name}</div>
                          <div className="text-[11px] text-amber-400 font-medium">
                            {exec.title_designation}
                          </div>
                          {exec.phone_number && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {exec.phone_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                            {exec.username}
                          </span>
                          <button
                            onClick={() => copyToClipboard(exec.username, `user_${exec.id}`)}
                            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                            title="Copy handle"
                          >
                            {copiedKey === `user_${exec.id}` ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                          {exec.auth_email}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            exec.role === 'Chairman'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                              : exec.role === 'MD'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          }`}
                        >
                          {exec.role}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              exec.status === 'active'
                                ? 'bg-emerald-400 animate-pulse'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span className="text-[10px] text-slate-400 uppercase font-bold">
                            {exec.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {exec.accessible_departments.includes('all') ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            All Departments (Full Access)
                          </span>
                        ) : (
                          exec.accessible_departments.map((d) => (
                            <span
                              key={d}
                              className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[9px] font-medium text-slate-300"
                            >
                              {d}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(exec)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-[#21293d] transition-all cursor-pointer"
                          title="Edit Permissions"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(exec)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Executive Account"
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

      {/* CREATE EXECUTIVE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0d111a] border border-[#222b3d] rounded-[2rem] shadow-2xl p-6 lg:p-8 space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Crown size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Issue Executive Management Account</h3>
                    <p className="text-xs text-slate-400">
                      Grant Chairman, MD, or Director portal monitoring credentials.
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

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Nurul Alam Khan"
                    className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white outline-none focus:border-amber-500"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Username Handle *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGenerateUsername(formData.role)}
                        className="text-[9px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={10} /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. chairman@exec"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs font-mono text-amber-400 outline-none focus:border-amber-500"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value.toLowerCase() })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[9px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={10} /> Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Min. 6 chars"
                        className="w-full pl-4 pr-10 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs font-mono text-white outline-none focus:border-amber-500"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Title Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chairman &amp; Managing Partner"
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white outline-none focus:border-amber-500"
                      value={formData.title_designation}
                      onChange={(e) =>
                        setFormData({ ...formData, title_designation: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Executive Role Level *
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as ExecutiveRole })
                      }
                    >
                      <option value="Chairman">Chairman</option>
                      <option value="MD">Managing Director (MD)</option>
                      <option value="Director">Board Director</option>
                      <option value="Executive">Executive Officer</option>
                    </select>
                  </div>
                </div>

                {/* Accessible Departments Selection */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">
                    Monitored Departments Access
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar">
                    <label
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                        formData.accessible_departments.includes('all')
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold'
                          : 'bg-[#07090e] border-[#1d2436] text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.accessible_departments.includes('all')}
                        onChange={() => handleToggleDepartment('all')}
                        className="rounded border-slate-700 text-amber-600"
                      />
                      <span>All Departments (Full Overview)</span>
                    </label>

                    {DEPARTMENTS.map((dept) => {
                      const isSel = formData.accessible_departments.includes(dept);
                      return (
                        <label
                          key={dept}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                            isSel
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold'
                              : 'bg-[#07090e] border-[#1d2436] text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => handleToggleDepartment(dept)}
                            className="rounded border-slate-700 text-amber-600"
                          />
                          <span className="truncate">{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 bg-white/5 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Issuing...' : 'Issue Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT EXECUTIVE MODAL */}
      <AnimatePresence>
        {editingExec && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d111a] border border-[#222b3d] rounded-[2rem] shadow-2xl p-6 lg:p-8 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">
                  Modify Executive Rights: {editingExec.full_name}
                </h3>
                <button
                  onClick={() => setEditingExec(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Title Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.title_designation}
                    onChange={(e) => setFormData({ ...formData, title_designation: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Role Tier</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as ExecutiveRole })}
                      className="w-full px-3 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                    >
                      <option value="Chairman">Chairman</option>
                      <option value="MD">Managing Director (MD)</option>
                      <option value="Director">Board Director</option>
                      <option value="Executive">Executive Officer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ExecutiveStatus })}
                      className="w-full px-3 py-2 bg-[#07090e] border border-[#222b3d] rounded-xl text-xs text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingExec(null)}
                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREDENTIALS HANDOVER MODAL */}
      <AnimatePresence>
        {handoverNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-[#0d111a] border border-amber-500/30 rounded-[2.5rem] p-6 lg:p-8 space-y-5 shadow-2xl relative"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                  <Crown size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Executive Access Initialized
                </h3>
                <p className="text-xs text-slate-400">
                  Secure credentials for {handoverNotice.account.full_name} ({handoverNotice.account.role}).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#07090e] border border-[#1d2436] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">Executive:</span>
                  <span className="text-white font-sans font-bold">{handoverNotice.account.full_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">Role Tier:</span>
                  <span className="text-amber-400 font-bold">{handoverNotice.account.role}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">Username Handle:</span>
                  <span className="text-sky-400 font-bold">{handoverNotice.account.username}</span>
                </div>
                {handoverNotice.initialPassword && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">Initial Password:</span>
                    <span className="text-emerald-400 font-black tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                      {handoverNotice.initialPassword}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Carelink Healthineers Executive Portal\nName: ${handoverNotice.account.full_name}\nRole: ${handoverNotice.account.role}\nUsername: ${handoverNotice.account.username}\nInitial Password: ${handoverNotice.initialPassword || '(as set)'}\nLogin URL: ${window.location.origin}/login`;
                    copyToClipboard(text, 'modal_creds_exec');
                  }}
                  className="flex-1 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedKey === 'modal_creds_exec' ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Copied Credentials!</span>
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
                  onClick={() => setHandoverNotice(null)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
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
