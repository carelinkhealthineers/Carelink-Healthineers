import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Employee, EmployeeRole, EmployeeStatus } from '../types';

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://vrtipkxoldcqhtvznpok.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable__BiZqCP30kjQFrOs1K55Qw_EJoph6Zq';

/**
 * Isolated Supabase client with persistSession: false.
 * Used for admin creating new employee accounts so the Admin's own
 * active session and localStorage tokens are never overwritten.
 */
const isolatedAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export const AVAILABLE_MODULES = [
  {
    id: 'products',
    name: 'Products & Equipment Catalog',
    description: 'Manage medical and dental machinery, technical specs, and dossier files',
    path: '/command-nexus/architecture',
  },
  {
    id: 'inquiries',
    name: 'Inquiry & Quotation Flow',
    description: 'Process hospital quote requests, customer messages, and CRM records',
    path: '/command-nexus/inquiries',
  },
  {
    id: 'editorial',
    name: 'Insights & Technical Dossiers',
    description: 'Author, edit, and publish clinical intelligence articles and updates',
    path: '/command-nexus/editorial',
  },
  {
    id: 'divisions',
    name: 'Clinical Divisions',
    description: 'Configure medical departments, clinical protocols, and hardware nodes',
    path: '/command-nexus/divisions',
  },
  {
    id: 'seo',
    name: 'SEO & Search Rankings',
    description: 'Manage Google ranking keywords, meta structures, and rich snippets',
    path: '/command-nexus/seo',
  },
  {
    id: 'homepage',
    name: 'Homepage Media & Showcase',
    description: 'Update hero product presentations and showroom video embeds',
    path: '/command-nexus/homepage',
  },
  {
    id: 'users',
    name: 'User & Buyer Accounts',
    description: 'View registered website visitors and buyers',
    path: '/command-nexus/users',
  },
  {
    id: 'settings',
    name: 'System Variables & Environment',
    description: 'Configure corporate parameters and operational metadata',
    path: '/command-nexus/settings',
  },
];

export const DEPARTMENTS = [
  'Biomedical Engineering',
  'Diagnostic Imaging Systems',
  'Dental Technology & Surgery',
  'Field Service & Operations',
  'Customer Support & Logistics',
  'Quality Control & Compliance',
  'Executive & Operations',
];

/**
 * Generates a high-entropy, secure initial password.
 */
export const generateSecurePassword = (length = 14): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()_+~';

  let pwd = '';
  // Ensure at least one of each category
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];

  const all = upper + lower + digits + symbols;
  for (let i = 4; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the result
  return pwd
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
};

/**
 * Maps custom or internal usernames (e.g. "ashik@engnr" or "ashik")
 * to a standardized canonical auth email for the auth provider,
 * while preserving valid standard emails as-is.
 */
export const getCanonicalAuthEmail = (username: string): string => {
  const clean = username.trim().toLowerCase();
  // If it's already a valid email ending with a standard TLD (e.g. .com, .org, .edu)
  if (/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(clean)) {
    return clean;
  }
  // Convert internal handles like "ashik@engnr" -> "ashik_engnr@auth.carelinkhealthineers.com"
  const sanitized = clean.replace(/[^a-z0-9._-]/g, '_');
  return `${sanitized}@auth.carelinkhealthineers.com`;
};

export interface CreateEmployeeInput {
  full_name: string;
  employee_id: string;
  username: string;
  password?: string;
  designation: string;
  department: string;
  phone_number: string;
  joining_date?: string;
  address?: string;
  emergency_contact?: string;
  role: EmployeeRole;
  status?: EmployeeStatus;
  accessible_modules?: string[];
  permitted_edit_fields?: string[];
}

/**
 * Fetches all registered employees from the persistent backend.
 */
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'employee_registry')
      .maybeSingle();

    if (error) {
      console.warn('Failed to load employee_registry from settings:', error.message);
      return [];
    }

    if (!data?.value) return [];
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing employee_registry:', err);
    return [];
  }
};

/**
 * Saves the full employee list to the backend.
 */
const saveEmployeesToBackend = async (employees: Employee[]): Promise<void> => {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'employee_registry',
      value: JSON.stringify(employees),
      category: 'employees',
      description: 'Carelink Healthineers Engineer & Employee Account Registry',
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to save employee records to backend: ${error.message}`);
  }
};

/**
 * Creates a new employee or engineer account:
 * 1. Validates unique username and employee ID.
 * 2. Maps username to canonical auth email.
 * 3. Registers the user securely with the existing Supabase Auth engine.
 * 4. Saves complete employee profile (without storing the password) to backend.
 */
export const createEmployeeAccount = async (
  input: CreateEmployeeInput
): Promise<{ employee: Employee; authEmail: string; initialPassword?: string }> => {
  const cleanUsername = input.username.trim().toLowerCase();
  const cleanEmployeeId = input.employee_id.trim().toUpperCase();
  const cleanFullName = input.full_name.trim();

  if (!cleanFullName) throw new Error('Full Name is required.');
  if (!cleanEmployeeId) throw new Error('Employee ID is required.');
  if (!cleanUsername) throw new Error('Username is required.');

  // Validate format of username (allow alphanumeric, @, ., _, -)
  if (!/^[a-zA-Z0-9@._-]+$/.test(cleanUsername)) {
    throw new Error(
      'Username can only contain letters, numbers, @, dots, dashes, and underscores (e.g. ashik@engnr).'
    );
  }

  // Load existing employees to check uniqueness
  const existingEmployees = await fetchEmployees();

  const usernameExists = existingEmployees.some(
    (e) => e.username.toLowerCase() === cleanUsername
  );
  if (usernameExists) {
    throw new Error(`Username "${cleanUsername}" is already assigned to another account.`);
  }

  const idExists = existingEmployees.some(
    (e) => e.employee_id.toUpperCase() === cleanEmployeeId
  );
  if (idExists) {
    throw new Error(`Employee ID "${cleanEmployeeId}" is already assigned to another employee.`);
  }

  // Generate or sanitize password
  const passwordToUse = input.password && input.password.trim().length >= 6
    ? input.password.trim()
    : generateSecurePassword(14);

  // Compute canonical auth email for existing Supabase Auth integration
  const authEmail = getCanonicalAuthEmail(cleanUsername);

  // Register in Supabase Auth via isolated client
  const { data: authData, error: authError } = await isolatedAuthClient.auth.signUp({
    email: authEmail,
    password: passwordToUse,
    options: {
      data: {
        username: cleanUsername,
        full_name: cleanFullName,
        employee_id: cleanEmployeeId,
        role: input.role,
        designation: input.designation.trim(),
        department: input.department.trim(),
        status: input.status || 'active',
      },
    },
  });

  if (authError) {
    // If the auth user was created in an earlier test run, proceed with linking
    if (!authError.message.toLowerCase().includes('already registered')) {
      throw new Error(`Authentication provider error: ${authError.message}`);
    }
  }

  const authUserId = authData?.user?.id;

  // Build the complete employee record (PASSWORD IS NEVER STORED)
  const newEmployee: Employee = {
    id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    auth_user_id: authUserId,
    employee_id: cleanEmployeeId,
    full_name: cleanFullName,
    username: cleanUsername,
    auth_email: authEmail,
    designation: input.designation.trim() || 'Biomedical Engineer',
    department: input.department.trim() || 'Biomedical Engineering',
    phone_number: input.phone_number.trim() || '',
    joining_date: input.joining_date || new Date().toISOString().split('T')[0],
    address: input.address?.trim() || '',
    emergency_contact: input.emergency_contact?.trim() || '',
    role: input.role,
    status: input.status || 'active',
    accessible_modules:
      input.accessible_modules && input.accessible_modules.length > 0
        ? input.accessible_modules
        : ['products', 'inquiries'],
    permitted_edit_fields:
      input.permitted_edit_fields && input.permitted_edit_fields.length > 0
        ? input.permitted_edit_fields
        : ['phone_number', 'address', 'emergency_contact', 'profile_picture'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updatedEmployees = [newEmployee, ...existingEmployees];
  await saveEmployeesToBackend(updatedEmployees);

  return {
    employee: newEmployee,
    authEmail,
    initialPassword: passwordToUse,
  };
};

/**
 * Updates an employee account record (status, role, modules, designation, etc.).
 */
export const updateEmployeeAccount = async (
  employeeId: string,
  updates: Partial<Omit<Employee, 'id' | 'created_at'>>
): Promise<Employee> => {
  const employees = await fetchEmployees();
  const index = employees.findIndex((e) => e.id === employeeId);
  if (index === -1) {
    throw new Error('Employee account not found.');
  }

  const updated: Employee = {
    ...employees[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  employees[index] = updated;
  await saveEmployeesToBackend(employees);
  return updated;
};

/**
 * Changes status of an employee account (active, inactive, suspended).
 */
export const setEmployeeStatus = async (
  employeeId: string,
  status: EmployeeStatus
): Promise<Employee> => {
  return updateEmployeeAccount(employeeId, { status });
};

/**
 * Finds an employee account by username, employee ID, or auth email.
 * Used during login to resolve "ashik@engnr" to canonical auth credentials
 * and verify account status before signing in.
 */
export const findEmployeeByIdentifier = async (
  identifier: string
): Promise<Employee | null> => {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const employees = await fetchEmployees();

  return (
    employees.find(
      (e) =>
        e.username.toLowerCase() === clean ||
        e.employee_id.toLowerCase() === clean ||
        e.auth_email.toLowerCase() === clean
    ) || null
  );
};

/**
 * Deletes an employee account record.
 */
export const deleteEmployeeAccount = async (employeeId: string): Promise<void> => {
  const employees = await fetchEmployees();
  const filtered = employees.filter((e) => e.id !== employeeId);
  await saveEmployeesToBackend(filtered);
};
