-- Contact form and service inquiries: every message is saved in the database and
-- emailed to the admin (via the Resend setup from the enrolment-emails migration).
-- Admins read and manage messages in /admin > Messages.
--
-- Run after the earlier migrations: paste this whole file into the Supabase SQL
-- Editor and click Run (or `supabase db push`).
--
-- Visitors do not get an automatic reply email: anyone can type any address into a
-- public form, so auto-replies could be abused to send mail from our domain to strangers.

-- ---------------------------------------------------------------------------
-- 1. Messages
-- ---------------------------------------------------------------------------

create table public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  source text not null default 'contact',     -- 'contact' or 'service:<industry>'
  status text not null default 'new' check (status in ('new', 'replied', 'archived')),
  sender_hash text,                           -- hashed IP, only used for spam limits
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
create index contact_messages_sender_idx on public.contact_messages (sender_hash, created_at desc);

alter table public.contact_messages enable row level security;
revoke all on table public.contact_messages from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Public API: submit a message
-- ---------------------------------------------------------------------------

create function public.submit_contact_message(
  p_name text,
  p_email text,
  p_phone text,
  p_subject text,
  p_message text,
  p_source text
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_name text := left(trim(coalesce(p_name, '')), 120);
  v_email text := lower(left(trim(coalesce(p_email, '')), 200));
  v_phone text := nullif(left(trim(coalesce(p_phone, '')), 40), '');
  v_subject text := coalesce(nullif(left(trim(coalesce(p_subject, '')), 150), ''), 'General Inquiry');
  v_text text := left(trim(coalesce(p_message, '')), 5000);
  v_source text := coalesce(nullif(left(trim(coalesce(p_source, '')), 60), ''), 'contact');
  v_ip text;
  v_sender_hash text;
  v_message contact_messages;
begin
  if v_name = '' or v_text = '' then
    return _err('Please enter your name and a message.');
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return _err('Please enter a valid email address.');
  end if;

  -- Spam limits: at most 5 messages per hour from one connection, 3 per email address
  v_ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  v_sender_hash := case when trim(v_ip) = '' then null else encode(digest(trim(v_ip), 'sha256'), 'hex') end;

  if (v_sender_hash is not null and
      (select count(*) from contact_messages
       where sender_hash = v_sender_hash and created_at > now() - interval '1 hour') >= 5)
     or (select count(*) from contact_messages
         where email = v_email and created_at > now() - interval '1 hour') >= 3 then
    return _err('You have sent several messages recently. Please wait a while, or contact us on WhatsApp.');
  end if;

  insert into contact_messages (name, email, phone, subject, message, source, sender_hash)
  values (v_name, v_email, v_phone, v_subject, v_text, v_source, v_sender_hash)
  returning * into v_message;

  return _ok(jsonb_build_object('id', v_message.id));
end $$;

-- ---------------------------------------------------------------------------
-- 3. Email the admin about each new message
-- ---------------------------------------------------------------------------

create function public.contact_messages_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_phone_digits text;
begin
  begin
    select * into cfg from _notify_config();
    v_phone_digits := regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g');

    perform _send_email(
      cfg.admin_email,
      'Website message: ' || new.subject || ' - ' || new.name,
      _email_layout('New message from the website',
           '<table style="border-collapse:collapse;width:100%;font-size:14px">'
        || '<tr><td style="padding:6px 0;color:#6b7280;width:110px">From</td><td style="padding:6px 0"><strong>' || _html_escape(new.name) || '</strong></td></tr>'
        || '<tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0">' || _html_escape(new.email) || '</td></tr>'
        || '<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0">'
        || case when v_phone_digits <> ''
                then '<a href="https://wa.me/' || v_phone_digits || '">' || _html_escape(new.phone) || '</a>'
                else '-' end
        || '</td></tr>'
        || '<tr><td style="padding:6px 0;color:#6b7280">Subject</td><td style="padding:6px 0">' || _html_escape(new.subject) || '</td></tr>'
        || '<tr><td style="padding:6px 0;color:#6b7280">Page</td><td style="padding:6px 0">' || _html_escape(new.source) || '</td></tr>'
        || '</table>'
        || '<div style="margin-top:16px;padding:14px;background:#f9fafb;border-radius:6px;white-space:pre-wrap">' || _html_escape(new.message) || '</div>'
        || '<p style="font-size:13px;color:#6b7280;margin-top:16px">Reply to this email to answer ' || _html_escape(new.name) || ' directly. '
        || 'All messages are also in the <a href="' || cfg.site_url || '#/admin">Admin Dashboard</a> (Messages tab).</p>'),
      new.email);
  exception when others then
    raise warning 'Contact message email failed: %', sqlerrm;
  end;
  return new;
end $$;

create trigger contact_messages_notify
after insert on public.contact_messages
for each row execute function public.contact_messages_notify();

-- ---------------------------------------------------------------------------
-- 4. Admin API
-- ---------------------------------------------------------------------------

create function public.admin_list_messages() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(row_json order by created_at desc)
    from (
      select m.created_at, jsonb_build_object(
        'id', m.id, 'name', m.name, 'email', m.email, 'phone', coalesce(m.phone, ''),
        'subject', m.subject, 'message', m.message, 'source', m.source,
        'status', m.status, 'createdAt', m.created_at) as row_json
      from contact_messages m
      order by m.created_at desc
      limit 500
    ) message_rows), '[]'::jsonb));
end $$;

create function public.admin_set_message_status(p_message_id bigint, p_status text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_message contact_messages;
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;
  if p_status not in ('new', 'replied', 'archived') then
    return _err('Invalid status.');
  end if;

  update contact_messages set status = p_status where id = p_message_id returning * into v_message;
  if v_message.id is null then
    return _err('Message not found.');
  end if;
  return _ok(jsonb_build_object('id', v_message.id, 'status', v_message.status));
end $$;

-- ---------------------------------------------------------------------------
-- 5. Permissions
-- ---------------------------------------------------------------------------

revoke execute on function
  public.submit_contact_message(text, text, text, text, text, text),
  public.contact_messages_notify(),
  public.admin_list_messages(),
  public.admin_set_message_status(bigint, text)
from public, anon, authenticated;

grant execute on function public.submit_contact_message(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.admin_list_messages(), public.admin_set_message_status(bigint, text) to authenticated;
