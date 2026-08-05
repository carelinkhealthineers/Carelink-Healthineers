import { supabase } from '../supabaseClient';

export const ADMIN_EMAILS = [
  'carelinkhealthineers@gmail.com',
  'orjon220@gmail.com'
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(e => e.toLowerCase() === normalized) || normalized.includes('admin');
};

/**
 * Gets the user's role from Supabase 'profiles' table.
 * If the user is an owner/admin email, automatically provisions/updates their profile role to 'admin'.
 */
export const getOrProvisionUserRole = async (userObj: any): Promise<string> => {
  if (!userObj) return 'buyer';
  const email = userObj.email || '';
  const isOwner = isAdminEmail(email);
  if (isOwner) {
    // Background profile sync
    (async () => {
      try {
        await supabase.from('profiles').upsert({
          id: userObj.id,
          email: email,
          full_name: userObj.user_metadata?.full_name || email.split('@')[0] || 'Operator',
          role: 'admin'
        }, { onConflict: 'id' });
      } catch (err) {}
    })();
    return 'admin';
  }

  const targetRole = 'buyer';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userObj.id)
      .maybeSingle();

    if (profile) {
      return profile.role || targetRole;
    }

    // Provision missing profile record in Supabase
    await supabase.from('profiles').upsert({
      id: userObj.id,
      email: email,
      full_name: userObj.user_metadata?.full_name || email.split('@')[0] || 'Operator',
      role: targetRole
    }, { onConflict: 'id' });

    return targetRole;
  } catch (e) {
    console.warn('Profile sync error:', e);
    return targetRole;
  }
};
