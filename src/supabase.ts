import type { SupabaseClient } from '@supabase/supabase-js';

// The anon/publishable key is designed to be public: the database only lets it call
// the functions granted in supabase/migrations. Never put the service_role key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Students and admins get separate sign-ins (stored under different keys), so an
 * admin signed in at /admin is never treated as signed in to the Student Portal,
 * and signing out of one doesn't affect the other.
 */
export type AuthKind = 'student' | 'admin';

const STORAGE_KEYS: Record<AuthKind, string> = {
  student: 'aap-auth',
  admin: 'aap-admin-auth',
};

const clientPromises: Partial<Record<AuthKind, Promise<SupabaseClient>>> = {};

// Loaded on demand so the Supabase library isn't downloaded on marketing pages.
export const getSupabase = (kind: AuthKind = 'student') => {
  if (!isSupabaseConfigured) {
    return Promise.reject(new Error('Supabase is not configured.'));
  }
  if (!clientPromises[kind]) {
    clientPromises[kind] = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: STORAGE_KEYS[kind],
          // PKCE puts the email-link code in "?code=", which works alongside the
          // HashRouter's "#/route" (the default flow would clash with the hash).
          flowType: 'pkce',
          // Email links (confirm, password reset) are handled by the student client only
          detectSessionInUrl: kind === 'student',
        },
      })
    );
  }
  return clientPromises[kind]!;
};

/** Site root including the GitHub Pages base path, e.g. https://x.github.io/Agro-Aerial-Precision/ */
export const siteBaseUrl = () => `${window.location.origin}${window.location.pathname}`;
