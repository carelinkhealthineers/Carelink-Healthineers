import { supabase } from '../supabaseClient';
import { TaDaClaim, TaDaClaimStatus, PaymentStatus, Employee, ExpenseAttachment } from '../types';

export interface TaDaClaimInput {
  id?: string;
  title: string;
  travel_start_date: string;
  travel_end_date: string;
  origin: string;
  destination: string;
  travel_allowance: number;
  daily_allowance: number;
  transportation_expense: number;
  accommodation_food_expense: number;
  bills_receipts?: ExpenseAttachment[];
  remarks?: string;
  status?: TaDaClaimStatus;
}

/**
 * Loads all TA/DA expense claims from backend persistent storage.
 */
export const fetchTaDaClaims = async (): Promise<TaDaClaim[]> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tada_expense_claims')
      .maybeSingle();

    if (error) {
      console.warn('Failed to load tada_expense_claims from settings:', error.message);
      return [];
    }

    if (!data?.value) return [];
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing tada_expense_claims:', err);
    return [];
  }
};

/**
 * Saves TA/DA claims array to backend storage.
 */
export const saveTaDaClaims = async (claims: TaDaClaim[]): Promise<void> => {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'tada_expense_claims',
      value: JSON.stringify(claims),
      category: 'finance',
      description: 'Carelink Healthineers Employee Travel & Daily Allowance (TA/DA) Claims',
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to persist TA/DA expense claims: ${error.message}`);
  }
};

/**
 * Strictly loads claims for a specific employee (Security constraint: employees must only see their own claims).
 */
export const fetchClaimsForEmployee = async (employeeId: string): Promise<TaDaClaim[]> => {
  const allClaims = await fetchTaDaClaims();
  return allClaims.filter((c) => c.employee_id === employeeId);
};

/**
 * Calculates total claim amount automatically from individual line items.
 */
export const calculateTotalClaimAmount = (input: {
  travel_allowance: number;
  daily_allowance: number;
  transportation_expense: number;
  accommodation_food_expense: number;
}): number => {
  const ta = Number(input.travel_allowance) || 0;
  const da = Number(input.daily_allowance) || 0;
  const trans = Number(input.transportation_expense) || 0;
  const acc = Number(input.accommodation_food_expense) || 0;
  return Number((ta + da + trans + acc).toFixed(2));
};

/**
 * Employee creates a draft or submits a TA/DA claim.
 */
export const saveOrSubmitTaDaClaim = async (
  input: TaDaClaimInput,
  employee: Employee,
  isSubmit: boolean
): Promise<TaDaClaim> => {
  if (!input.title.trim()) throw new Error('Claim title / purpose is required.');
  if (!input.travel_start_date) throw new Error('Travel start date is required.');
  if (!input.travel_end_date) throw new Error('Travel end date is required.');

  const totalAmount = calculateTotalClaimAmount(input);
  if (isSubmit && totalAmount <= 0) {
    throw new Error('Total claim amount must be greater than zero.');
  }

  const existingClaims = await fetchTaDaClaims();
  const targetStatus: TaDaClaimStatus = isSubmit ? 'submitted' : 'draft';
  const timestamp = new Date().toISOString();
  let updatedClaim: TaDaClaim;

  if (input.id) {
    const index = existingClaims.findIndex((c) => c.id === input.id);
    if (index === -1) throw new Error('Claim record not found.');

    const current = existingClaims[index];

    // Security Check
    if (current.employee_id !== employee.id && !employee.id.startsWith('admin_')) {
      throw new Error('Unauthorized: You can only modify your own expense claims.');
    }

    updatedClaim = {
      ...current,
      title: input.title.trim(),
      travel_start_date: input.travel_start_date,
      travel_end_date: input.travel_end_date,
      origin: input.origin.trim() || 'Dhaka HQ',
      destination: input.destination.trim() || 'Field Destination',
      travel_allowance: Number(input.travel_allowance) || 0,
      daily_allowance: Number(input.daily_allowance) || 0,
      transportation_expense: Number(input.transportation_expense) || 0,
      accommodation_food_expense: Number(input.accommodation_food_expense) || 0,
      total_amount: totalAmount,
      bills_receipts: input.bills_receipts || [],
      remarks: input.remarks?.trim() || '',
      status: targetStatus,
      submitted_at: isSubmit ? timestamp : current.submitted_at,
      updated_at: timestamp,
    };

    existingClaims[index] = updatedClaim;
  } else {
    updatedClaim = {
      id: `tada_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      employee_id: employee.id,
      employee_name: employee.full_name,
      employee_code: employee.employee_id,
      title: input.title.trim(),
      travel_start_date: input.travel_start_date,
      travel_end_date: input.travel_end_date,
      origin: input.origin.trim() || 'Dhaka HQ',
      destination: input.destination.trim() || 'Field Destination',
      travel_allowance: Number(input.travel_allowance) || 0,
      daily_allowance: Number(input.daily_allowance) || 0,
      transportation_expense: Number(input.transportation_expense) || 0,
      accommodation_food_expense: Number(input.accommodation_food_expense) || 0,
      total_amount: totalAmount,
      bills_receipts: input.bills_receipts || [],
      remarks: input.remarks?.trim() || '',
      status: targetStatus,
      payment_status: 'unpaid',
      submitted_at: isSubmit ? timestamp : undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    existingClaims.unshift(updatedClaim);
  }

  await saveTaDaClaims(existingClaims);
  return updatedClaim;
};

/**
 * Admin reviews a TA/DA claim (Approve or Reject with remarks).
 */
export const adminReviewTaDaClaim = async (
  claimId: string,
  newStatus: TaDaClaimStatus,
  adminRemarks: string
): Promise<TaDaClaim> => {
  const claims = await fetchTaDaClaims();
  const index = claims.findIndex((c) => c.id === claimId);
  if (index === -1) throw new Error('Expense claim not found.');

  const timestamp = new Date().toISOString();
  const updated: TaDaClaim = {
    ...claims[index],
    status: newStatus,
    admin_remarks: adminRemarks.trim(),
    reviewed_at: timestamp,
    updated_at: timestamp,
  };

  claims[index] = updated;
  await saveTaDaClaims(claims);
  return updated;
};

/**
 * Admin toggles payment status ('unpaid' or 'paid').
 */
export const adminTogglePaymentStatus = async (
  claimId: string,
  paymentStatus: PaymentStatus
): Promise<TaDaClaim> => {
  const claims = await fetchTaDaClaims();
  const index = claims.findIndex((c) => c.id === claimId);
  if (index === -1) throw new Error('Expense claim not found.');

  const timestamp = new Date().toISOString();
  const updated: TaDaClaim = {
    ...claims[index],
    payment_status: paymentStatus,
    paid_at: paymentStatus === 'paid' ? timestamp : undefined,
    updated_at: timestamp,
  };

  claims[index] = updated;
  await saveTaDaClaims(claims);
  return updated;
};

/**
 * Deletes a TA/DA claim.
 */
export const deleteTaDaClaim = async (claimId: string): Promise<void> => {
  const claims = await fetchTaDaClaims();
  const filtered = claims.filter((c) => c.id !== claimId);
  await saveTaDaClaims(filtered);
};
