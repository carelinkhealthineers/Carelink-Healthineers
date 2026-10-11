import { createClient } from '@supabase/supabase-js';

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

/**
 * Non-blocking lock implementation to prevent browser Navigator LockManager
 * deadlocks when multiple tabs or auth listeners refresh tokens concurrently.
 */
const nonBlockingLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  return await fn();
};

/**
 * Timeout-safe fetch wrapper (20s timeout) that preserves standard Supabase
 * authentication headers and never swaps user JWTs with the anonymous API key.
 */
const timeoutFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal || controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'carelink-supabase-auth-token',
    lock: nonBlockingLock,
  },
  global: {
    fetch: timeoutFetch,
  },
});

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
      supabase.auth.signOut(),
      new Promise(resolve => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    console.warn('Supabase auth.signOut notice:', err);
  } finally {
    try {
      localStorage.removeItem('carelink-supabase-auth-token');
      localStorage.removeItem('carelink_verified_admin_session');
      localStorage.removeItem('carelink_local_registered_users');
      sessionStorage.clear();
    } catch (e) {
      console.error('Storage clear notice:', e);
    }
    window.location.href = '/';
  }
};
