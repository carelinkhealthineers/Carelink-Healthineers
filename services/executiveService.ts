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
  StockItem,
  CompanyAssetItem,
  AssetCondition,
  CompanyDraft,
  DraftAttachment,
  DraftColorTag,
  CompanyInvestment,
  StockRequest,
  Employee,
} from '../types';
import { emitNotification } from './notificationService';

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
    throw new Error(`Failed to save ${key}: ${error.message}`);
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

  await emitNotification({
    title: 'New Management Decision',
    message: `${newDecision.executive_name} issued "${newDecision.title}" for ${newDecision.target_department} (${newDecision.priority.toUpperCase()}).`,
    category: 'decision',
    priority: newDecision.priority === 'urgent' ? 'urgent' : newDecision.priority === 'high' ? 'high' : 'normal',
    audiences: ['admin', 'executive'],
    actor_name: newDecision.executive_name,
    actor_role: newDecision.executive_role,
    link_tab: 'decisions',
  });

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

  await emitNotification({
    title: `Decision Status: ${status.replace('_', ' ').toUpperCase()}`,
    message: `Decision "${updated.title}" (${updated.target_department}) updated to ${status.replace('_', ' ')}.`,
    category: 'decision',
    priority: status === 'completed' ? 'high' : 'normal',
    audiences: ['admin', 'executive'],
    actor_name: 'Executive Desk',
    link_tab: 'decisions',
  });

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

  await emitNotification({
    title: flaggedUrgent ? 'URGENT Executive Remark Added' : 'New Executive Remark on Report',
    message: `${exec.full_name} commented on report #${reportId}: "${remarkText.trim().slice(0, 120)}"`,
    category: 'report',
    priority: flaggedUrgent ? 'urgent' : 'high',
    audiences: ['admin', 'executive'],
    actor_name: exec.full_name,
    actor_role: exec.role,
    link_tab: 'reports',
  });

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

  const isExpense = newNote.category === 'expense' || (newNote.amount && newNote.amount > 0);
  await emitNotification({
    title: isExpense
      ? `Company Expense Logged (Tk ${Number(newNote.amount || 0).toLocaleString()})`
      : `Company Note: ${newNote.title}`,
    message: `${newNote.author_name}: ${newNote.title} — ${newNote.content.slice(0, 110)}`,
    category: 'note',
    priority: newNote.category === 'urgent' ? 'urgent' : 'normal',
    audiences: ['admin', 'executive'],
    actor_name: newNote.author_name,
    actor_role: newNote.author_role,
    link_tab: isExpense ? 'hishab' : 'notes',
  });

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

  await emitNotification({
    title: 'New Equipment Sale Recorded',
    message: `${newRecord.product_name} sold to ${newRecord.doctor_name} (${newRecord.hospital_center_name}) · Value: Tk ${newRecord.sale_value.toLocaleString()} · Due: Tk ${newRecord.due_amount.toLocaleString()}`,
    category: 'sales',
    priority: 'high',
    audiences: ['executive', 'admin'],
    actor_name: newRecord.recorded_by || 'Executive Desk',
    link_tab: 'sales',
  });

  return newRecord;
}

export async function updateSalesRecord(
  id: string,
  updates: Partial<ProductSaleRecord>
): Promise<ProductSaleRecord> {
  const existing = await fetchSalesRecords();
  const idx = existing.findIndex((s) => s.id === id);
  if (idx === -1) {
    throw new Error('Sale record not found.');
  }

  const current = existing[idx];
  const nextSaleVal = updates.sale_value !== undefined ? Number(updates.sale_value) || 0 : current.sale_value;
  const nextPaid = updates.paid_amount !== undefined ? Number(updates.paid_amount) || 0 : current.paid_amount;
  const nextDue =
    updates.due_amount !== undefined && updates.sale_value === undefined && updates.paid_amount === undefined
      ? Number(updates.due_amount) || 0
      : Math.max(0, nextSaleVal - nextPaid);

  let nextPaymentStatus = updates.payment_status || current.payment_status;
  if (updates.sale_value !== undefined || updates.paid_amount !== undefined) {
    if (nextSaleVal > 0 && nextPaid >= nextSaleVal) nextPaymentStatus = 'full_paid';
    else if (nextPaid <= 0) nextPaymentStatus = 'due';
    else nextPaymentStatus = 'partial';
  }

  const updated: ProductSaleRecord = {
    ...current,
    ...updates,
    sale_value: nextSaleVal,
    paid_amount: nextPaid,
    due_amount: nextDue,
    payment_status: nextPaymentStatus,
    updated_at: new Date().toISOString(),
  };

  existing[idx] = updated;
  await setStoredItem(PRODUCT_SALES_KEY, existing);

  await emitNotification({
    title: 'Sales Ledger Record Updated',
    message: `${updated.product_name} (${updated.doctor_name}) updated · Paid: Tk ${updated.paid_amount.toLocaleString()} · Due: Tk ${updated.due_amount.toLocaleString()}`,
    category: 'sales',
    priority: 'normal',
    audiences: ['executive', 'admin'],
    actor_name: 'Sales Ledger',
    link_tab: 'sales',
  });

  return updated;
}

export async function deleteSalesRecord(id: string): Promise<void> {
  const existing = await fetchSalesRecords();
  const filtered = existing.filter((s) => s.id !== id);
  await setStoredItem(PRODUCT_SALES_KEY, filtered);
}

export async function fetchAllMonthlyBudgets(): Promise<Record<string, number>> {
  return await getStoredItem<Record<string, number>>(MONTHLY_BUDGETS_KEY, {});
}

export async function fetchMonthlyBudget(monthKey: string): Promise<number> {
  const budgets = await getStoredItem<Record<string, number>>(MONTHLY_BUDGETS_KEY, {});
  // Default budget ৳ 500,000 if not explicitly saved
  return budgets[monthKey] ?? 500000;
}

export async function saveMonthlyBudget(monthKey: string, amount: number): Promise<Record<string, number>> {
  const budgets = await getStoredItem<Record<string, number>>(MONTHLY_BUDGETS_KEY, {});
  budgets[monthKey] = amount;
  await setStoredItem(MONTHLY_BUDGETS_KEY, budgets);

  await emitNotification({
    title: `Monthly Budget Updated (${monthKey})`,
    message: `Allocated budget for ${monthKey} set to Tk ${amount.toLocaleString()}.`,
    category: 'budget',
    priority: 'normal',
    audiences: ['executive', 'admin'],
    actor_name: 'Executive Financial Hub',
    link_tab: 'hishab',
  });

  return budgets;
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

/* ==========================================
   Stock & Inventory CRUD (Auto Expense Sync)
   ========================================== */

const STOCK_ITEMS_KEY = 'company_stock_items';
const STOCK_SEGMENTS_KEY = 'company_stock_segments';

export const DEFAULT_STOCK_SEGMENTS = ['Kits', 'Electronics', 'Scissors'];

export async function fetchStockSegments(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', STOCK_SEGMENTS_KEY)
      .maybeSingle();

    if (error) {
      return [...DEFAULT_STOCK_SEGMENTS];
    }
    if (!data || data.value === null || data.value === undefined) {
      return [...DEFAULT_STOCK_SEGMENTS];
    }
    const parsed = JSON.parse(data.value);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => String(s).trim()).filter(Boolean);
    }
    return [...DEFAULT_STOCK_SEGMENTS];
  } catch {
    return [...DEFAULT_STOCK_SEGMENTS];
  }
}

export async function addStockSegment(segmentName: string): Promise<string[]> {
  const clean = segmentName.trim();
  if (!clean) {
    throw new Error('Segment name cannot be empty.');
  }
  const existing = await fetchStockSegments();
  const alreadyExists = existing.some((s) => s.toLowerCase() === clean.toLowerCase());
  if (alreadyExists) {
    return existing;
  }
  const updated = [...existing, clean];
  await setStoredItem(STOCK_SEGMENTS_KEY, updated);
  return updated;
}

export async function deleteStockSegment(segmentName: string): Promise<string[]> {
  const existing = await fetchStockSegments();
  const updated = existing.filter((s) => s.toLowerCase() !== segmentName.trim().toLowerCase());
  await setStoredItem(STOCK_SEGMENTS_KEY, updated);
  return updated;
}

export async function clearEmptyStockSegments(usedSegmentNames: string[]): Promise<string[]> {
  const usedSet = new Set(usedSegmentNames.map((s) => s.trim().toLowerCase()).filter(Boolean));
  const existing = await fetchStockSegments();
  const updated = existing.filter((s) => usedSet.has(s.toLowerCase()));
  await setStoredItem(STOCK_SEGMENTS_KEY, updated);
  return updated;
}

export async function fetchStockItems(): Promise<StockItem[]> {
  return await getStoredItem<StockItem[]>(STOCK_ITEMS_KEY, []);
}

export interface CreateStockItemInput {
  name: string;
  sku_or_model?: string;
  category?: string;
  quantity: number;
  unit_label?: string;
  buying_price: number; // Per-unit buying price
  purchase_date?: string;
  supplier_name?: string;
  picture_url?: string;
  notes?: string;
  add_to_expense?: boolean;
}

export async function createStockItem(
  input: CreateStockItemInput,
  exec: ExecutiveAccount
): Promise<{ item: StockItem; expenseNote: CompanyNote | null }> {
  const existing = await fetchStockItems();
  const qty = Math.max(0, Number(input.quantity) || 0);
  const unitPrice = Math.max(0, Number(input.buying_price) || 0);
  const totalCost = Math.round(qty * unitPrice);
  const unitLabel = (input.unit_label || 'pcs').trim() || 'pcs';
  const purchaseDate = input.purchase_date || new Date().toISOString().split('T')[0];
  const shouldAddExpense = input.add_to_expense !== false && totalCost > 0;

  let expenseNote: CompanyNote | null = null;
  if (shouldAddExpense) {
    const detailsParts = [
      `Stock purchase: ${qty} ${unitLabel} × Tk ${unitPrice.toLocaleString()}`,
      input.sku_or_model ? `Model/SKU: ${input.sku_or_model.trim()}` : '',
      input.supplier_name ? `Supplier: ${input.supplier_name.trim()}` : '',
      input.notes ? `Notes: ${input.notes.trim()}` : '',
    ].filter(Boolean);

    expenseNote = await createCompanyNote({
      author_id: exec.id,
      author_name: exec.full_name,
      author_role: exec.role,
      title: `Stock Purchase: ${input.name.trim()} (${qty} ${unitLabel})`,
      content: detailsParts.join(' · '),
      category: 'expense',
      amount: totalCost,
      date: purchaseDate,
    });
  }

  const nowIso = new Date().toISOString();
  const newItem: StockItem = {
    id: `stk-${Date.now()}`,
    name: input.name.trim(),
    sku_or_model: input.sku_or_model?.trim() || '',
    category: input.category?.trim() || '',
    quantity: qty,
    unit_label: unitLabel,
    buying_price: unitPrice,
    total_expense_logged: expenseNote ? totalCost : 0,
    purchase_date: purchaseDate,
    supplier_name: input.supplier_name?.trim() || '',
    picture_url: input.picture_url || '',
    notes: input.notes?.trim() || '',
    linked_expense_note_ids: expenseNote ? [expenseNote.id] : [],
    created_by: exec.full_name,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const updated = [newItem, ...existing];
  await setStoredItem(STOCK_ITEMS_KEY, updated);

  if (!expenseNote) {
    await emitNotification({
      title: `New Stock Added: ${newItem.name}`,
      message: `${exec.full_name} added ${qty} ${unitLabel} to Stock (Buying Price: Tk ${unitPrice.toLocaleString()}).`,
      category: 'stock',
      priority: 'normal',
      audiences: ['executive', 'admin'],
      actor_name: exec.full_name,
      actor_role: exec.role,
      link_tab: 'stock',
    });
  }

  return { item: newItem, expenseNote };
}

export interface RestockInput {
  added_quantity: number;
  buying_price: number;
  purchase_date?: string;
  supplier_name?: string;
  notes?: string;
  add_to_expense?: boolean;
}

export async function restockStockItem(
  id: string,
  input: RestockInput,
  exec: ExecutiveAccount
): Promise<{ item: StockItem; expenseNote: CompanyNote | null }> {
  const existing = await fetchStockItems();
  const idx = existing.findIndex((s) => s.id === id);
  if (idx === -1) {
    throw new Error('Stock item not found.');
  }

  const current = existing[idx];
  const addedQty = Math.max(0, Number(input.added_quantity) || 0);
  const unitPrice = Math.max(0, Number(input.buying_price) || 0);
  const purchaseCost = Math.round(addedQty * unitPrice);
  const purchaseDate = input.purchase_date || new Date().toISOString().split('T')[0];
  const shouldAddExpense = input.add_to_expense !== false && purchaseCost > 0;

  let expenseNote: CompanyNote | null = null;
  if (shouldAddExpense) {
    const detailsParts = [
      `Restock purchase: +${addedQty} ${current.unit_label || 'pcs'} × Tk ${unitPrice.toLocaleString()}`,
      input.supplier_name ? `Supplier: ${input.supplier_name.trim()}` : current.supplier_name ? `Supplier: ${current.supplier_name}` : '',
      input.notes ? `Notes: ${input.notes.trim()}` : '',
    ].filter(Boolean);

    expenseNote = await createCompanyNote({
      author_id: exec.id,
      author_name: exec.full_name,
      author_role: exec.role,
      title: `Stock Purchase: ${current.name} (+${addedQty} ${current.unit_label || 'pcs'})`,
      content: detailsParts.join(' · '),
      category: 'expense',
      amount: purchaseCost,
      date: purchaseDate,
    });
  }

  const updatedItem: StockItem = {
    ...current,
    quantity: (Number(current.quantity) || 0) + addedQty,
    buying_price: unitPrice > 0 ? unitPrice : current.buying_price,
    total_expense_logged: (Number(current.total_expense_logged) || 0) + (expenseNote ? purchaseCost : 0),
    purchase_date: purchaseDate,
    supplier_name: input.supplier_name?.trim() || current.supplier_name,
    linked_expense_note_ids: expenseNote
      ? [...(current.linked_expense_note_ids || []), expenseNote.id]
      : current.linked_expense_note_ids || [],
    updated_at: new Date().toISOString(),
  };

  existing[idx] = updatedItem;
  await setStoredItem(STOCK_ITEMS_KEY, existing);

  return { item: updatedItem, expenseNote };
}

export async function updateStockItem(
  id: string,
  updates: Partial<StockItem>
): Promise<StockItem> {
  const existing = await fetchStockItems();
  const idx = existing.findIndex((s) => s.id === id);
  if (idx === -1) {
    throw new Error('Stock item not found.');
  }

  const current = existing[idx];
  const updated: StockItem = {
    ...current,
    ...updates,
    quantity: updates.quantity !== undefined ? Math.max(0, Number(updates.quantity) || 0) : current.quantity,
    buying_price:
      updates.buying_price !== undefined ? Math.max(0, Number(updates.buying_price) || 0) : current.buying_price,
    updated_at: new Date().toISOString(),
  };

  existing[idx] = updated;
  await setStoredItem(STOCK_ITEMS_KEY, existing);
  return updated;
}

export async function deleteStockItem(
  id: string,
  alsoDeleteLinkedExpenses: boolean = false
): Promise<string[]> {
  const existing = await fetchStockItems();
  const target = existing.find((s) => s.id === id);
  const filtered = existing.filter((s) => s.id !== id);
  await setStoredItem(STOCK_ITEMS_KEY, filtered);

  const deletedNoteIds: string[] = [];
  if (alsoDeleteLinkedExpenses && target?.linked_expense_note_ids?.length) {
    const notes = await fetchCompanyNotes();
    const toRemove = new Set(target.linked_expense_note_ids);
    const remainingNotes = notes.filter((n) => !toRemove.has(n.id));
    if (remainingNotes.length !== notes.length) {
      await setStoredItem(COMPANY_NOTES_KEY, remainingNotes);
      target.linked_expense_note_ids.forEach((nid) => deletedNoteIds.push(nid));
    }
  }

  return deletedNoteIds;
}

/* ==========================================
   Company Assets CRUD (No Expense Sync)
   ========================================== */

const COMPANY_ASSETS_KEY = 'company_asset_items';
const COMPANY_ASSET_SEGMENTS_KEY = 'company_asset_segments';

export const DEFAULT_ASSET_SEGMENTS = [
  'Office Equipment',
  'Furniture & Fixtures',
  'IT & Electronics',
  'Lab & Demo',
];

export async function fetchAssetSegments(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', COMPANY_ASSET_SEGMENTS_KEY)
      .maybeSingle();

    if (error || !data || data.value === null || data.value === undefined) {
      return [...DEFAULT_ASSET_SEGMENTS];
    }
    const parsed = JSON.parse(data.value);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => String(s).trim()).filter(Boolean);
    }
    return [...DEFAULT_ASSET_SEGMENTS];
  } catch {
    return [...DEFAULT_ASSET_SEGMENTS];
  }
}

export async function addAssetSegment(segmentName: string): Promise<string[]> {
  const clean = segmentName.trim();
  if (!clean) {
    throw new Error('Segment name cannot be empty.');
  }
  const existing = await fetchAssetSegments();
  const alreadyExists = existing.some((s) => s.toLowerCase() === clean.toLowerCase());
  if (alreadyExists) {
    return existing;
  }
  const updated = [...existing, clean];
  await setStoredItem(COMPANY_ASSET_SEGMENTS_KEY, updated);
  return updated;
}

export async function deleteAssetSegment(segmentName: string): Promise<string[]> {
  const existing = await fetchAssetSegments();
  const updated = existing.filter((s) => s.toLowerCase() !== segmentName.trim().toLowerCase());
  await setStoredItem(COMPANY_ASSET_SEGMENTS_KEY, updated);
  return updated;
}

export async function clearEmptyAssetSegments(usedSegmentNames: string[]): Promise<string[]> {
  const usedSet = new Set(usedSegmentNames.map((s) => s.trim().toLowerCase()).filter(Boolean));
  const existing = await fetchAssetSegments();
  const updated = existing.filter((s) => usedSet.has(s.toLowerCase()));
  await setStoredItem(COMPANY_ASSET_SEGMENTS_KEY, updated);
  return updated;
}

export async function fetchCompanyAssets(): Promise<CompanyAssetItem[]> {
  return await getStoredItem<CompanyAssetItem[]>(COMPANY_ASSETS_KEY, []);
}

export interface CreateCompanyAssetInput {
  name: string;
  asset_code?: string;
  category?: string;
  quantity: number;
  unit_label?: string;
  asset_price: number; // Per-unit company asset price in BDT (NOT added to expenses)
  acquired_date?: string;
  location_or_holder?: string;
  condition?: AssetCondition;
  picture_url?: string;
  notes?: string;
}

export async function createCompanyAsset(
  input: CreateCompanyAssetInput,
  exec: ExecutiveAccount
): Promise<CompanyAssetItem> {
  const existing = await fetchCompanyAssets();
  const qty = Math.max(0, Number(input.quantity) || 0);
  const unitPrice = Math.max(0, Number(input.asset_price) || 0);
  const unitLabel = (input.unit_label || 'pcs').trim() || 'pcs';
  const acquiredDate = input.acquired_date || new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  const newAsset: CompanyAssetItem = {
    id: `ast-${Date.now()}`,
    name: input.name.trim(),
    asset_code: input.asset_code?.trim() || '',
    category: input.category?.trim() || '',
    quantity: qty,
    unit_label: unitLabel,
    asset_price: unitPrice,
    acquired_date: acquiredDate,
    location_or_holder: input.location_or_holder?.trim() || '',
    condition: input.condition || 'good',
    picture_url: input.picture_url || '',
    notes: input.notes?.trim() || '',
    created_by: exec.full_name,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const updated = [newAsset, ...existing];
  await setStoredItem(COMPANY_ASSETS_KEY, updated);

  await emitNotification({
    title: `New Company Asset Added: ${newAsset.name}`,
    message: `${exec.full_name} recorded ${qty} ${unitLabel} in Company Assets (Asset Price: Tk ${unitPrice.toLocaleString()}).`,
    category: 'assets',
    priority: 'normal',
    audiences: ['executive', 'admin'],
    actor_name: exec.full_name,
    actor_role: exec.role,
    link_tab: 'assets',
  });

  return newAsset;
}

export async function updateCompanyAsset(
  id: string,
  updates: Partial<CompanyAssetItem>
): Promise<CompanyAssetItem> {
  const existing = await fetchCompanyAssets();
  const idx = existing.findIndex((a) => a.id === id);
  if (idx === -1) {
    throw new Error('Company asset not found.');
  }

  const current = existing[idx];
  const updated: CompanyAssetItem = {
    ...current,
    ...updates,
    quantity: updates.quantity !== undefined ? Math.max(0, Number(updates.quantity) || 0) : current.quantity,
    asset_price:
      updates.asset_price !== undefined ? Math.max(0, Number(updates.asset_price) || 0) : current.asset_price,
    updated_at: new Date().toISOString(),
  };

  existing[idx] = updated;
  await setStoredItem(COMPANY_ASSETS_KEY, existing);
  return updated;
}

export async function deleteCompanyAsset(id: string): Promise<void> {
  const existing = await fetchCompanyAssets();
  const filtered = existing.filter((a) => a.id !== id);
  await setStoredItem(COMPANY_ASSETS_KEY, filtered);
}

/* ==========================================
   Company Drafts & File Vault CRUD
   ========================================== */

const COMPANY_DRAFTS_KEY = 'company_drafts_vault';

export async function fetchCompanyDrafts(): Promise<CompanyDraft[]> {
  const list = await getStoredItem<CompanyDraft[]>(COMPANY_DRAFTS_KEY, []);
  return list.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });
}

export interface CreateDraftInput {
  title: string;
  content: string;
  color_tag?: DraftColorTag;
  is_pinned?: boolean;
  files?: DraftAttachment[];
  author_name: string;
}

export async function createCompanyDraft(input: CreateDraftInput): Promise<CompanyDraft> {
  const existing = await fetchCompanyDrafts();
  const nowIso = new Date().toISOString();

  const newDraft: CompanyDraft = {
    id: `drf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: input.title.trim() || 'Untitled Draft',
    content: input.content.trim(),
    color_tag: input.color_tag || 'sky',
    is_pinned: Boolean(input.is_pinned),
    files: input.files || [],
    author_name: input.author_name || 'Executive Desk',
    created_at: nowIso,
    updated_at: nowIso,
  };

  await setStoredItem(COMPANY_DRAFTS_KEY, [newDraft, ...existing]);
  return newDraft;
}

export async function updateCompanyDraft(
  id: string,
  updates: Partial<Omit<CompanyDraft, 'id' | 'created_at'>>
): Promise<CompanyDraft> {
  const existing = await fetchCompanyDrafts();
  const idx = existing.findIndex((d) => d.id === id);
  if (idx === -1) {
    throw new Error('Draft not found.');
  }

  const current = existing[idx];
  const updated: CompanyDraft = {
    ...current,
    ...updates,
    title: updates.title !== undefined ? updates.title.trim() || 'Untitled Draft' : current.title,
    content: updates.content !== undefined ? updates.content : current.content,
    updated_at: new Date().toISOString(),
  };

  existing[idx] = updated;
  await setStoredItem(COMPANY_DRAFTS_KEY, existing);
  return updated;
}

export async function togglePinCompanyDraft(id: string): Promise<CompanyDraft> {
  const existing = await fetchCompanyDrafts();
  const target = existing.find((d) => d.id === id);
  if (!target) {
    throw new Error('Draft not found.');
  }
  return await updateCompanyDraft(id, { is_pinned: !target.is_pinned });
}

export async function deleteCompanyDraft(id: string): Promise<void> {
  const existing = await fetchCompanyDrafts();
  const filtered = existing.filter((d) => d.id !== id);
  await setStoredItem(COMPANY_DRAFTS_KEY, filtered);
}

/* ==========================================
   Company Investments & MD Capital CRUD
   ========================================== */

const COMPANY_INVESTMENTS_KEY = 'company_investments';

export async function fetchCompanyInvestments(): Promise<CompanyInvestment[]> {
  const list = await getStoredItem<CompanyInvestment[]>(COMPANY_INVESTMENTS_KEY, []);
  return list.sort((a, b) => {
    const dateDiff = (b.invest_date || '').localeCompare(a.invest_date || '');
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export interface CreateInvestmentInput {
  investor_name: string;
  investor_role?: string;
  amount: number;
  invest_date?: string;
  payment_method?: string;
  purpose?: string;
  notes?: string;
}

export async function createCompanyInvestment(
  input: CreateInvestmentInput,
  exec: ExecutiveAccount
): Promise<CompanyInvestment> {
  const existing = await fetchCompanyInvestments();
  const amount = Math.max(0, Number(input.amount) || 0);
  const investDate = input.invest_date || new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  const newEntry: CompanyInvestment = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    investor_name: input.investor_name.trim(),
    investor_role: (input.investor_role || 'MD').trim() || 'MD',
    amount,
    invest_date: investDate,
    payment_method: (input.payment_method || 'Bank Transfer').trim(),
    purpose: input.purpose?.trim() || '',
    notes: input.notes?.trim() || '',
    recorded_by: exec.full_name,
    created_at: nowIso,
    updated_at: nowIso,
  };

  await setStoredItem(COMPANY_INVESTMENTS_KEY, [newEntry, ...existing]);

  await emitNotification({
    title: `New Investment: ${newEntry.investor_name}`,
    message: `${newEntry.investor_name} (${newEntry.investor_role}) invested Tk ${amount.toLocaleString()} on ${investDate}.`,
    category: 'invest',
    priority: 'normal',
    audiences: ['executive', 'admin'],
    actor_name: exec.full_name,
    actor_role: exec.role,
    link_tab: 'invest',
  });

  return newEntry;
}

export async function updateCompanyInvestment(
  id: string,
  updates: Partial<CompanyInvestment>
): Promise<CompanyInvestment> {
  const existing = await fetchCompanyInvestments();
  const idx = existing.findIndex((i) => i.id === id);
  if (idx === -1) {
    throw new Error('Investment record not found.');
  }

  const current = existing[idx];
  const updated: CompanyInvestment = {
    ...current,
    ...updates,
    investor_name:
      updates.investor_name !== undefined ? updates.investor_name.trim() : current.investor_name,
    amount:
      updates.amount !== undefined ? Math.max(0, Number(updates.amount) || 0) : current.amount,
    updated_at: new Date().toISOString(),
  };

  existing[idx] = updated;
  await setStoredItem(COMPANY_INVESTMENTS_KEY, existing);
  return updated;
}

export async function deleteCompanyInvestment(id: string): Promise<void> {
  const existing = await fetchCompanyInvestments();
  const filtered = existing.filter((i) => i.id !== id);
  await setStoredItem(COMPANY_INVESTMENTS_KEY, filtered);
}

/* ==========================================
   Employee Stock Catalog (No Prices) & Stock Requests
   ========================================== */

const STOCK_REQUESTS_KEY = 'company_stock_requests';

export interface EmployeeStockCatalogItem {
  id: string;
  name: string;
  sku_or_model?: string;
  category?: string;
  quantity: number;
  unit_label: string;
  picture_url?: string;
}

/**
 * Returns sanitized stock catalog for employees (strictly omits buying price,
 * expense totals, supplier cost, and financial metadata).
 */
export async function fetchEmployeeStockCatalog(): Promise<EmployeeStockCatalogItem[]> {
  const items = await fetchStockItems();
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    sku_or_model: item.sku_or_model || '',
    category: item.category || '',
    quantity: Math.max(0, Number(item.quantity) || 0),
    unit_label: item.unit_label || 'pcs',
    picture_url: item.picture_url || '',
  }));
}

export async function fetchStockRequests(): Promise<StockRequest[]> {
  const list = await getStoredItem<StockRequest[]>(STOCK_REQUESTS_KEY, []);
  return [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function fetchStockRequestsForEmployee(
  employeeId: string
): Promise<StockRequest[]> {
  const all = await fetchStockRequests();
  return all.filter((r) => r.employee_id === employeeId);
}

export interface CreateStockRequestInput {
  stock_item_id: string;
  requested_qty: number;
  purpose: string;
}

export async function createStockRequest(
  input: CreateStockRequestInput,
  employee: Employee
): Promise<StockRequest> {
  const stockItems = await fetchStockItems();
  const targetItem = stockItems.find((s) => s.id === input.stock_item_id);
  if (!targetItem) {
    throw new Error('Selected stock item could not be found.');
  }

  const availableQty = Math.max(0, Number(targetItem.quantity) || 0);
  const reqQty = Math.floor(Number(input.requested_qty) || 0);
  if (reqQty <= 0) {
    throw new Error('Please enter at least 1 unit to request.');
  }
  if (reqQty > availableQty) {
    throw new Error(
      `Only ${availableQty} ${targetItem.unit_label || 'pcs'} currently in stock.`
    );
  }

  const existingRequests = await fetchStockRequests();
  const nowIso = new Date().toISOString();

  const newReq: StockRequest = {
    id: `sreq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stock_item_id: targetItem.id,
    stock_item_name: targetItem.name,
    stock_item_sku: targetItem.sku_or_model || '',
    stock_item_category: targetItem.category || '',
    unit_label: targetItem.unit_label || 'pcs',
    requested_qty: reqQty,
    employee_id: employee.id,
    employee_name: employee.full_name,
    employee_code: employee.employee_id,
    employee_department: employee.department,
    purpose: input.purpose.trim() || 'Field / Client Requirement',
    status: 'pending',
    created_at: nowIso,
    updated_at: nowIso,
  };

  await setStoredItem(STOCK_REQUESTS_KEY, [newReq, ...existingRequests]);

  await emitNotification({
    title: `Stock Request: ${targetItem.name} (${reqQty} ${newReq.unit_label})`,
    message: `${employee.full_name} (${employee.employee_id}) requested ${reqQty} ${newReq.unit_label} of ${targetItem.name}. Reason: ${newReq.purpose}`,
    category: 'stock',
    priority: 'high',
    audiences: ['executive', 'admin'],
    actor_name: employee.full_name,
    actor_role: employee.designation || 'Employee',
    link_tab: 'stock',
  });

  return newReq;
}

export async function approveStockRequest(
  requestId: string,
  exec: ExecutiveAccount,
  remarks?: string
): Promise<{ request: StockRequest; updatedStockItem: StockItem }> {
  const requests = await fetchStockRequests();
  const reqIdx = requests.findIndex((r) => r.id === requestId);
  if (reqIdx === -1) {
    throw new Error('Stock request not found.');
  }

  const currentReq = requests[reqIdx];
  if (currentReq.status !== 'pending') {
    throw new Error(`This request was already ${currentReq.status}.`);
  }

  const stockItems = await fetchStockItems();
  const stockIdx = stockItems.findIndex((s) => s.id === currentReq.stock_item_id);
  if (stockIdx === -1) {
    throw new Error(`Stock product "${currentReq.stock_item_name}" no longer exists.`);
  }

  const targetStock = stockItems[stockIdx];
  const currentQty = Math.max(0, Number(targetStock.quantity) || 0);
  const deductQty = Math.max(1, Number(currentReq.requested_qty) || 0);

  if (currentQty < deductQty) {
    throw new Error(
      `Insufficient stock for "${targetStock.name}": only ${currentQty} ${targetStock.unit_label || 'pcs'} remaining, but ${deductQty} requested.`
    );
  }

  const nowIso = new Date().toISOString();
  const updatedStockItem: StockItem = {
    ...targetStock,
    quantity: Math.max(0, currentQty - deductQty),
    updated_at: nowIso,
  };

  stockItems[stockIdx] = updatedStockItem;
  await setStoredItem(STOCK_ITEMS_KEY, stockItems);

  const updatedRequest: StockRequest = {
    ...currentReq,
    status: 'approved',
    executive_remarks: remarks?.trim() || '',
    reviewed_by: exec.full_name,
    reviewed_at: nowIso,
    updated_at: nowIso,
  };

  requests[reqIdx] = updatedRequest;
  await setStoredItem(STOCK_REQUESTS_KEY, requests);

  await emitNotification({
    title: `Stock Request Approved: ${updatedRequest.stock_item_name}`,
    message: `${exec.full_name} approved your request for ${deductQty} ${updatedRequest.unit_label} of ${updatedRequest.stock_item_name}.`,
    category: 'stock',
    priority: 'normal',
    audiences: ['employee'],
    target_employee_id: updatedRequest.employee_id,
    actor_name: exec.full_name,
    actor_role: exec.role,
    link_tab: 'stock',
  });

  return { request: updatedRequest, updatedStockItem };
}

export async function rejectStockRequest(
  requestId: string,
  exec: ExecutiveAccount,
  remarks?: string
): Promise<StockRequest> {
  const requests = await fetchStockRequests();
  const reqIdx = requests.findIndex((r) => r.id === requestId);
  if (reqIdx === -1) {
    throw new Error('Stock request not found.');
  }

  const currentReq = requests[reqIdx];
  if (currentReq.status !== 'pending') {
    throw new Error(`This request was already ${currentReq.status}.`);
  }

  const nowIso = new Date().toISOString();
  const updatedRequest: StockRequest = {
    ...currentReq,
    status: 'rejected',
    executive_remarks: remarks?.trim() || '',
    reviewed_by: exec.full_name,
    reviewed_at: nowIso,
    updated_at: nowIso,
  };

  requests[reqIdx] = updatedRequest;
  await setStoredItem(STOCK_REQUESTS_KEY, requests);

  await emitNotification({
    title: `Stock Request Declined: ${updatedRequest.stock_item_name}`,
    message: `${exec.full_name} declined your request for ${updatedRequest.requested_qty} ${updatedRequest.unit_label} of ${updatedRequest.stock_item_name}.${remarks?.trim() ? ` Note: ${remarks.trim()}` : ''}`,
    category: 'stock',
    priority: 'normal',
    audiences: ['employee'],
    target_employee_id: updatedRequest.employee_id,
    actor_name: exec.full_name,
    actor_role: exec.role,
    link_tab: 'stock',
  });

  return updatedRequest;
}

