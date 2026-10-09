-- The website moved to https://www.agroaerialprecision.com/ (Hostinger).
-- Links in automatic emails (enrolments, contact messages, replies) now point there.
--
-- Paste this whole file into the Supabase SQL Editor and click Run.

create or replace function public._notify_config(
  out admin_email text,
  out from_address text,
  out site_url text,
  out whatsapp_display text
) language sql immutable set search_path = public as $$
  select 'info@agroaerialprecision.com',
         'Agro Aerial Precision <no-reply@agroaerialprecision.com>',
         'https://www.agroaerialprecision.com/',
         '+232 77 840 105'
$$;

revoke execute on function public._notify_config() from public, anon, authenticated;
