-- Automatic enrolment emails, sent by the database through Resend:
--   * new enrolment      -> email to the admin with the student's details
--                        -> confirmation email to the student
--   * enrolment approved -> email to the student (exam unlocked)
--
-- Run after the earlier migrations. Then store your Resend API key in Supabase
-- Vault (never in this file - it is in the public repository):
--
--   select vault.create_secret('re_YOUR_KEY', 'resend_api_key', 'Resend key for enrolment emails');
--
-- Emails are sent asynchronously with pg_net, so a slow or failed email never
-- blocks or breaks an enrolment. Delivery results are in the net._http_response table.

create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------

create function public._notify_config(
  out admin_email text,
  out from_address text,
  out site_url text,
  out whatsapp_display text
) language sql immutable set search_path = public as $$
  select 'info@agroaerialprecision.com',
         'Agro Aerial Precision <no-reply@agroaerialprecision.com>',
         'https://dronegodone2022-netizen.github.io/Agro-Aerial-Precision/',
         '+232 77 840 105'
$$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Student-entered text goes into HTML emails, so it must be escaped.
create function public._html_escape(p_text text) returns text
language sql immutable set search_path = public as $$
  select replace(replace(replace(replace(replace(coalesce(p_text, ''),
    '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&#39;')
$$;

create function public._email_layout(p_title text, p_body_html text) returns text
language sql immutable set search_path = public as $$
  select '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">'
      || '<div style="background:#166534;color:#ffffff;padding:16px 20px;border-radius:8px 8px 0 0">'
      || '<strong style="font-size:18px">Agro Aerial Precision</strong></div>'
      || '<div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px">'
      || '<h2 style="margin:0 0 16px;color:#14532d;font-size:20px">' || p_title || '</h2>'
      || p_body_html
      || '</div></div>'
$$;

/** Queues one email through Resend. Silently skips if no API key is stored yet. */
create function public._send_email(p_to text, p_subject text, p_html text, p_reply_to text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_key text;
  v_body jsonb;
begin
  if coalesce(trim(p_to), '') = '' then
    return;
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if v_key is null then
    raise warning 'Enrolment email not sent: no resend_api_key in Vault';
    return;
  end if;

  select * into cfg from _notify_config();
  v_body := jsonb_build_object('from', cfg.from_address, 'to', jsonb_build_array(trim(p_to)),
                               'subject', p_subject, 'html', p_html);
  if coalesce(trim(p_reply_to), '') <> '' then
    v_body := v_body || jsonb_build_object('reply_to', trim(p_reply_to));
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    body := v_body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
    timeout_milliseconds := 10000
  );
end $$;

-- ---------------------------------------------------------------------------
-- Emails
-- ---------------------------------------------------------------------------

create function public._send_enrollment_emails(p_enrollment public.enrollments) returns void
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_student students;
  v_details text;
  v_phone_digits text;
begin
  select * into cfg from _notify_config();
  select * into v_student from students where id = p_enrollment.student_id;
  if v_student.id is null then
    return;
  end if;

  v_phone_digits := regexp_replace(coalesce(v_student.phone, ''), '[^0-9]', '', 'g');
  v_details :=
       '<table style="border-collapse:collapse;width:100%;font-size:14px">'
    || '<tr><td style="padding:6px 0;color:#6b7280;width:130px">Student ID</td><td style="padding:6px 0"><strong>' || _html_escape(v_student.id) || '</strong></td></tr>'
    || '<tr><td style="padding:6px 0;color:#6b7280">Name</td><td style="padding:6px 0">' || _html_escape(v_student.name) || '</td></tr>'
    || '<tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0">' || _html_escape(v_student.email) || '</td></tr>'
    || '<tr><td style="padding:6px 0;color:#6b7280">WhatsApp</td><td style="padding:6px 0">'
    || case when v_phone_digits <> ''
            then '<a href="https://wa.me/' || v_phone_digits || '">' || _html_escape(v_student.phone) || '</a>'
            else '-' end
    || '</td></tr>'
    || '<tr><td style="padding:6px 0;color:#6b7280">Course</td><td style="padding:6px 0"><strong>' || _html_escape(p_enrollment.course_title) || '</strong></td></tr>'
    || case when coalesce(p_enrollment.message, '') <> ''
            then '<tr><td style="padding:6px 0;color:#6b7280;vertical-align:top">Message</td><td style="padding:6px 0">' || _html_escape(p_enrollment.message) || '</td></tr>'
            else '' end
    || '</table>';

  -- To the admin. Replying goes straight to the student.
  perform _send_email(
    cfg.admin_email,
    'New enrolment: ' || v_student.name || ' - ' || p_enrollment.course_title,
    _email_layout('New course enrolment', v_details
      || '<p style="margin:20px 0 0"><a href="' || cfg.site_url || '#/admin" style="background:#166534;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Open Admin Dashboard</a></p>'
      || '<p style="font-size:13px;color:#6b7280">Approve the enrolment once payment is received - that unlocks the student''s exam.</p>'),
    v_student.email);

  -- Confirmation to the student
  perform _send_email(
    v_student.email,
    'We received your enrolment - ' || p_enrollment.course_title,
    _email_layout('Thank you for enrolling, ' || _html_escape(split_part(v_student.name, ' ', 1)) || '!',
         '<p>We have received your enrolment for <strong>' || _html_escape(p_enrollment.course_title) || '</strong>.</p>'
      || '<p><strong>Next step:</strong> our team will send you the payment details on WhatsApp. '
      || 'If you haven''t heard from us within one working day, message us on WhatsApp at <strong>' || cfg.whatsapp_display || '</strong>.</p>'
      || '<p>Your Student ID is <strong>' || _html_escape(v_student.id) || '</strong>. You can track your enrolment in the Student Portal:</p>'
      || '<p><a href="' || cfg.site_url || '#/student" style="background:#166534;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Open Student Portal</a></p>'),
    cfg.admin_email);
end $$;

create function public._send_enrollment_approved_email(p_enrollment public.enrollments) returns void
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_student students;
begin
  select * into cfg from _notify_config();
  select * into v_student from students where id = p_enrollment.student_id;
  if v_student.id is null then
    return;
  end if;

  perform _send_email(
    v_student.email,
    'Enrolment approved - ' || p_enrollment.course_title,
    _email_layout('You''re approved, ' || _html_escape(split_part(v_student.name, ' ', 1)) || '!',
         '<p>Your enrolment for <strong>' || _html_escape(p_enrollment.course_title) || '</strong> has been approved.</p>'
      || '<p>Your certification exam is now unlocked in the Student Portal. It takes 5 minutes and the pass mark is 80% - '
      || 'make sure you have a stable internet connection before you start.</p>'
      || '<p><a href="' || cfg.site_url || '#/student" style="background:#166534;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Open Student Portal</a></p>'
      || '<p style="font-size:13px;color:#6b7280">Questions? WhatsApp us at ' || cfg.whatsapp_display || '.</p>'),
    cfg.admin_email);
end $$;

-- ---------------------------------------------------------------------------
-- Triggers. Email problems are logged as warnings and never block enrolments.
-- ---------------------------------------------------------------------------

create function public.enrollments_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  begin
    if tg_op = 'INSERT' then
      perform _send_enrollment_emails(new);
    elsif new.status is distinct from old.status then
      if new.status = 'approved' then
        perform _send_enrollment_approved_email(new);
      elsif new.status = 'pending' and old.status = 'rejected' then
        -- A previously rejected student applied again
        perform _send_enrollment_emails(new);
      end if;
    end if;
  exception when others then
    raise warning 'Enrolment email failed: %', sqlerrm;
  end;
  return new;
end $$;

create trigger enrollments_notify
after insert or update of status on public.enrollments
for each row execute function public.enrollments_notify();

-- ---------------------------------------------------------------------------
-- Permissions: nothing here is callable from the browser
-- ---------------------------------------------------------------------------

revoke execute on function
  public._notify_config(), public._html_escape(text), public._email_layout(text, text),
  public._send_email(text, text, text, text),
  public._send_enrollment_emails(public.enrollments),
  public._send_enrollment_approved_email(public.enrollments),
  public.enrollments_notify()
from public, anon, authenticated;
