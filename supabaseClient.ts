
import { createClient } from '@supabase/supabase-js';

/**
 * Carelink Healthineers - Production Supabase Client
 * Project: carelinkhealthineers
 */

const SUPABASE_URL = 'https://vrtipkxoldcqhtvznpok.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__BiZqCP30kjQFrOs1K55Qw_EJoph6Zq';

// Initialize the real Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
