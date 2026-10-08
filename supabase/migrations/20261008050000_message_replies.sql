-- Reply to website messages straight from /admin > Messages. The reply is emailed
-- to the visitor from info@ through Resend, a copy goes to the admin inbox, and
-- the reply is saved with the message.
--
-- Run after the earlier migrations: paste this whole file into the Supabase SQL
-- Editor and click Run (or `supabase db push`).

alter table public.contact_messages
  add column reply_text text,
  add column replied_at timestamptz;

create function public.admin_reply_message(p_message_id bigint, p_body text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_key text;
  v_message contact_messages;
  v_body text := left(trim(coalesce(p_body, '')), 10000);
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;
  if v_body = '' then
    return _err('Please write a reply first.');
  end if;

  select * into v_message from contact_messages where id = p_message_id;
  if v_message.id is null then
    return _err('Message not found.');
  end if;

  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if v_key is null then
    return _err('Email sending is not set up (no resend_api_key in Supabase Vault).');
  end if;

  select * into cfg from _notify_config();

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    body := jsonb_build_object(
      'from', 'Agro Aerial Precision <' || cfg.admin_email || '>',
      'to', jsonb_build_array(v_message.email),
      'bcc', jsonb_build_array(cfg.admin_email),
      'reply_to', cfg.admin_email,
      'subject', 'Re: ' || v_message.subject,
      'html', _email_layout('Re: ' || _html_escape(v_message.subject),
           '<div style="white-space:pre-wrap;font-size:15px;line-height:1.6">' || _html_escape(v_body) || '</div>'
        || '<p style="margin-top:20px;font-size:14px">Agro Aerial Precision<br>'
        || cfg.whatsapp_display || ' (WhatsApp) · ' || cfg.admin_email || '</p>'
        || '<div style="margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px">'
        || 'Your message:<br><div style="white-space:pre-wrap">' || _html_escape(v_message.message) || '</div></div>')),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
    timeout_milliseconds := 10000
  );

  update contact_messages
  set reply_text = v_body, replied_at = now(), status = 'replied'
  where id = v_message.id
  returning * into v_message;

  return _ok(jsonb_build_object('id', v_message.id, 'status', v_message.status,
                                'replyText', v_message.reply_text, 'repliedAt', v_message.replied_at));
end $$;

-- Include saved replies in the admin message list
create or replace function public.admin_list_messages() returns jsonb
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
        'status', m.status, 'createdAt', m.created_at,
        'replyText', m.reply_text, 'repliedAt', m.replied_at) as row_json
      from contact_messages m
      order by m.created_at desc
      limit 500
    ) message_rows), '[]'::jsonb));
end $$;

revoke execute on function public.admin_reply_message(bigint, text) from public, anon, authenticated;
grant execute on function public.admin_reply_message(bigint, text) to authenticated;
