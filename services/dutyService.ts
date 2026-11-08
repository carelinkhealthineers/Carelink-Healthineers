import { supabase } from '../supabaseClient';
import { AssignedDuty, DutyPriority, DutyStatus, WorkNote, DutyAttachment, CompletionDetails, Employee } from '../types';

export interface CreateDutyInput {
  employee_id: string;
  employee_name: string;
  employee_code: string;
  title: string;
  description: string;
  location: string;
  priority: DutyPriority;
  assigned_date?: string;
  deadline: string;
  instructions?: string;
  attachments?: DutyAttachment[];
  created_by?: string;
}

/**
 * Loads all assigned duties across all employees from persistent backend storage.
 */
export const fetchAssignedDuties = async (): Promise<AssignedDuty[]> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'duty_assignments')
      .maybeSingle();

    if (error) {
      console.warn('Failed to load duty_assignments from settings:', error.message);
      return [];
    }

    if (!data?.value) return [];
    const parsed = JSON.parse(data.value);
    const raw = Array.isArray(parsed) ? parsed : [];
    return raw.filter((d: AssignedDuty) => {
      const t = (d.title || '').toLowerCase();
      return !t.includes('diagnostic imaging') && !t.includes('dürr dental') && !t.includes('safety interlock') && !t.includes('calibration');
    });
  } catch (err) {
    console.error('Error parsing duty_assignments:', err);
    return [];
  }
};

/**
 * Saves assigned duties array to persistent backend storage.
 */
export const saveAssignedDuties = async (duties: AssignedDuty[]): Promise<void> => {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'duty_assignments',
      value: JSON.stringify(duties),
      category: 'operations',
      description: 'Carelink Healthineers Technical Duty & Task Assignment Log',
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to persist duty assignments: ${error.message}`);
  }
};

/**
 * Fetches duties assigned to a specific employee.
 */
export const fetchDutiesForEmployee = async (employeeId: string): Promise<AssignedDuty[]> => {
  const allDuties = await fetchAssignedDuties();
  return allDuties.filter((d) => d.employee_id === employeeId);
};

/**
 * Admin assigns a new duty to an individual employee.
 */
export const createAssignedDuty = async (input: CreateDutyInput): Promise<AssignedDuty> => {
  if (!input.title.trim()) throw new Error('Duty title is required.');
  if (!input.employee_id) throw new Error('Assignee employee is required.');
  if (!input.deadline) throw new Error('Deadline date is required.');

  const existingDuties = await fetchAssignedDuties();

  const newDuty: AssignedDuty = {
    id: `duty_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    employee_id: input.employee_id,
    employee_name: input.employee_name,
    employee_code: input.employee_code,
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim() || 'Central Healthcare Facility',
    priority: input.priority || 'medium',
    assigned_date: input.assigned_date || new Date().toISOString().split('T')[0],
    deadline: input.deadline,
    instructions: input.instructions?.trim() || '',
    attachments: input.attachments || [],
    status: 'not_started',
    work_notes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: input.created_by || 'Administrator',
  };

  const updatedDuties = [newDuty, ...existingDuties];
  await saveAssignedDuties(updatedDuties);
  return newDuty;
};

/**
 * Employee acknowledges or accepts an assigned duty.
 */
export const acknowledgeDuty = async (
  dutyId: string,
  employeeId: string
): Promise<AssignedDuty> => {
  const duties = await fetchAssignedDuties();
  const index = duties.findIndex((d) => d.id === dutyId);
  if (index === -1) throw new Error('Duty assignment not found.');

  // Security: Ensure only the assigned employee (or admin) can acknowledge
  if (duties[index].employee_id !== employeeId && !employeeId.startsWith('admin_')) {
    throw new Error('Unauthorized: You can only acknowledge duties assigned to you.');
  }

  const updated: AssignedDuty = {
    ...duties[index],
    acknowledged_at: new Date().toISOString(),
    status: duties[index].status === 'not_started' ? 'in_progress' : duties[index].status,
    updated_at: new Date().toISOString(),
  };

  duties[index] = updated;
  await saveAssignedDuties(duties);
  return updated;
};

/**
 * Employee updates status: 'not_started' | 'in_progress' | 'completed'.
 */
export const updateDutyStatus = async (
  dutyId: string,
  status: DutyStatus,
  employeeId: string
): Promise<AssignedDuty> => {
  const duties = await fetchAssignedDuties();
  const index = duties.findIndex((d) => d.id === dutyId);
  if (index === -1) throw new Error('Duty assignment not found.');

  if (duties[index].employee_id !== employeeId && !employeeId.startsWith('admin_')) {
    throw new Error('Unauthorized: You can only update duties assigned to you.');
  }

  const updated: AssignedDuty = {
    ...duties[index],
    status,
    updated_at: new Date().toISOString(),
  };

  duties[index] = updated;
  await saveAssignedDuties(duties);
  return updated;
};

/**
 * Employee adds a work note to the duty log.
 */
export const addDutyWorkNote = async (
  dutyId: string,
  noteText: string,
  authorName: string,
  employeeId: string
): Promise<AssignedDuty> => {
  if (!noteText.trim()) throw new Error('Work note cannot be blank.');

  const duties = await fetchAssignedDuties();
  const index = duties.findIndex((d) => d.id === dutyId);
  if (index === -1) throw new Error('Duty assignment not found.');

  if (duties[index].employee_id !== employeeId && !employeeId.startsWith('admin_')) {
    throw new Error('Unauthorized: You can only add notes to your assigned duties.');
  }

  const newNote: WorkNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    note: noteText.trim(),
    author: authorName,
    created_at: new Date().toISOString(),
  };

  const updated: AssignedDuty = {
    ...duties[index],
    work_notes: [...(duties[index].work_notes || []), newNote],
    updated_at: new Date().toISOString(),
  };

  duties[index] = updated;
  await saveAssignedDuties(duties);
  return updated;
};

/**
 * Employee submits completion details (notes, summary, parts used) and marks duty completed.
 */
export const submitDutyCompletion = async (
  dutyId: string,
  completionNotes: string,
  partsUsedOrSummary: string,
  employeeId: string
): Promise<AssignedDuty> => {
  if (!completionNotes.trim()) throw new Error('Completion notes are required.');

  const duties = await fetchAssignedDuties();
  const index = duties.findIndex((d) => d.id === dutyId);
  if (index === -1) throw new Error('Duty assignment not found.');

  if (duties[index].employee_id !== employeeId && !employeeId.startsWith('admin_')) {
    throw new Error('Unauthorized: You can only complete your own assigned duties.');
  }

  const completionDetails: CompletionDetails = {
    completed_at: new Date().toISOString(),
    completion_notes: completionNotes.trim(),
    parts_used_or_summary: partsUsedOrSummary.trim() || undefined,
  };

  const updated: AssignedDuty = {
    ...duties[index],
    status: 'completed',
    completion_details: completionDetails,
    updated_at: new Date().toISOString(),
  };

  duties[index] = updated;
  await saveAssignedDuties(duties);
  return updated;
};

/**
 * Admin deletes an assigned duty.
 */
export const deleteAssignedDuty = async (dutyId: string): Promise<void> => {
  const duties = await fetchAssignedDuties();
  const filtered = duties.filter((d) => d.id !== dutyId);
  await saveAssignedDuties(filtered);
};
