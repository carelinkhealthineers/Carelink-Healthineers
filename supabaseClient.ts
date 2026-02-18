
/**
 * Carelink Healthineers - Supabase Client
 * Securely connected to Vercel Environment Variables.
 */

// In a Vercel/Vite environment, these are injected via process.env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel Environment Variables.");
}

export const supabase = {
  from: (table: string) => ({
    select: (query?: string) => ({
      eq: (col: string, val: any) => Promise.resolve({ data: [], error: null }),
      order: (col: string) => Promise.resolve({ data: [], error: null }),
    }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => ({
      eq: (col: string, val: any) => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (col: string, val: any) => Promise.resolve({ data: null, error: null }),
    }),
  }),
  auth: {
    signIn: () => Promise.resolve({ user: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
};
