import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Building2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  HeartHandshake,
  Lock,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  AlertCircle,
  Send,
  Loader2,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Employee, ProfileUpdateRequest } from '../../types';
import {
  updatePermittedProfileFields,
  submitProfileUpdateRequest,
  PROFILE_FIELDS_CONFIG,
} from '../../services/profileRequestService';

interface EmployeeProfileSectionProps {
  employee: Employee;
  myRequests: ProfileUpdateRequest[];
  onRefreshPortal: () => void;
  onToast: (msg: string) => void;
}

export const EmployeeProfileSection: React.FC<EmployeeProfileSectionProps> = ({
  employee,
  myRequests,
  onRefreshPortal,
  onToast,
}) => {
  // Permitted fields edit state
  const allowedEditKeys = employee.permitted_edit_fields || [
    'phone_number',
    'address',
    'emergency_contact',
    'profile_picture',
  ];

  const [permittedForm, setPermittedForm] = useState({
    phone_number: employee.phone_number || '',
    address: employee.address || '',
    emergency_contact: employee.emergency_contact || '',
    profile_picture: employee.profile_picture || '',
  });

  const [isSavingPermitted, setIsSavingPermitted] = useState(false);

  // Request Update Modal State (for locked fields)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>('designation');
  const [requestedValue, setRequestedValue] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSavePermitted = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPermitted(true);
    try {
      await updatePermittedProfileFields(employee, permittedForm);
      onToast('Permitted contact and personal profile details updated');
      onRefreshPortal();
    } catch (err: any) {
      alert(err?.message || 'Failed to save changes');
    } finally {
      setIsSavingPermitted(false);
    }
  };

  const handleOpenRequestModal = (fieldKey: string) => {
    setSelectedFieldKey(fieldKey);
    const currentVal = (employee as any)[fieldKey] || '';
    setRequestedValue('');
    setRequestReason('');
    setModalError(null);
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim()) {
      setModalError('Please enter the requested new value.');
      return;
    }

    const fieldConfig = PROFILE_FIELDS_CONFIG.find((f) => f.key === selectedFieldKey);
    const label = fieldConfig?.label || selectedFieldKey;
    const currentVal = (employee as any)[selectedFieldKey] || '';

    setIsSubmittingRequest(true);
    setModalError(null);

    try {
      await submitProfileUpdateRequest({
        employee,
        field_name: selectedFieldKey,
        field_label: label,
        current_value: currentVal,
        requested_value: requestedValue.trim(),
        reason: requestReason.trim(),
      });
      onToast(`Request submitted to Admin for updating ${label}`);
      setIsRequestModalOpen(false);
      onRefreshPortal();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to submit update request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const currentFieldConfig = PROFILE_FIELDS_CONFIG.find((f) => f.key === selectedFieldKey);
  const currentFieldValue = (employee as any)[selectedFieldKey] || 'None';

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1422] border border-[#1c2638] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
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
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {employee.full_name}
              </h1>
              <span className="text-xs font-mono text-slate-400">({employee.employee_id})</span>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span className="text-blue-400 font-semibold">{employee.designation}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{employee.department}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-bold uppercase text-[10px]">Active Staff</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenRequestModal('designation')}
          className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Lock size={13} className="text-amber-400" />
          <span>Request Official Info Change</span>
        </button>
      </div>

      {/* 2. Grid of All 10 Required Profile Fields */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider">
              Profile &amp; Employment Identity
            </h2>
            <p className="text-xs text-slate-400">
              Fields marked &quot;Official&quot; are managed by administration; click &quot;Request Change&quot; to propose edits.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Permitted to Edit
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Lock size={11} /> Official Admin-Controlled
            </span>
          </div>
        </div>

        {/* 10 Required Fields Presentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROFILE_FIELDS_CONFIG.map((f) => {
            const isPermitted = allowedEditKeys.includes(f.key) && !f.isOfficialLocked;
            const value = (employee as any)[f.key] || 'Not specified';

            return (
              <div
                key={f.key}
                className="p-4 rounded-2xl bg-[#0e1422] border border-[#1c2638] flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {f.label}
                    </span>
                    {f.isOfficialLocked ? (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 flex items-center gap-1">
                        <Lock size={9} /> Official
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        Permitted
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-white truncate max-w-sm">
                    {f.key === 'profile_picture' ? (
                      employee.profile_picture ? (
                        <span className="truncate block font-mono text-slate-300">
                          {employee.profile_picture}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No avatar link set</span>
                      )
                    ) : (
                      value
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{f.description}</div>
                </div>

                {f.isOfficialLocked && (
                  <button
                    onClick={() => handleOpenRequestModal(f.key)}
                    className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 rounded-lg text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
                  >
                    Request Change
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Permitted Fields Edit Form */}
      <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-4">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white">Update Permitted Information</h3>
          <p className="text-xs text-slate-400">
            You are authorized to update your phone number, dispatch address, emergency contact, and profile avatar directly.
          </p>
        </div>

        <form onSubmit={handleSavePermitted} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +880 1712-345678"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                value={permittedForm.phone_number}
                onChange={(e) =>
                  setPermittedForm({ ...permittedForm, phone_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Profile Picture (Choose File)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-black/40 p-1.5 rounded-xl border border-[#232f45]"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        setPermittedForm((prev) => ({
                          ...prev,
                          profile_picture: reader.result as string,
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Dispatch / Residential Address
              </label>
              <input
                type="text"
                placeholder="e.g. House 14, Road 7, Dhanmondi, Dhaka"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                value={permittedForm.address}
                onChange={(e) => setPermittedForm({ ...permittedForm, address: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Emergency Contact (Name &amp; Phone)
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. K. Rahman (Brother) - +880 1819-000000"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                value={permittedForm.emergency_contact}
                onChange={(e) =>
                  setPermittedForm({ ...permittedForm, emergency_contact: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button
              type="submit"
              disabled={isSavingPermitted}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
            >
              {isSavingPermitted ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Permitted Information</span>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 4. My Profile Update Requests History */}
      <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white">My Profile Update Requests</h3>
            <p className="text-xs text-slate-400">
              Track change proposals submitted for administrator approval.
            </p>
          </div>

          <button
            onClick={() => handleOpenRequestModal('designation')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            + New Request
          </button>
        </div>

        {myRequests.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No profile update requests submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{req.field_label}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
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

                  <div className="flex flex-wrap items-center gap-2 text-slate-300">
                    <span className="line-through text-slate-500">{req.current_value || 'None'}</span>
                    <ArrowRight size={11} className="text-blue-400" />
                    <span className="font-bold text-white font-mono bg-blue-600/20 px-1.5 py-0.2 rounded">
                      {req.requested_value}
                    </span>
                  </div>

                  {req.reason && (
                    <p className="text-[11px] text-slate-400 italic">&quot;{req.reason}&quot;</p>
                  )}

                  {req.review_notes && (
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      <span className="font-semibold text-slate-300">Admin feedback:</span>{' '}
                      {req.review_notes}
                    </div>
                  )}
                </div>

                <div className="text-right text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(req.submitted_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL: SUBMIT UPDATE REQUEST FOR LOCKED FIELD */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Request Official Field Update</h3>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {modalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
                {/* Field Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Select Target Field *
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                    value={selectedFieldKey}
                    onChange={(e) => setSelectedFieldKey(e.target.value)}
                  >
                    {PROFILE_FIELDS_CONFIG.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label} {f.isOfficialLocked ? '(Official Locked)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Value Display */}
                <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                    Current Registered Value
                  </span>
                  <div className="font-mono text-slate-200">{currentFieldValue}</div>
                </div>

                {/* Requested New Value */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Requested New Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter requested new ${currentFieldConfig?.label || 'value'}`}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500"
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Reason / Justification (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Promotion to Senior Lead Biomedical Engineer as approved by Clinical Director..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-3.5 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    {isSubmittingRequest ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit to Admin</span>
                      </>
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
