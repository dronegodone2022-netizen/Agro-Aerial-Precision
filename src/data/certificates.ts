import { getSupabase, isSupabaseConfigured } from '../supabase';

export interface Certificate {
  id: string;
  name: string;
  course: string;
  issued_on: string;
  drive_link: string;
}

// Used until Supabase is configured. Once the certificates are imported into the
// Supabase `certificates` table, unpublish this sheet: it exposes every holder's name.
const LEGACY_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7JG1T2eVQudLbcaLlFfoFaN9mQB1n6nPLFi8rljUBoiKgP7ebrFHirKiSiPlm9ne3yX4u-831BwjB/pub?gid=1711350204&single=true&output=csv';

const verifyFromLegacySheet = async (normalizedId: string): Promise<Certificate | null> => {
  const [{ default: Papa }, response] = await Promise.all([import('papaparse'), fetch(LEGACY_SHEET_URL)]);
  const rows = Papa.parse<Certificate>(await response.text(), { header: true }).data;
  return rows.find((c) => c.id?.trim().toUpperCase() === normalizedId) || null;
};

/** Looks up one certificate by ID. Returns null if it doesn't exist; throws on network errors. */
export const verifyCertificate = async (id: string): Promise<Certificate | null> => {
  const normalizedId = id.trim().toUpperCase();
  if (!normalizedId) return null;

  if (!isSupabaseConfigured) {
    return verifyFromLegacySheet(normalizedId);
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc('verify_certificate', { p_id: normalizedId });
  if (error || !data?.ok) {
    throw new Error(error?.message || data?.error || 'Certificate lookup failed.');
  }
  return data.data as Certificate | null;
};
