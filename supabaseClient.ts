
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
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase auth.signOut notice:', err);
  } finally {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Storage clear notice:', e);
    }
    window.location.href = '/';
  }
};
