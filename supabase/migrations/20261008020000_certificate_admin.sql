-- Certificate management from the /admin page: certificate files are uploaded to
-- Supabase Storage and certificates are created, edited and deleted by admins.
--
-- Run after the earlier migrations: paste this whole file into the Supabase SQL
-- Editor and click Run (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- 1. Link certificates to students (optional)
-- ---------------------------------------------------------------------------

alter table public.certificates
  add column student_id text references public.students (id) on delete set null;

comment on column public.certificates.drive_link is
  'Link to the certificate file (Supabase Storage upload or a Google Drive link).';

-- ---------------------------------------------------------------------------
-- 2. Storage bucket for certificate files
--
-- Files are public by URL (the link is shown when someone verifies the
-- certificate ID), but only admins can upload, replace, delete or list them.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', true, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies run as the signed-in user, so they need to be able to call
-- _is_admin(). It only reveals whether the caller themselves is an admin.
grant execute on function public._is_admin() to authenticated;

create policy "Admins can read certificate files"
on storage.objects for select to authenticated
using (bucket_id = 'certificates' and public._is_admin());

create policy "Admins can upload certificate files"
on storage.objects for insert to authenticated
with check (bucket_id = 'certificates' and public._is_admin());

create policy "Admins can update certificate files"
on storage.objects for update to authenticated
using (bucket_id = 'certificates' and public._is_admin());

create policy "Admins can delete certificate files"
on storage.objects for delete to authenticated
using (bucket_id = 'certificates' and public._is_admin());

-- ---------------------------------------------------------------------------
-- 3. Admin API
-- ---------------------------------------------------------------------------

create function public._certificate_json(p_certificate public.certificates) returns jsonb
language sql immutable set search_path = public as $$
  select jsonb_build_object(
    'id', p_certificate.id,
    'name', p_certificate.name,
    'course', p_certificate.course,
    'issuedOn', coalesce(p_certificate.issued_on, ''),
    'link', coalesce(p_certificate.drive_link, ''),
    'studentId', p_certificate.student_id,
    'createdAt', p_certificate.created_at)
$$;

create function public.admin_list_certificates() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(_certificate_json(c) order by c.created_at desc, c.id desc)
    from certificates c), '[]'::jsonb));
end $$;

create function public.admin_save_certificate(
  p_id text,
  p_name text,
  p_course text,
  p_issued_on text,
  p_link text,
  p_student_id text,
  p_is_new boolean
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_id text := upper(trim(coalesce(p_id, '')));
  v_student_id text := nullif(upper(trim(coalesce(p_student_id, ''))), '');
  v_certificate certificates;
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  if v_id = '' or length(v_id) > 64 or v_id !~ '^[A-Z0-9][A-Z0-9_.-]*$' then
    return _err('The certificate ID can only contain letters, numbers, "-", "_" and ".".');
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_course), '') = '' then
    return _err('Name and course are required.');
  end if;
  if v_student_id is not null and not exists (select 1 from students where id = v_student_id) then
    return _err('That student was not found.');
  end if;

  if p_is_new then
    insert into certificates (id, name, course, issued_on, drive_link, student_id)
    values (v_id, left(trim(p_name), 200), left(trim(p_course), 200),
            nullif(left(trim(coalesce(p_issued_on, '')), 40), ''),
            nullif(left(trim(coalesce(p_link, '')), 1000), ''), v_student_id)
    returning * into v_certificate;
  else
    update certificates set
      name = left(trim(p_name), 200),
      course = left(trim(p_course), 200),
      issued_on = nullif(left(trim(coalesce(p_issued_on, '')), 40), ''),
      drive_link = nullif(left(trim(coalesce(p_link, '')), 1000), ''),
      student_id = v_student_id
    where id = v_id
    returning * into v_certificate;

    if v_certificate.id is null then
      return _err('Certificate not found.');
    end if;
  end if;

  return _ok(_certificate_json(v_certificate));
exception
  when unique_violation then
    return _err('A certificate with this ID already exists.');
end $$;

create function public.admin_delete_certificate(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_certificate certificates;
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  delete from certificates where id = upper(trim(coalesce(p_id, '')))
  returning * into v_certificate;

  if v_certificate.id is null then
    return _err('Certificate not found.');
  end if;
  return _ok(_certificate_json(v_certificate));
end $$;

create function public.admin_list_students() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(student_json order by passed desc, name)
    from (
      select s.name,
             exists (select 1 from exam_attempts a where a.student_id = s.id and a.passed) as passed,
             _student_json(s) || jsonb_build_object(
               'passedExam', exists (select 1 from exam_attempts a where a.student_id = s.id and a.passed),
               'hasCertificate', exists (select 1 from certificates c where c.student_id = s.id)) as student_json
      from students s
    ) student_rows), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------------------------
-- 4. Permissions
-- ---------------------------------------------------------------------------

revoke execute on function
  public._certificate_json(public.certificates),
  public.admin_list_certificates(),
  public.admin_save_certificate(text, text, text, text, text, text, boolean),
  public.admin_delete_certificate(text),
  public.admin_list_students()
from public, anon, authenticated;

grant execute on function
  public.admin_list_certificates(),
  public.admin_save_certificate(text, text, text, text, text, text, boolean),
  public.admin_delete_certificate(text),
  public.admin_list_students()
to authenticated;
