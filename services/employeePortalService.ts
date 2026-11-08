import { supabase, getSafeSession, performSignOut } from '../supabaseClient';
import {
  Employee,
  EmployeeDuty,
  EmployeeTask,
  DailyServiceReport,
  EmployeeWorkspaceData,
} from '../types';
import { fetchEmployees, updateEmployeeAccount } from './employeeService';

/**
 * Returns initial empty workspace data for a clean employee workspace.
 */
const getDefaultWorkspaceData = (_employee: Employee): EmployeeWorkspaceData => {
  return {
    duties: [],
    tasks: [],
    reports: [],
  };
};

/**
 * Validates active session and resolves the current authenticated Employee record.
 * Enforces status checks (blocks inactive/suspended employees immediately).
 */
export const getCurrentEmployeeSession = async (): Promise<{
  session: any;
  employee: Employee | null;
  isAdmin: boolean;
}> => {
  const session = await getSafeSession();
  if (!session?.user) {
    return { session: null, employee: null, isAdmin: false };
  }

  // Check if user is an Admin in public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .maybeSingle();

  const isAdmin = profile?.role === 'admin';

  // Find employee matching this auth user
  const employees = await fetchEmployees();
  const userEmail = (session.user.email || '').toLowerCase();
  const userId = session.user.id;

  const matched = employees.find(
    (e) =>
      e.auth_user_id === userId ||
      e.auth_email.toLowerCase() === userEmail ||
      (e.username && session.user.user_metadata?.username === e.username)
  );

  if (matched) {
    // Security Enforcement: Inactive or suspended employees must be kicked out immediately
    if (matched.status !== 'active') {
      await performSignOut();
      throw new Error(`Your account is currently ${matched.status}. Please contact the system administrator.`);
    }
    return { session, employee: matched, isAdmin };
  }

  // If user is Admin but not in employee list, generate an Admin portal identity
  if (isAdmin) {
    const adminEmployee: Employee = {
      id: `admin_${userId}`,
      auth_user_id: userId,
      employee_id: 'ADMIN-001',
      full_name: (profile as any)?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'System Administrator',
      username: session.user.email?.split('@')[0] || 'admin',
      auth_email: session.user.email || '',
      designation: 'Chief Technical Administrator',
      department: 'Executive Engineering',
      phone_number: '',
      joining_date: '2026-01-01',
      role: 'Engineer',
      status: 'active',
      accessible_modules: [
        'products',
        'inquiries',
        'editorial',
        'divisions',
        'seo',
        'homepage',
        'users',
        'settings',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { session, employee: adminEmployee, isAdmin: true };
  }

  return { session, employee: null, isAdmin: false };
};

/**
 * Loads employee workspace data (duties, tasks, reports) strictly for this employee.
 * Backend security: Enforces that employees only access their own record.
 */
export const getEmployeeWorkspaceData = async (
  employeeId: string,
  employee: Employee
): Promise<EmployeeWorkspaceData> => {
  // Security validation: verify current session matches requested employee
  const current = await getCurrentEmployeeSession();
  if (!current.employee) {
    throw new Error('Unauthorized: Authentication required.');
  }

  // Non-admins can only read their own workspace data
  if (!current.isAdmin && current.employee.id !== employeeId) {
    throw new Error('Permission denied: You can only access your own employee workspace.');
  }

  const storageKey = `employee_data_${employeeId}`;

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', storageKey)
      .maybeSingle();

    if (error) {
      console.warn('Workspace data fetch notice:', error.message);
    }

    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (parsed && typeof parsed === 'object') {
          const rawDuties = Array.isArray(parsed.duties) ? parsed.duties : [];
          const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
          const rawReports = Array.isArray(parsed.reports) ? parsed.reports : [];

          const duties = rawDuties.filter((d: any) => {
            const t = (d.title || '').toLowerCase();
            return !t.includes('diagnostic imaging') && !t.includes('dürr dental') && !t.includes('safety interlock') && !t.includes('calibration');
          });

          const tasks = rawTasks.filter((t: any) => {
            const title = (t.title || '').toLowerCase();
            return !title.includes('diagnostic imaging') && !title.includes('dürr dental');
          });

          const reports = rawReports.filter((r: any) => {
            const summary = (r.summary || '').toLowerCase();
            const title = (r.title || '').toLowerCase();
            return !summary.includes('preventive maintenance') && !summary.includes('suction generator') && !title.includes('preventive maintenance');
          });

          return { duties, tasks, reports };
        }
      } catch (err) {
        console.error('Error parsing workspace data:', err);
      }
    }

    // Initialize with domain-native defaults on first load
    const initialData = getDefaultWorkspaceData(employee);
    await saveEmployeeWorkspaceData(employeeId, initialData);
    return initialData;
  } catch (err) {
    console.error('getEmployeeWorkspaceData error:', err);
    return getDefaultWorkspaceData(employee);
  }
};

/**
 * Saves workspace data strictly for this employee.
 */
export const saveEmployeeWorkspaceData = async (
  employeeId: string,
  data: EmployeeWorkspaceData
): Promise<void> => {
  const current = await getCurrentEmployeeSession();
  if (!current.employee) {
    throw new Error('Unauthorized: Authentication required.');
  }

  if (!current.isAdmin && current.employee.id !== employeeId) {
    throw new Error('Permission denied: Cannot mutate another employee data.');
  }

  const storageKey = `employee_data_${employeeId}`;

  const { error } = await supabase.from('settings').upsert(
    {
      key: storageKey,
      value: JSON.stringify(data),
      category: 'employee_workspace',
      description: `Scoped workspace data for employee ${employeeId}`,
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to save workspace data: ${error.message}`);
  }
};

/**
 * Toggles a duty status between pending and completed.
 */
export const toggleDutyStatus = async (
  employee: Employee,
  dutyId: string
): Promise<EmployeeWorkspaceData> => {
  const workspace = await getEmployeeWorkspaceData(employee.id, employee);
  const updatedDuties: EmployeeDuty[] = workspace.duties.map((d) => {
    if (d.id === dutyId) {
      const nextStatus: 'pending' | 'completed' = d.status === 'completed' ? 'pending' : 'completed';
      return {
        ...d,
        status: nextStatus,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      };
    }
    return d;
  });

  const updatedWorkspace: EmployeeWorkspaceData = { ...workspace, duties: updatedDuties };
  await saveEmployeeWorkspaceData(employee.id, updatedWorkspace);
  return updatedWorkspace;
};

/**
 * Adds a new duty for today.
 */
export const addEmployeeDuty = async (
  employee: Employee,
  dutyInput: Omit<EmployeeDuty, 'id' | 'status'>
): Promise<EmployeeWorkspaceData> => {
  const workspace = await getEmployeeWorkspaceData(employee.id, employee);
  const newDuty: EmployeeDuty = {
    id: `duty_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...dutyInput,
    status: 'pending',
  };

  const updatedWorkspace = {
    ...workspace,
    duties: [newDuty, ...workspace.duties],
  };

  await saveEmployeeWorkspaceData(employee.id, updatedWorkspace);
  return updatedWorkspace;
};

/**
 * Toggles a task status between pending and completed.
 */
export const toggleTaskStatus = async (
  employee: Employee,
  taskId: string
): Promise<EmployeeWorkspaceData> => {
  const workspace = await getEmployeeWorkspaceData(employee.id, employee);
  const updatedTasks: EmployeeTask[] = workspace.tasks.map((t) => {
    if (t.id === taskId) {
      const nextStatus: 'pending' | 'completed' = t.status === 'completed' ? 'pending' : 'completed';
      return {
        ...t,
        status: nextStatus,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      };
    }
    return t;
  });

  const updatedWorkspace: EmployeeWorkspaceData = { ...workspace, tasks: updatedTasks };
  await saveEmployeeWorkspaceData(employee.id, updatedWorkspace);
  return updatedWorkspace;
};

/**
 * Adds a new task.
 */
export const addEmployeeTask = async (
  employee: Employee,
  taskInput: Omit<EmployeeTask, 'id' | 'status' | 'created_at'>
): Promise<EmployeeWorkspaceData> => {
  const workspace = await getEmployeeWorkspaceData(employee.id, employee);
  const newTask: EmployeeTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...taskInput,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const updatedWorkspace = {
    ...workspace,
    tasks: [newTask, ...workspace.tasks],
  };

  await saveEmployeeWorkspaceData(employee.id, updatedWorkspace);
  return updatedWorkspace;
};

/**
 * Deletes a task.
 */
export const deleteEmployeeTask = async (
  employee: Employee,
  taskId: string
): Promise<EmployeeWorkspaceData> => {
  const workspace = await getEmployeeWorkspaceData(employee.id, employee);
  const updatedWorkspace = {
    ...workspace,
    tasks: workspace.tasks.filter((t) => t.id !== taskId),
  };

  await saveEmployeeWorkspaceData(employee.id, updatedWorkspace);
  return updatedWorkspace;
};

/**
 * Adds a new daily service report.
 */
export const addDailyServiceReport = async (
  employee: Employee,
  reportInput: Omit<DailyServiceReport, 'id' | 'created_at'>
): Promise<EmployeeWorkspaceData> => {
  const workspace = await getEmployeeWorkspaceData(employee.id, employee);
  const newReport: DailyServiceReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...reportInput,
    created_at: new Date().toISOString(),
  };

  const updatedWorkspace = {
    ...workspace,
    reports: [newReport, ...workspace.reports],
  };

  await saveEmployeeWorkspaceData(employee.id, updatedWorkspace);
  return updatedWorkspace;
};

/**
 * Updates profile picture for an employee.
 */
export const updateEmployeeProfilePhoto = async (
  employeeId: string,
  photoUrl: string
): Promise<Employee> => {
  return updateEmployeeAccount(employeeId, { profile_picture: photoUrl });
};
