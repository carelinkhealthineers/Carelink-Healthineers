import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Check,
  Plus,
  X,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Send,
  Loader2,
  Info,
} from 'lucide-react';
import { AssignedDuty, DutyStatus, DutyPriority, Employee } from '../../types';
import {
  acknowledgeDuty,
  updateDutyStatus,
  addDutyWorkNote,
  submitDutyCompletion,
} from '../../services/dutyService';

interface AssignedDutiesSectionProps {
  employee: Employee;
  duties: AssignedDuty[];
  onRefreshDuties: () => void;
  onToast: (msg: string) => void;
}

export const AssignedDutiesSection: React.FC<AssignedDutiesSectionProps> = ({
  employee,
  duties,
  onRefreshDuties,
  onToast,
}) => {
  const [selectedDutyForNote, setSelectedDutyForNote] = useState<AssignedDuty | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const [selectedDutyForCompletion, setSelectedDutyForCompletion] = useState<AssignedDuty | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  const [expandedNotesDutyId, setExpandedNotesDutyId] = useState<string | null>(null);

  // Acknowledge duty
  const handleAcknowledge = async (dutyId: string) => {
    try {
      await acknowledgeDuty(dutyId, employee.id);
      onToast('Duty assignment acknowledged and marked active');
      onRefreshDuties();
    } catch (err: any) {
      alert(err?.message || 'Failed to acknowledge duty');
    }
  };

  // Change status
  const handleStatusChange = async (dutyId: string, status: DutyStatus) => {
    try {
      await updateDutyStatus(dutyId, status, employee.id);
      onToast(`Duty status updated to ${status === 'in_progress' ? 'In Progress' : status}`);
      onRefreshDuties();
    } catch (err: any) {
      alert(err?.message || 'Failed to update duty status');
    }
  };

  // Submit note
  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDutyForNote || !noteText.trim()) return;
    setIsSubmittingNote(true);

    try {
      await addDutyWorkNote(
        selectedDutyForNote.id,
        noteText.trim(),
        employee.full_name,
        employee.id
      );
      onToast('Work note logged to duty record');
      setSelectedDutyForNote(null);
      setNoteText('');
      onRefreshDuties();
    } catch (err: any) {
      alert(err?.message || 'Failed to add work note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Submit completion
  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDutyForCompletion || !completionNotes.trim()) return;
    setIsSubmittingCompletion(true);

    try {
      await submitDutyCompletion(
        selectedDutyForCompletion.id,
        completionNotes.trim(),
        partsUsed.trim(),
        employee.id
      );
      onToast('Completion report submitted to administrator');
      setSelectedDutyForCompletion(null);
      setCompletionNotes('');
      setPartsUsed('');
      onRefreshDuties();
    } catch (err: any) {
      alert(err?.message || 'Failed to submit completion');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  return (
    <section className="p-6 sm:p-7 rounded-3xl bg-[#0e1422] border border-[#1c2638] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Admin-Assigned Duties</h2>
              <span className="text-xs font-mono text-slate-400">({duties.length})</span>
            </div>
            <p className="text-xs text-slate-400">
              Direct technical dispatches, customer service mandates, and hardware orders from Admin.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Phase 04 Active Dispatch
        </span>
      </div>

      {duties.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
          <Briefcase className="text-slate-600 mx-auto" size={32} />
          <p className="font-semibold text-white">No Assigned Duties at this time</p>
          <p className="text-slate-500">
            When management assigns field calibrations, site visits, or diagnostic tasks, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duties.map((duty) => {
            const isCompleted = duty.status === 'completed';
            const isAcknowledged = Boolean(duty.acknowledged_at);
            const notes = duty.work_notes || [];

            return (
              <div
                key={duty.id}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                  isCompleted
                    ? 'bg-black/20 border-white/5 opacity-80'
                    : 'bg-white/[0.02] border-white/10 hover:border-blue-500/30'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">{duty.title}</h3>

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

                    <p className="text-xs text-slate-300 leading-relaxed">{duty.description}</p>
                  </div>

                  {/* Deadline & Acknowledge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-400" />
                      Due: {duty.deadline}
                    </span>

                    {!isAcknowledged && !isCompleted ? (
                      <button
                        onClick={() => handleAcknowledge(duty.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check size={12} />
                        <span>Acknowledge Duty</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>

                {/* Technical Instructions & Location */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <MapPin size={13} className="text-slate-500" />
                    {duty.location}
                  </span>

                  {duty.instructions && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-blue-400 flex items-center gap-1 truncate max-w-md">
                        <Info size={12} /> Instructions: {duty.instructions}
                      </span>
                    </>
                  )}
                </div>

                {/* Attachments if any */}
                {(duty.attachments || []).length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      Attachments:
                    </span>
                    {duty.attachments?.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                      >
                        <Paperclip size={12} />
                        <span>{att.name}</span>
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                )}

                {/* Duty Operational Controls: Status buttons, Add Work Note, Complete */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  {/* Status Dropdown / Buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">
                      Update Status:
                    </span>
                    {(['not_started', 'in_progress', 'completed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(duty.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          duty.status === st
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'not_started' ? 'Not Started' : st === 'in_progress' ? 'In Progress' : 'Completed'}
                      </button>
                    ))}
                  </div>

                  {/* Actions: Add Note & Submit Completion */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDutyForNote(duty)}
                      className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare size={13} className="text-blue-400" />
                      <span>Add Work Note</span>
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={() => setSelectedDutyForCompletion(duty)}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileCheck size={13} />
                        <span>Submit Completion</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Work Notes Feed */}
                {notes.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <button
                      onClick={() =>
                        setExpandedNotesDutyId(expandedNotesDutyId === duty.id ? null : duty.id)
                      }
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <MessageSquare size={12} className="text-blue-400" />
                      <span>
                        {expandedNotesDutyId === duty.id ? 'Hide' : 'View'} Work Notes ({notes.length})
                      </span>
                    </button>

                    {expandedNotesDutyId === duty.id && (
                      <div className="space-y-1.5 pl-2 border-l-2 border-blue-500/40 mt-1">
                        {notes.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs space-y-0.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-semibold text-slate-300">{n.author}</span>
                              <span className="font-mono">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Completion Details Preview */}
                {duty.completion_details && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px]">
                      <span>Completion Notes Logged</span>
                      <span className="font-mono text-[10px]">
                        {new Date(duty.completion_details.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-200">{duty.completion_details.completion_notes}</p>
                    {duty.completion_details.parts_used_or_summary && (
                      <div className="text-[10px] text-emerald-300 font-mono pt-1">
                        Parts / Summary: {duty.completion_details.parts_used_or_summary}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD WORK NOTE */}
      <AnimatePresence>
        {selectedDutyForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Add Technical Work Note</h3>
                </div>
                <button
                  onClick={() => setSelectedDutyForNote(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300">
                Duty: <span className="text-white font-bold">{selectedDutyForNote.title}</span>
              </div>

              <form onSubmit={handleAddNoteSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Work Progress / Diagnostic Observation *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Arrived on site, verified power supply ripple within +/- 0.5V, cleaning suction filter..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedDutyForNote(null)}
                    className="px-3.5 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingNote ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUBMIT COMPLETION */}
      <AnimatePresence>
        {selectedDutyForCompletion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1422] border border-[#232f45] rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Submit Duty Completion Details</h3>
                </div>
                <button
                  onClick={() => setSelectedDutyForCompletion(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300">
                Duty: <span className="text-white font-bold">{selectedDutyForCompletion.title}</span>
              </div>

              <form onSubmit={handleCompletionSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Completion Notes &amp; Verification *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Summarize the final outcomes, operational calibration values, customer sign-off details, and test results..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 leading-relaxed custom-scrollbar"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Parts Replaced / Materials Consumed (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1x O-Ring seal set (Part #DRR-882), 2L Disinfectant solution"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-[#232f45] rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                    value={partsUsed}
                    onChange={(e) => setPartsUsed(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedDutyForCompletion(null)}
                    className="px-3.5 py-2 bg-white/5 text-slate-300 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCompletion}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    {isSubmittingCompletion ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                    <span>Mark Duty Completed</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
