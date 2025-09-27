import { getServerSupabase } from "../app/auth/server";

export type AppUser = {
  email: string;
  role: 'visitor' | 'partner' | 'admin';
  partner_status: 'pending' | 'active' | 'suspended' | null;
};

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabase.from('users').select('email, role, partner_status').eq('email', user.email).maybeSingle();
  if (!data) return { email: user.email, role: 'visitor', partner_status: null };
  return data as AppUser;
}
