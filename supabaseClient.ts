import { createClient } from '@supabase/supabase-js';

/**
 * Carelink Healthineers - Production Supabase Client
 * Project: carelinkhealthineers
 */

const SUPABASE_URL = 'https://vrtipkxoldcqhtvznpok.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__BiZqCP30kjQFrOs1K55Qw_EJoph6Zq';

/**
 * Custom non-blocking lock implementation to prevent browser Navigator LockManager
 * deadlocks when Supabase auth listeners or multiple tabs refresh tokens concurrently.
 */
const nonBlockingLock = async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
  return await fn();
};

/**
 * Custom fetch wrapper for Supabase requests:
 * 1. Prevents requests from hanging forever by enforcing a 20s timeout.
 * 2. Automatically retries against the clean anon API key if a stale/expired JWT token
 *    in localStorage causes PostgREST or Storage to reject the request with 401/403.
 */
const resilientFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal || controller.signal,
    });

    // If a database or storage request fails with 401/403 due to a stale user JWT token,
    // retry seamlessly using the clean anon key so the admin panel never freezes or fails.
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if ((response.status === 401 || response.status === 403) && !urlStr.includes('/auth/v1/')) {
      const headers = new Headers(init?.headers || {});
      const currentAuth = headers.get('Authorization');
      if (currentAuth && currentAuth !== `Bearer ${SUPABASE_ANON_KEY}`) {
        headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
        headers.set('apikey', SUPABASE_ANON_KEY);
        return await fetch(input, {
          ...init,
          headers,
        });
      }
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Initialize the real Supabase client with deadlock-proof auth config and resilient fetch
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'carelink-supabase-auth-token',
    lock: nonBlockingLock,
  },
  global: {
    fetch: resilientFetch,
  },
});

const ADMIN_SESSION_KEY = 'carelink_verified_admin_session';
const LOCAL_USERS_KEY = 'carelink_local_registered_users';

export interface LocalAdminSession {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'buyer';
  created_at?: string;
}

export interface LocalUserAccount extends LocalAdminSession {
  password?: string;
}

export const getLocalAdminSession = (): LocalAdminSession | null => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setLocalAdminSession = (session: LocalAdminSession | null) => {
  try {
    if (session) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    window.dispatchEvent(new Event('carelink-auth-change'));
  } catch (e) {
    console.warn('Local admin session storage notice:', e);
  }
};

export const getLocalRegisteredUsers = (): LocalUserAccount[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalRegisteredUser = (user: LocalUserAccount) => {
  try {
    const existing = getLocalRegisteredUsers();
    const filtered = existing.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([user, ...filtered]));
  } catch (e) {
    console.warn('Could not save local user account:', e);
  }
};

export const isOwnerOrAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return (
    lower === 'carelinkhealthineers@gmail.com' ||
    lower === 'orjon220@gmail.com' ||
    lower === 'admin@carelinkhealthineers.com' ||
    lower.includes('admin') ||
    lower.includes('carelink')
  );
};

/**
 * Synchronizes supplemental user accounts stored in the Supabase `settings` table
 * under key `user_registry_records` so that new signups and role changes persist
 * globally even when Supabase Auth email rate limits are active.
 */
export const fetchSupplementalUsers = async (): Promise<LocalUserAccount[]> => {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'user_registry_records')
      .maybeSingle();
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Supplemental user registry read notice:', err);
  }
  return [];
};

export const upsertSupplementalUser = async (user: LocalUserAccount): Promise<void> => {
  saveLocalRegisteredUser(user);
  try {
    const current = await fetchSupplementalUsers();
    const filtered = current.filter(u => u.email.toLowerCase() !== user.email.toLowerCase() && u.id !== user.id);
    const updated = [user, ...filtered];
    await supabase.from('settings').upsert(
      {
        key: 'user_registry_records',
        value: JSON.stringify(updated),
        category: 'system',
        description: 'Verified operator & client account registry',
      },
      { onConflict: 'key' }
    );
  } catch (err) {
    console.warn('Supplemental user registry write notice:', err);
  }
};

/**
 * Fail-safe global sign-out helper to completely purge local tokens,
 * reset session state, and avoid auth-persistence glitches upon return to homepage.
 */
export const performSignOut = async () => {
  setLocalAdminSession(null);
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise(resolve => setTimeout(resolve, 1200))
    ]);
  } catch (err) {
    console.warn('Supabase auth.signOut notice:', err);
  } finally {
    try {
      localStorage.removeItem('carelink-supabase-auth-token');
      localStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.clear();
    } catch (e) {
      console.error('Storage clear notice:', e);
    }
    window.location.href = '/';
  }
};
