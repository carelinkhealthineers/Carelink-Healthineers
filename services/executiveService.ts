import { supabase } from '../supabaseClient';
import {
  ExecutiveAccount,
  ExecutiveRole,
  ExecutiveStatus,
  ManagementDecision,
  DecisionPriority,
  DecisionStatus,
  ExecutiveRemark,
  CompanyNote,
  NoteCategory,
  ProductSaleRecord,
  MonthlyBudgetRecord,
  CustomExcelPreset,
} from '../types';

const EXECUTIVE_ACCOUNTS_KEY = 'executive_accounts';
const MANAGEMENT_DECISIONS_KEY = 'management_decisions';
const EXECUTIVE_REMARKS_KEY = 'executive_remarks';
const COMPANY_NOTES_KEY = 'company_notes_directives';

/**
 * Default Executive Accounts (Empty by default — populated strictly via Admin Panel)
 */
const DEFAULT_EXECUTIVES: ExecutiveAccount[] = [];

/**
 * Default Management Decisions (Empty by default — populated strictly via Executive Portal)
 */
const DEFAULT_DECISIONS: ManagementDecision[] = [];

// Helper to fetch from Supabase settings
async function getStoredItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data || !data.value) {
      return fallback;
    }
    return JSON.parse(data.value) as T;
  } catch (err) {
    console.warn(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

// Helper to save to Supabase settings
async function setStoredItem<T>(key: string, value: T): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    const { error } = await supabase.from('settings').upsert(
      {
        key,
        value: serialized,
        category: 'executive_data',
        description: `Executive management stored data for ${key}`,
      },
      { onConflict: 'key' }
    );
    if (error) {
      console.warn(`Error persisting ${key} to Supabase settings:`, error);
    }
  } catch (err) {
    console.warn(`Failed to setStoredItem for ${key}:`, err);
  }
}

/* ==========================================
   Executive Accounts CRUD
   ========================================== */

export async function fetchExecutiveAccounts(): Promise<ExecutiveAccount[]> {
  const accounts = await getStoredItem<ExecutiveAccount[]>(EXECUTIVE_ACCOUNTS_KEY, []);
  return accounts;
}

export async function findExecutiveByIdentifier(identifier: string): Promise<ExecutiveAccount | null> {
  const accounts = await fetchExecutiveAccounts();
  const clean = identifier.trim().toLowerCase();
  return (
    accounts.find(
      (acc) =>
        acc.username.toLowerCase() === clean ||
        acc.auth_email.toLowerCase() === clean ||
        acc.full_name.toLowerCase() === clean
    ) || null
  );
}

export interface CreateExecutiveInput {
  full_name: string;
  username: string;
  password?: string;
  title_designation: string;
  role: ExecutiveRole;
  accessible_departments: string[];
  phone_number?: string;
  status: ExecutiveStatus;
}

export async function createExecutiveAccount(input: CreateExecutiveInput): Promise<ExecutiveAccount> {
  const accounts = await fetchExecutiveAccounts();
  const cleanUser = input.username.trim().toLowerCase();

  const existing = accounts.find((a) => a.username.toLowerCase() === cleanUser);
  if (existing) {
    throw new Error(`Username "${cleanUser}" is already assigned to executive ${existing.full_name}.`);
  }

  const authEmail = `${cleanUser.replace(/[^a-z0-9]/g, '')}@exec.carelinkhealthineers.com`;
  const newAccount: ExecutiveAccount = {
    id: `exec-${Date.now()}`,
    full_name: input.full_name.trim(),
    username: cleanUser,
    auth_email: authEmail,
    title_designation: input.title_designation.trim() || 'Director',
    role: input.role,
    accessible_departments: input.accessible_departments.length > 0 ? input.accessible_departments : ['all'],
    phone_number: input.phone_number?.trim() || '',
    status: input.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Attempt to create Supabase Auth User if password is supplied
  if (input.password && input.password.length >= 6) {
    try {
      await supabase.auth.signUp({
        email: authEmail,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name,
            role: 'executive',
            executive_role: input.role,
          },
        },
      });
    } catch (authErr) {
      console.warn('Supabase auth signup for executive note:', authErr);
    }
  }

  const updatedList = [newAccount, ...accounts];
  await setStoredItem(EXECUTIVE_ACCOUNTS_KEY, updatedList);
  return newAccount;
}

export async function updateExecutiveAccount(
  id: string,
  updates: Partial<ExecutiveAccount>
): Promise<ExecutiveAccount> {
  const accounts = await fetchExecutiveAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error('Executive account not found.');
  }

  const updated: ExecutiveAccount = {
    ...accounts[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  accounts[index] = updated;
  await setStoredItem(EXECUTIVE_ACCOUNTS_KEY, accounts);
  return updated;
}

export async function deleteExecutiveAccount(id: string): Promise<void> {
  const accounts = await fetchExecutiveAccounts();
  const filtered = accounts.filter((a) => a.id !== id);
  await setStoredItem(EXECUTIVE_ACCOUNTS_KEY, filtered);
}

/* ==========================================
   Executive Session Management
   ========================================== */

const EXECUTIVE_ACTIVE_SESSION_KEY = 'carelink_executive_session';

export function setExecutiveSession(exec: ExecutiveAccount | null) {
  if (exec) {
    localStorage.setItem(EXECUTIVE_ACTIVE_SESSION_KEY, JSON.stringify(exec));
  } else {
    localStorage.removeItem(EXECUTIVE_ACTIVE_SESSION_KEY);
  }
}

export async function getCurrentExecutiveSession(): Promise<{
  execAccount: ExecutiveAccount | null;
}> {
  try {
    const raw = localStorage.getItem(EXECUTIVE_ACTIVE_SESSION_KEY);
    if (!raw) return { execAccount: null };
    const parsed = JSON.parse(raw) as ExecutiveAccount;
    // Verify account still exists and active
    const accounts = await fetchExecutiveAccounts();
    const live = accounts.find((a) => a.id === parsed.id && a.status === 'active');
    return { execAccount: live || null };
  } catch (err) {
    return { execAccount: null };
  }
}

/* ==========================================
   Management Decisions Engine
   ========================================== */

export async function fetchManagementDecisions(): Promise<ManagementDecision[]> {
  return await getStoredItem<ManagementDecision[]>(MANAGEMENT_DECISIONS_KEY, DEFAULT_DECISIONS);
}

export interface CreateDecisionInput {
  executive: ExecutiveAccount;
  title: string;
  description: string;
  target_department: string;
  assigned_manager_name?: string;
  priority: DecisionPriority;
  deadline?: string;
  remarks?: string;
  related_report_id?: string;
  related_employee_id?: string;
}

export async function createManagementDecision(input: CreateDecisionInput): Promise<ManagementDecision> {
  const decisions = await fetchManagementDecisions();
  const newDecision: ManagementDecision = {
    id: `dec-${Date.now()}`,
    executive_id: input.executive.id,
    executive_name: input.executive.full_name,
    executive_role: input.executive.role,
    title: input.title.trim(),
    description: input.description.trim(),
    target_department: input.target_department,
    assigned_manager_name: input.assigned_manager_name?.trim(),
    priority: input.priority,
    status: 'pending',
    deadline: input.deadline || undefined,
    remarks: input.remarks?.trim() || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    related_report_id: input.related_report_id,
    related_employee_id: input.related_employee_id,
  };

  const updatedList = [newDecision, ...decisions];
  await setStoredItem(MANAGEMENT_DECISIONS_KEY, updatedList);
  return newDecision;
}

export async function updateDecisionStatus(
  id: string,
  status: DecisionStatus,
  completion_notes?: string
): Promise<ManagementDecision> {
  const decisions = await fetchManagementDecisions();
  const idx = decisions.findIndex((d) => d.id === id);
  if (idx === -1) {
    throw new Error('Management decision record not found.');
  }

  const updated: ManagementDecision = {
    ...decisions[idx],
    status,
    completion_notes: completion_notes || decisions[idx].completion_notes,
    completed_at: status === 'completed' ? new Date().toISOString() : decisions[idx].completed_at,
    updated_at: new Date().toISOString(),
  };

  decisions[idx] = updated;
  await setStoredItem(MANAGEMENT_DECISIONS_KEY, decisions);
  return updated;
}

export async function deleteManagementDecision(id: string): Promise<void> {
  const decisions = await fetchManagementDecisions();
  const filtered = decisions.filter((d) => d.id !== id);
  await setStoredItem(MANAGEMENT_DECISIONS_KEY, filtered);
}

/* ==========================================
   Executive Remarks & Flagged Reports
   ========================================== */

export async function fetchExecutiveRemarks(): Promise<ExecutiveRemark[]> {
  return await getStoredItem<ExecutiveRemark[]>(EXECUTIVE_REMARKS_KEY, []);
}

export async function addExecutiveRemark(
  reportId: string,
  exec: ExecutiveAccount,
  remarkText: string,
  flaggedUrgent: boolean = false
): Promise<ExecutiveRemark> {
  const remarks = await fetchExecutiveRemarks();
  const newRemark: ExecutiveRemark = {
    id: `rem-${Date.now()}`,
    report_id: reportId,
    executive_id: exec.id,
    executive_name: exec.full_name,
    executive_role: exec.role,
    remark: remarkText.trim(),
    flagged_urgent: flaggedUrgent,
    created_at: new Date().toISOString(),
  };

  const updatedList = [newRemark, ...remarks];
  await setStoredItem(EXECUTIVE_REMARKS_KEY, updatedList);
  return newRemark;
}

/* ==========================================
   Company Notes & Expense Directives CRUD
   ========================================== */

export async function fetchCompanyNotes(): Promise<CompanyNote[]> {
  return await getStoredItem<CompanyNote[]>(COMPANY_NOTES_KEY, []);
}

export interface CreateCompanyNoteInput {
  author_id: string;
  author_name: string;
  author_role: string;
  title: string;
  content: string;
  category: NoteCategory;
  is_pinned?: boolean;
  amount?: number;
  date?: string;
}

export async function createCompanyNote(input: CreateCompanyNoteInput): Promise<CompanyNote> {
  const notes = await fetchCompanyNotes();
  const newNote: CompanyNote = {
    id: `note-${Date.now()}`,
    author_id: input.author_id,
    author_name: input.author_name,
    author_role: input.author_role,
    title: input.title.trim(),
    content: input.content.trim(),
    category: input.category,
    is_pinned: !!input.is_pinned,
    amount: input.amount ? Number(input.amount) : undefined,
    date: input.date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newNote, ...notes];
  await setStoredItem(COMPANY_NOTES_KEY, updated);
  return newNote;
}

export async function deleteCompanyNote(id: string): Promise<void> {
  const notes = await fetchCompanyNotes();
  const filtered = notes.filter((n) => n.id !== id);
  await setStoredItem(COMPANY_NOTES_KEY, filtered);
}

export async function togglePinCompanyNote(id: string): Promise<CompanyNote> {
  const notes = await fetchCompanyNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error('Note not found.');
  notes[idx].is_pinned = !notes[idx].is_pinned;
  notes[idx].updated_at = new Date().toISOString();
  await setStoredItem(COMPANY_NOTES_KEY, notes);
  return notes[idx];
}

/* ==========================================
   Product Sales & Doctor/Center Ledger CRUD
   ========================================== */

const PRODUCT_SALES_KEY = 'company_product_sales_records';
const MONTHLY_BUDGETS_KEY = 'company_monthly_budgets';
const CUSTOM_EXCEL_PRESETS_KEY = 'company_custom_excel_presets';

export async function fetchSalesRecords(): Promise<ProductSaleRecord[]> {
  const records = await getStoredItem<ProductSaleRecord[]>(PRODUCT_SALES_KEY, []);
  // If previously saved fake initial data exists (sale-001), clear it
  if (records.some((r) => r.id === 'sale-001' || r.id === 'sale-002')) {
    const cleaned = records.filter((r) => !r.id.startsWith('sale-00'));
    await setStoredItem(PRODUCT_SALES_KEY, cleaned);
    return cleaned;
  }
  return records;
}

export interface CreateSaleInput {
  product_name: string;
  product_model?: string;
  doctor_name: string;
  hospital_center_name: string;
  location_district: string;
  sale_value: number;
  sale_date?: string;
  quantity?: number;
  payment_status: ProductSaleRecord['payment_status'];
  paid_amount?: number;
  due_amount?: number;
  delivery_status: ProductSaleRecord['delivery_status'];
  warranty_period?: string;
  recorded_by: string;
  notes?: string;
}

export async function createSalesRecord(input: CreateSaleInput): Promise<ProductSaleRecord> {
  const existing = await fetchSalesRecords();
  const saleValue = Number(input.sale_value) || 0;
  const paid = input.paid_amount !== undefined ? Number(input.paid_amount) : (input.payment_status === 'full_paid' ? saleValue : (input.payment_status === 'due' ? 0 : Math.round(saleValue * 0.5)));
  const due = input.due_amount !== undefined ? Number(input.due_amount) : Math.max(0, saleValue - paid);

  const newRecord: ProductSaleRecord = {
    id: `sale-${Date.now()}`,
    product_name: input.product_name.trim(),
    product_model: (input.product_model || 'Standard Edition').trim(),
    doctor_name: input.doctor_name.trim(),
    hospital_center_name: input.hospital_center_name.trim(),
    location_district: (input.location_district || 'Dhaka').trim(),
    sale_value: saleValue,
    sale_date: input.sale_date || new Date().toISOString().split('T')[0],
    quantity: Number(input.quantity) || 1,
    payment_status: input.payment_status,
    paid_amount: paid,
    due_amount: due,
    delivery_status: input.delivery_status,
    warranty_period: (input.warranty_period || '1 Year Standard').trim(),
    recorded_by: input.recorded_by,
    notes: input.notes?.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newRecord, ...existing];
  await setStoredItem(PRODUCT_SALES_KEY, updated);
  return newRecord;
}

export async function deleteSalesRecord(id: string): Promise<void> {
  const existing = await fetchSalesRecords();
  const filtered = existing.filter((s) => s.id !== id);
  await setStoredItem(PRODUCT_SALES_KEY, filtered);
}

export async function fetchMonthlyBudget(monthKey: string): Promise<number> {
  const budgets = await getStoredItem<Record<string, number>>(MONTHLY_BUDGETS_KEY, {});
  // Default budget ৳ 500,000 if not explicitly saved
  return budgets[monthKey] ?? 500000;
}

export async function saveMonthlyBudget(monthKey: string, amount: number): Promise<void> {
  const budgets = await getStoredItem<Record<string, number>>(MONTHLY_BUDGETS_KEY, {});
  budgets[monthKey] = amount;
  await setStoredItem(MONTHLY_BUDGETS_KEY, budgets);
}

export async function fetchCustomExcelPresets(): Promise<CustomExcelPreset[]> {
  const presets = await getStoredItem<CustomExcelPreset[]>(CUSTOM_EXCEL_PRESETS_KEY, []);
  if (presets.some((p) => p.id === 'preset-sales-all' || p.id === 'preset-tada-summary')) {
    const cleaned = presets.filter((p) => !p.id.startsWith('preset-'));
    await setStoredItem(CUSTOM_EXCEL_PRESETS_KEY, cleaned);
    return cleaned;
  }
  return presets;
}

export async function saveCustomExcelPreset(preset: Omit<CustomExcelPreset, 'id' | 'created_at'>): Promise<CustomExcelPreset> {
  const existing = await fetchCustomExcelPresets();
  const newPreset: CustomExcelPreset = {
    ...preset,
    id: `preset-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  await setStoredItem(CUSTOM_EXCEL_PRESETS_KEY, [newPreset, ...existing]);
  return newPreset;
}

export async function deleteCustomExcelPreset(id: string): Promise<void> {
  const existing = await fetchCustomExcelPresets();
  const filtered = existing.filter((p) => p.id !== id);
  await setStoredItem(CUSTOM_EXCEL_PRESETS_KEY, filtered);
}

