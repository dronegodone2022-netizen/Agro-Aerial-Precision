-- Student self-registration (Supabase Auth), course enrolments, and exam access
-- only for students whose enrolment an admin has approved.
--
-- Run after 20261008000000_init.sql: paste this whole file into the Supabase SQL
-- Editor and click Run (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- 1. Remove the old Student ID + PIN login. Supabase Auth replaces it, and also
--    provides rate limiting and password-reset emails.
-- ---------------------------------------------------------------------------

drop function if exists public.exam_login(text, text);
drop function if exists public.exam_get(text);
drop function if exists public.exam_submit(text, jsonb);
drop function if exists public._session_student(text);
drop function if exists public._record_failure(text);
drop function if exists public._is_rate_limited(text, integer);
drop table if exists public.exam_sessions;
drop table if exists public.login_failures;

-- ---------------------------------------------------------------------------
-- 2. Students are now Supabase Auth users
-- ---------------------------------------------------------------------------

alter table public.students
  add column user_id uuid unique references auth.users (id) on delete cascade,
  add column phone text,
  alter column pin drop not null;

comment on column public.students.pin is 'Legacy PIN from the old login. No longer used.';
comment on column public.students.user_id is 'The Supabase Auth account this student signs in with.';

create or replace function public.students_before_write() returns trigger
language plpgsql set search_path = public, extensions as $$
begin
  new.id := upper(trim(new.id));
  if new.pin is not null and new.pin !~ '^\$2[aby]\$' then
    new.pin := crypt(trim(new.pin), gen_salt('bf'));
  end if;
  return new;
end $$;

create sequence public.student_number_seq;

-- Creates the student profile when someone registers on the website.
-- Admin accounts (created in the dashboard) don't get a student profile.
create function public.handle_new_student_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') <> 'student' then
    return new;
  end if;

  insert into public.students (id, user_id, name, email, phone)
  values (
    'AAP-' || to_char(now(), 'YY') || '-' || lpad(nextval('public.student_number_seq')::text, 4, '0'),
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)), 120),
    new.email,
    left(nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), 30)
  );
  return new;
end $$;

create trigger on_auth_user_created_student
after insert on auth.users
for each row execute function public.handle_new_student_user();

-- Keep the student's email in sync if they change it.
create function public.handle_student_email_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.students set email = new.email where user_id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed
after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute function public.handle_student_email_change();

-- ---------------------------------------------------------------------------
-- 3. Course enrolments
-- ---------------------------------------------------------------------------

create table public.enrollments (
  id bigint generated always as identity primary key,
  student_id text not null references public.students (id) on delete cascade,
  course_id text not null,
  course_title text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (student_id, course_id)
);

alter table public.enrollments enable row level security;
revoke all on table public.enrollments from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Helpers
-- ---------------------------------------------------------------------------

create or replace function public._student_json(p_student public.students) returns jsonb
language sql immutable set search_path = public as $$
  select jsonb_build_object(
    'id', p_student.id,
    'name', p_student.name,
    'email', coalesce(p_student.email, ''),
    'phone', coalesce(p_student.phone, ''))
$$;

create function public._current_student() returns public.students
language sql stable set search_path = public as $$
  select * from students where user_id = auth.uid()
$$;

create function public._enrollment_json(p_enrollment public.enrollments) returns jsonb
language sql immutable set search_path = public as $$
  select jsonb_build_object(
    'id', p_enrollment.id,
    'courseId', p_enrollment.course_id,
    'courseTitle', p_enrollment.course_title,
    'status', p_enrollment.status,
    'createdAt', p_enrollment.created_at,
    'decidedAt', p_enrollment.decided_at)
$$;

-- ---------------------------------------------------------------------------
-- 5. Student API (signed-in students)
-- ---------------------------------------------------------------------------

create function public.student_profile() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_student students;
begin
  v_student := _current_student();
  if v_student.id is null then
    return _ok(jsonb_build_object('student', null, 'enrollments', '[]'::jsonb));
  end if;

  return _ok(jsonb_build_object(
    'student', _student_json(v_student),
    'enrollments', coalesce((
      select jsonb_agg(_enrollment_json(e) order by e.created_at desc)
      from enrollments e where e.student_id = v_student.id), '[]'::jsonb)));
end $$;

create function public.student_update_profile(p_name text, p_phone text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_student students;
begin
  v_student := _current_student();
  if v_student.id is null then
    return _err('Please sign in with your student account.');
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    return _err('Please enter your full name and WhatsApp number.');
  end if;

  update students
  set name = left(trim(p_name), 120), phone = left(trim(p_phone), 30)
  where id = v_student.id
  returning * into v_student;

  return _ok(_student_json(v_student));
end $$;

create function public.student_enroll(p_course_id text, p_course_title text, p_message text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_student students;
  v_existing enrollments;
  v_enrollment enrollments;
begin
  v_student := _current_student();
  if v_student.id is null then
    return _err('Please sign in with your student account to enrol.');
  end if;

  if coalesce(trim(p_course_id), '') = '' or length(p_course_id) > 100
     or coalesce(trim(p_course_title), '') = '' or length(p_course_title) > 200 then
    return _err('Please choose a course.');
  end if;

  select * into v_existing from enrollments
  where student_id = v_student.id and course_id = trim(p_course_id);

  if v_existing.id is null
     and (select count(*) from enrollments where student_id = v_student.id) >= 20 then
    return _err('You have reached the maximum number of enrolments. Please contact us.');
  end if;

  insert into enrollments (student_id, course_id, course_title, message)
  values (v_student.id, trim(p_course_id), trim(p_course_title), left(nullif(trim(p_message), ''), 1000))
  on conflict (student_id, course_id) do update set
    course_title = excluded.course_title,
    message = coalesce(excluded.message, enrollments.message),
    -- A rejected student may apply again
    status = case when enrollments.status = 'rejected' then 'pending' else enrollments.status end,
    decided_at = case when enrollments.status = 'rejected' then null else enrollments.decided_at end
  returning * into v_enrollment;

  return _ok(_enrollment_json(v_enrollment) || jsonb_build_object('alreadyEnrolled', v_existing.id is not null));
end $$;

create function public.exam_get() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_student students;
  v_lock exam_locks;
  v_attempt exam_attempts;
  v_elapsed numeric;
  v_graded jsonb;
  v_questions jsonb;
begin
  select * into cfg from _exam_config();

  v_student := _current_student();
  if v_student.id is null then
    return _err('Please sign in with your student account.');
  end if;

  -- Serialise requests per student so double-clicks can't create two attempts.
  perform 1 from students where id = v_student.id for update;

  if not exists (select 1 from enrollments where student_id = v_student.id and status = 'approved') then
    return _ok(jsonb_build_object('status', 'not_enrolled', 'student', _student_json(v_student)));
  end if;

  select * into v_lock from exam_locks where student_id = v_student.id;
  if v_lock.student_id is not null then
    return _ok(jsonb_build_object('status', 'locked', 'student', _student_json(v_student),
      'result', jsonb_build_object('score', v_lock.score, 'percentage', v_lock.percentage, 'passed', false)));
  end if;

  select * into v_attempt from exam_attempts
  where student_id = v_student.id order by id desc limit 1;

  if v_attempt.id is not null and v_attempt.submitted_at is not null and v_attempt.passed then
    return _ok(jsonb_build_object('status', 'passed', 'student', _student_json(v_student),
      'result', jsonb_build_object('score', v_attempt.score, 'total', v_attempt.total,
                                   'percentage', v_attempt.percentage, 'passed', true)));
  end if;

  select jsonb_agg(jsonb_build_object(
           'id', q.id::text,
           'question', q.question,
           'options', (select jsonb_agg(jsonb_build_object('id', o.ord, 'text', o.opt) order by o.ord)
                       from unnest(q.options) with ordinality as o(opt, ord)))
         order by q.id)
  into v_questions
  from exam_questions q where q.active;

  if v_questions is null then
    return _err('No exam questions have been set up yet.');
  end if;

  if v_attempt.id is null or v_attempt.submitted_at is not null then
    insert into exam_attempts (student_id) values (v_student.id) returning * into v_attempt;
  end if;

  v_elapsed := extract(epoch from now() - v_attempt.started_at);

  -- Time ran out and nothing was submitted (tab closed, etc.): grade as blank.
  if v_elapsed > cfg.duration_seconds + cfg.grace_seconds then
    v_graded := _exam_grade(v_student.id, v_attempt.id, '{}'::jsonb);
    return _ok(jsonb_build_object('status', v_graded ->> 'status', 'student', _student_json(v_student),
      'result', v_graded -> 'result'));
  end if;

  return _ok(jsonb_build_object(
    'status', 'in_progress',
    'student', _student_json(v_student),
    'secondsRemaining', greatest(0, floor(cfg.duration_seconds - v_elapsed))::integer,
    'questions', v_questions));
end $$;

create function public.exam_submit(p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_student students;
  v_lock exam_locks;
  v_attempt exam_attempts;
  v_answers jsonb := p_answers;
begin
  select * into cfg from _exam_config();

  v_student := _current_student();
  if v_student.id is null then
    return _err('Please sign in with your student account.');
  end if;

  perform 1 from students where id = v_student.id for update;

  if not exists (select 1 from enrollments where student_id = v_student.id and status = 'approved') then
    return _err('Your exam unlocks once your course enrolment is approved.');
  end if;

  select * into v_lock from exam_locks where student_id = v_student.id;
  if v_lock.student_id is not null then
    return _ok(jsonb_build_object('status', 'locked', 'review', '[]'::jsonb,
      'result', jsonb_build_object('score', v_lock.score, 'percentage', v_lock.percentage, 'passed', false)));
  end if;

  select * into v_attempt from exam_attempts
  where student_id = v_student.id order by id desc limit 1;

  if v_attempt.id is null or v_attempt.submitted_at is not null then
    return _err('There is no exam in progress. Please reload the page.');
  end if;

  if v_answers is null or jsonb_typeof(v_answers) <> 'object' or pg_column_size(v_answers) > 10000 then
    v_answers := '{}'::jsonb;
  end if;

  -- Submissions after the deadline (e.g. a paused clock) are graded as blank.
  if extract(epoch from now() - v_attempt.started_at) > cfg.duration_seconds + cfg.grace_seconds then
    v_answers := '{}'::jsonb;
  end if;

  return _ok(_exam_grade(v_student.id, v_attempt.id, v_answers));
end $$;

-- ---------------------------------------------------------------------------
-- 6. Admin API: enrolments
-- ---------------------------------------------------------------------------

create function public.admin_list_enrollments() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(row_json order by sort_pending, created_at desc)
    from (
      select (e.status <> 'pending') as sort_pending, e.created_at,
             _enrollment_json(e) || jsonb_build_object(
               'studentId', s.id, 'studentName', s.name,
               'email', coalesce(s.email, ''), 'phone', coalesce(s.phone, ''),
               'message', coalesce(e.message, '')) as row_json
      from enrollments e join students s on s.id = e.student_id
      order by (e.status <> 'pending'), e.created_at desc
      limit 500
    ) enrollment_rows), '[]'::jsonb));
end $$;

create function public.admin_set_enrollment_status(p_enrollment_id bigint, p_status text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_enrollment enrollments;
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;
  if p_status not in ('pending', 'approved', 'rejected') then
    return _err('Invalid status.');
  end if;

  update enrollments
  set status = p_status, decided_at = case when p_status = 'pending' then null else now() end
  where id = p_enrollment_id
  returning * into v_enrollment;

  if v_enrollment.id is null then
    return _err('Enrolment not found.');
  end if;
  return _ok(_enrollment_json(v_enrollment));
end $$;

-- ---------------------------------------------------------------------------
-- 7. Permissions
-- ---------------------------------------------------------------------------

revoke execute on function
  public.handle_new_student_user(), public.handle_student_email_change(),
  public._student_json(public.students), public._current_student(),
  public._enrollment_json(public.enrollments),
  public.student_profile(), public.student_update_profile(text, text),
  public.student_enroll(text, text, text),
  public.exam_get(), public.exam_submit(jsonb),
  public.admin_list_enrollments(), public.admin_set_enrollment_status(bigint, text)
from public, anon, authenticated;

grant execute on function
  public.student_profile(), public.student_update_profile(text, text),
  public.student_enroll(text, text, text),
  public.exam_get(), public.exam_submit(jsonb),
  public.admin_list_enrollments(), public.admin_set_enrollment_status(bigint, text)
to authenticated;
