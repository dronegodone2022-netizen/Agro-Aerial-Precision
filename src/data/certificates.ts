import { getSupabase, isSupabaseConfigured } from '../supabase';

export interface Certificate {
  id: string;
  name: string;
  course: string;
  issued_on: string;
  drive_link: string;
}

/** Looks up one certificate by ID. Returns null if it doesn't exist; throws on network errors. */
export const verifyCertificate = async (id: string): Promise<Certificate | null> => {
  const normalizedId = id.trim().toUpperCase();
  if (!normalizedId) return null;
  if (!isSupabaseConfigured) {
    throw new Error('Certificate verification is not configured.');
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc('verify_certificate', { p_id: normalizedId });
  if (error || !data?.ok) {
    throw new Error(error?.message || data?.error || 'Certificate lookup failed.');
  }
  return data.data as Certificate | null;
};
