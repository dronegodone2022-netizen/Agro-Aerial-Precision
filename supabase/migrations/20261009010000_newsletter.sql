-- Newsletter sign-ups from the website footer, stored in our own database.
-- Admins see and export them in /admin > Subscribers.
--
-- Paste this whole file into the Supabase SQL Editor and click Run.

create table public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text not null default 'footer',
  sender_hash text,                -- hashed IP, only used for spam limits
  created_at timestamptz not null default now()
);
create index newsletter_subscribers_sender_idx on public.newsletter_subscribers (sender_hash, created_at desc);

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public: subscribe
-- ---------------------------------------------------------------------------

create function public.subscribe_newsletter(p_email text, p_source text default 'footer') returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_email text := lower(left(trim(coalesce(p_email, '')), 200));
  v_source text := coalesce(nullif(left(trim(coalesce(p_source, '')), 40), ''), 'footer');
  v_ip text;
  v_sender_hash text;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return _err('Please enter a valid email address.');
  end if;

  -- Spam limit: at most 5 sign-ups per hour from one connection
  v_ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  v_sender_hash := case when trim(v_ip) = '' then null else encode(digest(trim(v_ip), 'sha256'), 'hex') end;
  if v_sender_hash is not null
     and (select count(*) from newsletter_subscribers
          where sender_hash = v_sender_hash and created_at > now() - interval '1 hour') >= 5 then
    return _err('Too many sign-ups from your connection. Please try again later.');
  end if;

  insert into newsletter_subscribers (email, source, sender_hash)
  values (v_email, v_source, v_sender_hash)
  on conflict (email) do nothing;

  -- Same answer whether or not the address was already on the list, so the form
  -- can't be used to check who is subscribed.
  return _ok(jsonb_build_object('subscribed', true));
end $$;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------

create function public.admin_list_subscribers() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(jsonb_build_object('id', s.id, 'email', s.email, 'source', s.source, 'createdAt', s.created_at)
                     order by s.created_at desc)
    from newsletter_subscribers s), '[]'::jsonb));
end $$;

create function public.admin_delete_subscriber(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  delete from newsletter_subscribers where id = p_id;
  if not found then
    return _err('Subscriber not found.');
  end if;
  return _ok(jsonb_build_object('deleted', true));
end $$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

revoke execute on function
  public.subscribe_newsletter(text, text),
  public.admin_list_subscribers(),
  public.admin_delete_subscriber(bigint)
from public, anon, authenticated;

grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;
grant execute on function public.admin_list_subscribers(), public.admin_delete_subscriber(bigint) to authenticated;
