import { supabase } from '../supabaseClient';
import { ProfileUpdateRequest, Employee } from '../types';
import { fetchEmployees, updateEmployeeAccount } from './employeeService';

/**
 * Standard list of employee fields and their official/admin-controlled status.
 */
export const PROFILE_FIELDS_CONFIG: Array<{
  key: string;
  label: string;
  isOfficialLocked: boolean; // Official information: designation, department, employee ID, etc.
  description: string;
}> = [
  { key: 'profile_picture', label: 'Profile Photo', isOfficialLocked: false, description: 'Avatar image URL' },
  { key: 'full_name', label: 'Full Name', isOfficialLocked: true, description: 'Official employee registered name' },
  { key: 'employee_id', label: 'Employee ID', isOfficialLocked: true, description: 'Corporate identification code' },
  { key: 'designation', label: 'Designation', isOfficialLocked: true, description: 'Official clinical / technical title' },
  { key: 'department', label: 'Department', isOfficialLocked: true, description: 'Organizational operational unit' },
  { key: 'phone_number', label: 'Phone Number', isOfficialLocked: false, description: 'Primary technical contact line' },
  { key: 'username', label: 'Email / Username', isOfficialLocked: true, description: 'Terminal credentials' },
  { key: 'joining_date', label: 'Joining Date', isOfficialLocked: true, description: 'Official appointment date' },
  { key: 'address', label: 'Current Address', isOfficialLocked: false, description: 'Residential or dispatch address' },
  { key: 'emergency_contact', label: 'Emergency Contact', isOfficialLocked: false, description: 'Emergency phone and person name' },
];

/**
 * Loads all profile update requests from persistent storage.
 */
export const fetchProfileUpdateRequests = async (): Promise<ProfileUpdateRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'profile_update_requests')
      .maybeSingle();

    if (error) {
      console.warn('Failed to load profile_update_requests from settings:', error.message);
      return [];
    }

    if (!data?.value) return [];
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing profile_update_requests:', err);
    return [];
  }
};

/**
 * Saves profile update requests array to storage.
 */
export const saveProfileUpdateRequests = async (
  requests: ProfileUpdateRequest[]
): Promise<void> => {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'profile_update_requests',
      value: JSON.stringify(requests),
      category: 'employees',
      description: 'Carelink Healthineers Employee Profile Update Requests',
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to persist profile update requests: ${error.message}`);
  }
};

/**
 * Fetches profile update requests submitted by a specific employee.
 */
export const fetchRequestsForEmployee = async (
  employeeId: string
): Promise<ProfileUpdateRequest[]> => {
  const allRequests = await fetchProfileUpdateRequests();
  return allRequests.filter((r) => r.employee_id === employeeId);
};

/**
 * Employee submits a request to update a locked or official field.
 */
export const submitProfileUpdateRequest = async (input: {
  employee: Employee;
  field_name: string;
  field_label: string;
  current_value: string;
  requested_value: string;
  reason?: string;
}): Promise<ProfileUpdateRequest> => {
  if (!input.requested_value.trim()) {
    throw new Error('Requested new value cannot be empty.');
  }

  const existingRequests = await fetchProfileUpdateRequests();

  const newRequest: ProfileUpdateRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    employee_id: input.employee.id,
    employee_code: input.employee.employee_id,
    employee_name: input.employee.full_name,
    field_name: input.field_name,
    field_label: input.field_label,
    current_value: input.current_value || 'None',
    requested_value: input.requested_value.trim(),
    reason: input.reason?.trim() || '',
    status: 'pending',
    submitted_at: new Date().toISOString(),
  };

  const updatedRequests = [newRequest, ...existingRequests];
  await saveProfileUpdateRequests(updatedRequests);
  return newRequest;
};

/**
 * Admin approves a profile update request:
 * 1. Automatically updates the employee's official record in employee_registry.
 * 2. Marks the request as 'approved' with timestamp and optional review note.
 */
export const approveProfileUpdateRequest = async (
  requestId: string,
  reviewNotes?: string
): Promise<{ request: ProfileUpdateRequest; updatedEmployee: Employee }> => {
  const requests = await fetchProfileUpdateRequests();
  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) throw new Error('Request not found.');

  const targetReq = requests[reqIndex];
  if (targetReq.status !== 'pending') {
    throw new Error(`Request has already been ${targetReq.status}.`);
  }

  // Update employee record
  const employeeUpdates: Record<string, any> = {};
  employeeUpdates[targetReq.field_name] = targetReq.requested_value;

  const updatedEmployee = await updateEmployeeAccount(targetReq.employee_id, employeeUpdates);

  const updatedReq: ProfileUpdateRequest = {
    ...targetReq,
    status: 'approved',
    reviewed_at: new Date().toISOString(),
    review_notes: reviewNotes || 'Approved by system administrator.',
  };

  requests[reqIndex] = updatedReq;
  await saveProfileUpdateRequests(requests);

  return { request: updatedReq, updatedEmployee };
};

/**
 * Admin rejects a profile update request with an optional review note.
 */
export const rejectProfileUpdateRequest = async (
  requestId: string,
  reviewNotes?: string
): Promise<ProfileUpdateRequest> => {
  const requests = await fetchProfileUpdateRequests();
  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) throw new Error('Request not found.');

  const targetReq = requests[reqIndex];
  const updatedReq: ProfileUpdateRequest = {
    ...targetReq,
    status: 'rejected',
    reviewed_at: new Date().toISOString(),
    review_notes: reviewNotes || 'Declined by administrator.',
  };

  requests[reqIndex] = updatedReq;
  await saveProfileUpdateRequests(requests);
  return updatedReq;
};

/**
 * Employee directly saves changes to fields permitted by Admin
 * (e.g., phone_number, address, emergency_contact, profile_picture).
 */
export const updatePermittedProfileFields = async (
  employee: Employee,
  updates: {
    phone_number?: string;
    address?: string;
    emergency_contact?: string;
    profile_picture?: string;
  }
): Promise<Employee> => {
  // Check permitted fields: if employee has custom permitted_edit_fields, enforce it
  const allowedKeys = employee.permitted_edit_fields || [
    'phone_number',
    'address',
    'emergency_contact',
    'profile_picture',
  ];

  const sanitizedUpdates: Record<string, any> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined && allowedKeys.includes(key)) {
      sanitizedUpdates[key] = typeof val === 'string' ? val.trim() : val;
    }
  }

  return updateEmployeeAccount(employee.id, sanitizedUpdates);
};
