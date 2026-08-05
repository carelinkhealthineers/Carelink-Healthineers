
import { createClient } from '@supabase/supabase-js';

/**
 * Carelink Healthineers - Production Supabase Client
 * Project: carelinkhealthineers
 */

const SUPABASE_URL = 'https://vrtipkxoldcqhtvznpok.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__BiZqCP30kjQFrOs1K55Qw_EJoph6Zq';

// Initialize the real Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fail-safe global sign-out helper to completely purge local tokens,
 * reset session state, and avoid auth-persistence glitches upon return to homepage.
 */
export const performSignOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    console.warn('Supabase auth.signOut notice:', err);
  } finally {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = window.localStorage.length - 1; i >= 0; i--) {
          const key = window.localStorage.key(i);
          if (key && (key.includes('sb-') || key.includes('supabase'))) {
            window.localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.error('Storage clear notice:', e);
    }
    // Hard reset location with hash route to login and reload browser context
    window.location.hash = '#/login';
    window.location.reload();
  }
};
