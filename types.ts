
export interface Division {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_gradient: string;
  icon_name: string;
  order_index: number;
}

export interface ProductPart {
  id?: string;
  product_id?: string;
  name: string;
  description: string;
  image_url: string;
  order_index?: number;
}

export interface Product {
  id: string;
  division_id: string;
  name: string;
  model_number: string;
  slug: string;
  short_description: string;
  long_description: string;
  main_image: string;
  image_gallery: string[];
  category_tag: string;
  technical_specs: Record<string, string>;
  brochure_url?: string;
  video_url?: string;
  show_video?: boolean;
  warranty_info?: string;
  is_published: boolean;
  primary_keyword?: string;
  related_keywords?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  parts?: ProductPart[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  tags?: string[];
  gallery?: string[];
}

export interface Inquiry {
  id: string;
  product_id?: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: 'pending' | 'reviewed' | 'archived';
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
}

export interface Alliance {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  country: string;
  specialization: string;
  description: string;
  certifications: string[];
  category: string;
  is_featured: boolean;
  created_at: string;
  website_url?: string;
}

export type EmployeeRole = 'Engineer' | 'Technician' | 'Employee';
export type EmployeeStatus = 'active' | 'inactive' | 'suspended';

export interface Employee {
  id: string;
  auth_user_id?: string;
  employee_id: string;
  full_name: string;
  username: string;
  auth_email: string;
  designation: string;
  department: string;
  phone_number: string;
  joining_date: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  accessible_modules: string[];
  profile_picture?: string;
  address?: string;
  emergency_contact?: string;
  permitted_edit_fields?: string[]; // e.g. ['phone_number', 'address', 'emergency_contact', 'profile_picture']
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProfileUpdateRequest {
  id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  field_name: string;
  field_label: string;
  current_value: string;
  requested_value: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

export type DutyStatus = 'not_started' | 'in_progress' | 'completed';
export type DutyPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkNote {
  id: string;
  note: string;
  author: string;
  created_at: string;
}

export interface DutyAttachment {
  name: string;
  url: string;
}

export interface CompletionDetails {
  completed_at: string;
  completion_notes: string;
  parts_used_or_summary?: string;
}

export interface AssignedDuty {
  id: string;
  employee_id: string; // Employee.id
  employee_name: string;
  employee_code: string;
  title: string;
  description: string;
  location: string;
  priority: DutyPriority;
  assigned_date: string;
  deadline: string;
  instructions?: string;
  attachments?: DutyAttachment[];
  status: DutyStatus;
  acknowledged_at?: string;
  work_notes?: WorkNote[];
  completion_details?: CompletionDetails;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmployeeDuty {
  id: string;
  title: string;
  time?: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  completed_at?: string;
}

export interface EmployeeTask {
  id: string;
  title: string;
  category: string;
  due_date?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'completed';
  completed_at?: string;
  created_at: string;
}

export interface DailyServiceReport {
  id: string;
  title: string;
  date: string;
  equipment_client?: string;
  summary: string;
  hours_logged: number;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
}

export interface EmployeeWorkspaceData {
  duties: EmployeeDuty[];
  tasks: EmployeeTask[];
  reports: DailyServiceReport[];
}

/* ==========================================
   Phase 05: Daily Work Activity Report Types
   ========================================== */
export type DailyReportStatus = 'draft' | 'submitted' | 'approved' | 'correction_requested';

export interface DailyWorkReportAttachment {
  name: string;
  url: string;
}

export interface ReportHistoryItem {
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface DailyWorkReport {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  report_date: string; // YYYY-MM-DD
  work_summary: string;
  tasks_completed: string;
  tasks_pending: string;
  work_location: string;
  equipment_worked: string;
  client_hospital: string;
  problems_encountered: string;
  additional_notes: string;
  attachments?: DailyWorkReportAttachment[];
  status: DailyReportStatus;
  admin_remarks?: string;
  allow_duplicate?: boolean; // Set by Admin to permit re-submitting for same date
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  history?: ReportHistoryItem[];
}

/* ==========================================
   Phase 06: TA/DA & Expense Claim Types
   ========================================== */
export type TaDaClaimStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid';

export interface ExpenseAttachment {
  name: string;
  url: string;
}

export interface TaDaClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  title: string;
  travel_start_date: string;
  travel_end_date: string;
  origin: string;
  destination: string;
  travel_allowance: number;
  daily_allowance: number;
  transportation_expense: number;
  accommodation_food_expense: number;
  total_amount: number;
  bills_receipts?: ExpenseAttachment[];
  remarks?: string;
  status: TaDaClaimStatus;
  payment_status: PaymentStatus;
  admin_remarks?: string;
  submitted_at?: string;
  reviewed_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

/* ==========================================
   Phase 09: Executive Management Types
   ========================================== */
export type ExecutiveRole = 'Chairman' | 'MD' | 'Director' | 'Executive';
export type ExecutiveStatus = 'active' | 'inactive';

export interface ExecutiveAccount {
  id: string;
  auth_user_id?: string;
  full_name: string;
  username: string; // e.g. chairman@exec, md@exec, director@exec
  auth_email: string;
  title_designation: string; // e.g. "Chairman & Founder", "Managing Director (MD)", "Director of Operations"
  role: ExecutiveRole;
  accessible_departments: string[]; // ['all'] or array of department names
  phone_number?: string;
  status: ExecutiveStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type DecisionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DecisionStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export interface ManagementDecision {
  id: string;
  executive_id: string;
  executive_name: string;
  executive_role: ExecutiveRole;
  title: string;
  description: string;
  target_department: string;
  assigned_manager_name?: string;
  priority: DecisionPriority;
  status: DecisionStatus;
  deadline?: string;
  remarks?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  related_report_id?: string;
  related_employee_id?: string;
}

export interface ExecutiveRemark {
  id: string;
  report_id: string;
  executive_id: string;
  executive_name: string;
  executive_role: ExecutiveRole;
  remark: string;
  flagged_urgent?: boolean;
  created_at: string;
}

export type NoteCategory = 'expense' | 'policy' | 'operational' | 'urgent' | 'general';

export interface CompanyNote {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  title: string;
  content: string;
  category: NoteCategory;
  is_pinned?: boolean;
  amount?: number;
  date: string;
  created_at: string;
  updated_at: string;
}

/* ==========================================
   Product Sales & Doctor/Center Ledger Types
   ========================================== */
export type SaleDeliveryStatus = 'delivered' | 'installed' | 'under_warranty' | 'pending';
export type SalePaymentStatus = 'full_paid' | 'partial' | 'due';

export interface ProductSaleRecord {
  id: string;
  product_name: string;
  product_model: string;
  doctor_name: string;
  hospital_center_name: string;
  location_district: string;
  sale_value: number;
  sale_date: string; // YYYY-MM-DD
  quantity: number;
  payment_status: SalePaymentStatus;
  paid_amount: number;
  due_amount: number;
  delivery_status: SaleDeliveryStatus;
  warranty_period: string; // e.g. "1 Year Comprehensive", "2 Years Service"
  recorded_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudgetRecord {
  month_key: string; // e.g. "2026-11"
  budget_amount: number;
  notes?: string;
  updated_by?: string;
  updated_at: string;
}

export interface CustomExcelPreset {
  id: string;
  name: string;
  dataset: 'sales' | 'tada' | 'notes' | 'hishab';
  columns: string[];
  created_at: string;
}




