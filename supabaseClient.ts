import { createClient, Session } from '@supabase/supabase-js';

/**
 * Carelink Healthineers - Production Supabase Client
 * Project: carelinkhealthineers
 */

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://vrtipkxoldcqhtvznpok.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable__BiZqCP30kjQFrOs1K55Qw_EJoph6Zq';

export const AUTH_STORAGE_KEY = 'carelink-supabase-auth-token';

/**
 * Clears any stale or revoked Supabase auth tokens from localStorage
 * so the client never gets stuck throwing "Invalid Refresh Token: Refresh Token Not Found".
 */
export const clearStaleAuthStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('carelink_verified_admin_session');
    localStorage.removeItem('carelink_local_registered_users');
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        localStorage.removeItem(k);
      }
    }
  } catch {}
};

/**
 * Pre-flight check before createClient() initializes:
 * Removes malformed or incomplete session objects from localStorage.
 */
const sanitizeStoredAuthTokens = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const sessionObj = parsed?.currentSession || parsed;
    if (
      !sessionObj ||
      typeof sessionObj !== 'object' ||
      !sessionObj.refresh_token ||
      typeof sessionObj.refresh_token !== 'string' ||
      sessionObj.refresh_token.trim().length < 8
    ) {
      clearStaleAuthStorage();
    }
  } catch {
    clearStaleAuthStorage();
  }
};

sanitizeStoredAuthTokens();

/**
 * In-memory serialized mutex lock per lock name.
 * Prevents concurrent getSession() calls from firing parallel refresh_token
 * requests (which triggers Supabase single-use refresh token rotation errors),
 * while avoiding browser Navigator LockManager iframe deadlocks.
 */
const lockQueues = new Map<string, Promise<any>>();

const serializedAuthLock = async <R>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  const prev = lockQueues.get(name) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => current);
  lockQueues.set(name, chained);

  try {
    await prev;
    return await fn();
  } finally {
    release();
    if (lockQueues.get(name) === chained) {
      lockQueues.delete(name);
    }
  }
};

/**
 * Timeout-safe fetch wrapper (20s timeout) that preserves standard Supabase
 * authentication headers and self-heals if a stored refresh_token is revoked/not found.
 */
const timeoutFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.toString()
      : (input as Request)?.url || '';

  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal || controller.signal,
    });

    // If a token refresh request fails with 400/401 (e.g. Invalid Refresh Token: Refresh Token Not Found),
    // clear the dead token from localStorage and return a clean response so the app transitions to guest state.
    if (
      urlStr.includes('/auth/v1/token') &&
      urlStr.includes('grant_type=refresh_token') &&
      (response.status === 400 || response.status === 401)
    ) {
      clearStaleAuthStorage();
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: AUTH_STORAGE_KEY,
    lock: serializedAuthLock,
  },
  global: {
    fetch: timeoutFetch,
  },
});

/**
 * Safely retrieves the active Supabase session, automatically clearing stale
 * refresh tokens if the stored session was revoked or expired on the server.
 */
export const getSafeSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      const msg = String(error.message || '').toLowerCase();
      if (
        msg.includes('refresh token') ||
        msg.includes('invalid_grant') ||
        msg.includes('jwt') ||
        error.status === 400 ||
        error.status === 401
      ) {
        clearStaleAuthStorage();
      }
      return null;
    }
    return data?.session || null;
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('refresh token') || msg.includes('invalid_grant')) {
      clearStaleAuthStorage();
    }
    return null;
  }
};

export interface ClassifiedSupabaseError {
  category: 'auth' | 'rls' | 'rate_limit' | 'network' | 'validation' | 'unknown';
  title: string;
  message: string;
}

/**
 * Distinguishes authentication failures, RLS permission errors, network timeouts,
 * and rate-limit responses so the UI reports accurate diagnostics instead of hiding them.
 */
export const classifySupabaseError = (err: any): ClassifiedSupabaseError => {
  const rawMessage = String(err?.message || err?.error_description || err || 'Unknown error');
  const lower = rawMessage.toLowerCase();
  const code = String(err?.code || err?.status || '');

  if (
    code === '429' ||
    lower.includes('rate limit') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('for security purposes, you can only request this')
  ) {
    return {
      category: 'rate_limit',
      title: 'Supabase Email Rate Limit Reached',
      message:
        'Supabase built-in email service rate limit exceeded (default free-tier limit is ~2–4 emails/hour). Configure Custom SMTP under Supabase Dashboard → Project Settings → Authentication → SMTP Settings, or wait before retrying.',
    };
  }

  if (
    code === '42501' ||
    code === 'PGRST301' ||
    lower.includes('row-level security') ||
    lower.includes('permission denied') ||
    lower.includes('insufficient_privilege')
  ) {
    return {
      category: 'rls',
      title: 'Row-Level Security (RLS) Permission Denied',
      message:
        'Your authenticated account does not have admin write permissions in public.profiles (role = "admin"), or the table RLS policy blocked this operation.',
    };
  }

  if (
    code === '401' ||
    lower.includes('refresh token') ||
    lower.includes('jwt expired') ||
    lower.includes('invalid jwt') ||
    lower.includes('email not confirmed') ||
    lower.includes('invalid login credentials')
  ) {
    return {
      category: 'auth',
      title: 'Authentication Error',
      message: rawMessage,
    };
  }

  if (
    lower.includes('aborted') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('timeout')
  ) {
    return {
      category: 'network',
      title: 'Network / Connection Timeout',
      message: 'The request to Supabase timed out or failed due to a network interruption. Please check your connection and try again.',
    };
  }

  return {
    category: 'unknown',
    title: 'Database Operation Failed',
    message: rawMessage,
  };
};

/**
 * Global sign-out helper that clears legacy/stale localStorage keys and signs out of Supabase Auth.
 */
export const performSignOut = async () => {
  try {
    await Promise.race([
      supabase.auth.signOut({ scope: 'local' }),
      new Promise(resolve => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    console.warn('Supabase auth.signOut notice:', err);
  } finally {
    clearStaleAuthStorage();
    try {
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  }
};
