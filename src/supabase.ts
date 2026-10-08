import type { SupabaseClient } from '@supabase/supabase-js';

// The anon/publishable key is designed to be public: the database only lets it call
// the functions granted in supabase/migrations. Never put the service_role key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let clientPromise: Promise<SupabaseClient> | null = null;

// Loaded on demand so the Supabase library isn't downloaded on marketing pages.
export const getSupabase = () => {
  if (!isSupabaseConfigured) {
    return Promise.reject(new Error('Supabase is not configured.'));
  }
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: 'aap-auth',
          // PKCE puts the email-link code in "?code=", which works alongside the
          // HashRouter's "#/route" (the default flow would clash with the hash).
          flowType: 'pkce',
          detectSessionInUrl: true,
        },
      })
    );
  }
  return clientPromise;
};

/** Site root including the GitHub Pages base path, e.g. https://x.github.io/Agro-Aerial-Precision/ */
export const siteBaseUrl = () => `${window.location.origin}${window.location.pathname}`;
