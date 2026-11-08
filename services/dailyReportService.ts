import { supabase } from '../supabaseClient';
import { DailyWorkReport, DailyReportStatus, Employee, DailyWorkReportAttachment } from '../types';

export interface DailyReportInput {
  id?: string;
  report_date: string;
  work_summary: string;
  tasks_completed: string;
  tasks_pending: string;
  work_location: string;
  equipment_worked: string;
  client_hospital: string;
  problems_encountered: string;
  additional_notes: string;
  attachments?: DailyWorkReportAttachment[];
  status?: DailyReportStatus;
}

/**
 * Loads all daily activity work reports from backend persistent storage.
 */
export const fetchDailyWorkReports = async (): Promise<DailyWorkReport[]> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'daily_work_reports')
      .maybeSingle();

    if (error) {
      console.warn('Failed to load daily_work_reports from settings:', error.message);
      return [];
    }

    if (!data?.value) return [];
    const parsed = JSON.parse(data.value);
    const raw = Array.isArray(parsed) ? parsed : [];
    return raw.filter((r: DailyWorkReport) => {
      const summary = (r.work_summary || '').toLowerCase();
      const equip = (r.equipment_worked || '').toLowerCase();
      return !summary.includes('preventive maintenance') && !summary.includes('suction generator') && !summary.includes('optical calibration') && !equip.includes('vistapano');
    });
  } catch (err) {
    console.error('Error parsing daily_work_reports:', err);
    return [];
  }
};

/**
 * Saves daily work reports array to backend storage.
 */
export const saveDailyWorkReports = async (reports: DailyWorkReport[]): Promise<void> => {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'daily_work_reports',
      value: JSON.stringify(reports),
      category: 'operations',
      description: 'Carelink Healthineers Technical Daily Activity Reports',
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to persist daily work reports: ${error.message}`);
  }
};

/**
 * Loads reports submitted by a specific employee.
 */
export const fetchReportsForEmployee = async (employeeId: string): Promise<DailyWorkReport[]> => {
  const allReports = await fetchDailyWorkReports();
  return allReports.filter((r) => r.employee_id === employeeId);
};

/**
 * Checks if a report already exists for the given employee and date.
 */
export const checkDuplicateReport = async (
  employeeId: string,
  reportDate: string,
  excludeReportId?: string
): Promise<DailyWorkReport | null> => {
  const reports = await fetchReportsForEmployee(employeeId);
  const matched = reports.find(
    (r) =>
      r.report_date === reportDate &&
      r.id !== excludeReportId &&
      !r.allow_duplicate &&
      r.status !== 'draft'
  );
  return matched || null;
};

/**
 * Employee creates or saves draft / submits a daily work activity report.
 */
export const saveOrSubmitDailyWorkReport = async (
  input: DailyReportInput,
  employee: Employee,
  isSubmit: boolean
): Promise<DailyWorkReport> => {
  if (!input.report_date) throw new Error('Report date is required.');
  if (isSubmit && !input.work_summary.trim()) {
    throw new Error('Today\'s work summary is required for report submission.');
  }

  const existingReports = await fetchDailyWorkReports();
  const targetStatus: DailyReportStatus = isSubmit ? 'submitted' : 'draft';

  // Duplicate Prevention Check: Check if a non-draft report already exists for this date
  if (isSubmit) {
    const duplicate = existingReports.find(
      (r) =>
        r.employee_id === employee.id &&
        r.report_date === input.report_date &&
        r.id !== input.id &&
        r.status !== 'draft' &&
        !r.allow_duplicate
    );

    if (duplicate) {
      throw new Error(
        `A daily work report for ${input.report_date} has already been submitted. Duplicate reports for the same date are restricted unless permitted by Admin.`
      );
    }
  }

  const timestamp = new Date().toISOString();
  let updatedReport: DailyWorkReport;

  if (input.id) {
    const index = existingReports.findIndex((r) => r.id === input.id);
    if (index === -1) throw new Error('Report record not found.');

    const current = existingReports[index];

    // Security: Ensure only the creator or admin can update
    if (current.employee_id !== employee.id && !employee.id.startsWith('admin_')) {
      throw new Error('Unauthorized: You can only modify your own reports.');
    }

    const historyItem = {
      timestamp,
      action: isSubmit ? 'Submitted report' : 'Updated draft',
      actor: employee.full_name,
      notes: isSubmit ? 'Report submitted for review.' : 'Draft saved.',
    };

    updatedReport = {
      ...current,
      report_date: input.report_date,
      work_summary: input.work_summary.trim(),
      tasks_completed: input.tasks_completed.trim(),
      tasks_pending: input.tasks_pending.trim(),
      work_location: input.work_location.trim(),
      equipment_worked: input.equipment_worked.trim(),
      client_hospital: input.client_hospital.trim(),
      problems_encountered: input.problems_encountered.trim(),
      additional_notes: input.additional_notes.trim(),
      attachments: input.attachments || [],
      status: targetStatus,
      submitted_at: isSubmit ? timestamp : current.submitted_at,
      updated_at: timestamp,
      history: [...(current.history || []), historyItem],
    };

    existingReports[index] = updatedReport;
  } else {
    const historyItem = {
      timestamp,
      action: isSubmit ? 'Created & submitted report' : 'Created draft',
      actor: employee.full_name,
    };

    updatedReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      employee_id: employee.id,
      employee_name: employee.full_name,
      employee_code: employee.employee_id,
      report_date: input.report_date,
      work_summary: input.work_summary.trim(),
      tasks_completed: input.tasks_completed.trim(),
      tasks_pending: input.tasks_pending.trim(),
      work_location: input.work_location.trim() || 'On-site',
      equipment_worked: input.equipment_worked.trim(),
      client_hospital: input.client_hospital.trim(),
      problems_encountered: input.problems_encountered.trim(),
      additional_notes: input.additional_notes.trim(),
      attachments: input.attachments || [],
      status: targetStatus,
      submitted_at: isSubmit ? timestamp : undefined,
      created_at: timestamp,
      updated_at: timestamp,
      history: [historyItem],
    };

    existingReports.unshift(updatedReport);
  }

  await saveDailyWorkReports(existingReports);
  return updatedReport;
};

/**
 * Admin reviews a submitted report (Approves, Requests Correction, or adds Remarks).
 */
export const adminReviewDailyReport = async (
  reportId: string,
  newStatus: DailyReportStatus,
  adminRemarks: string,
  allowDuplicate?: boolean
): Promise<DailyWorkReport> => {
  const reports = await fetchDailyWorkReports();
  const index = reports.findIndex((r) => r.id === reportId);
  if (index === -1) throw new Error('Daily work report not found.');

  const timestamp = new Date().toISOString();
  const current = reports[index];

  const historyItem = {
    timestamp,
    action: `Admin review: Status set to ${newStatus}`,
    actor: 'Administrator',
    notes: adminRemarks || undefined,
  };

  const updated: DailyWorkReport = {
    ...current,
    status: newStatus,
    admin_remarks: adminRemarks.trim(),
    allow_duplicate: allowDuplicate !== undefined ? allowDuplicate : current.allow_duplicate,
    reviewed_at: timestamp,
    updated_at: timestamp,
    history: [...(current.history || []), historyItem],
  };

  reports[index] = updated;
  await saveDailyWorkReports(reports);
  return updated;
};

/**
 * Admin explicitly allows or disallows duplicate report submissions for an employee/date.
 */
export const adminToggleReportDuplicateAllowed = async (
  reportId: string,
  allowed: boolean
): Promise<DailyWorkReport> => {
  const reports = await fetchDailyWorkReports();
  const index = reports.findIndex((r) => r.id === reportId);
  if (index === -1) throw new Error('Daily work report not found.');

  const updated: DailyWorkReport = {
    ...reports[index],
    allow_duplicate: allowed,
    updated_at: new Date().toISOString(),
  };

  reports[index] = updated;
  await saveDailyWorkReports(reports);
  return updated;
};

/**
 * Deletes a daily work report.
 */
export const deleteDailyWorkReport = async (reportId: string): Promise<void> => {
  const reports = await fetchDailyWorkReports();
  const filtered = reports.filter((r) => r.id !== reportId);
  await saveDailyWorkReports(filtered);
};
