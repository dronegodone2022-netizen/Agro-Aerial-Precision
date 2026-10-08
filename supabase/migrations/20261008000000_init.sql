-- Agro Aerial Precision backend (Supabase / Postgres)
--
-- Security model: every table has RLS enabled with NO policies and all table
-- privileges revoked, so the public (anon) key cannot read or write any table.
-- The browser can only call the SECURITY DEFINER functions granted at the bottom
-- of this file. Grading, timing and locks therefore run on the server and the
-- answer key never leaves the database.
--
-- Run this whole file once in the Supabase SQL Editor (or `supabase db push`).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.students (
  id text primary key,
  name text not null,
  email text,
  pin text not null,
  created_at timestamptz not null default now()
);
comment on column public.students.pin is
  'Type the plain PIN in the Table Editor - a trigger replaces it with a bcrypt hash.';

create table public.exam_questions (
  id integer primary key,
  question text not null,
  options text[] not null check (cardinality(options) between 2 and 6),
  correct_option integer not null,
  rationale text not null default '',
  active boolean not null default true,
  check (correct_option between 1 and cardinality(options))
);
comment on column public.exam_questions.correct_option is 'Position of the correct option in "options", starting at 1.';

create table public.exam_sessions (
  token uuid primary key default gen_random_uuid(),
  student_id text not null references public.students (id) on delete cascade,
  expires_at timestamptz not null
);

create table public.exam_attempts (
  id bigint generated always as identity primary key,
  student_id text not null references public.students (id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer,
  total integer,
  percentage integer,
  passed boolean,
  answers jsonb
);
create index exam_attempts_student_idx on public.exam_attempts (student_id, id desc);

create table public.exam_locks (
  student_id text primary key references public.students (id) on delete cascade,
  attempt_id bigint references public.exam_attempts (id) on delete set null,
  score integer not null,
  percentage integer not null,
  created_at timestamptz not null default now()
);

create table public.login_failures (
  key text primary key,
  failures integer not null default 0,
  window_started_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.certificates (
  id text primary key,
  name text not null,
  course text not null,
  issued_on text,
  drive_link text,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_locks enable row level security;
alter table public.login_failures enable row level security;
alter table public.admins enable row level security;
alter table public.certificates enable row level security;

revoke all on table
  public.students, public.exam_questions, public.exam_sessions, public.exam_attempts,
  public.exam_locks, public.login_failures, public.admins, public.certificates
from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Triggers: normalise IDs and hash PINs
-- ---------------------------------------------------------------------------

create function public.students_before_write() returns trigger
language plpgsql set search_path = public, extensions as $$
begin
  new.id := upper(trim(new.id));
  new.pin := trim(new.pin);
  if new.pin !~ '^\$2[aby]\$' then
    new.pin := crypt(new.pin, gen_salt('bf'));
  end if;
  return new;
end $$;

create trigger students_before_write
before insert or update on public.students
for each row execute function public.students_before_write();

create function public.certificates_before_write() returns trigger
language plpgsql set search_path = public as $$
begin
  new.id := upper(trim(new.id));
  return new;
end $$;

create trigger certificates_before_write
before insert or update on public.certificates
for each row execute function public.certificates_before_write();

-- ---------------------------------------------------------------------------
-- Internal helpers (not callable from the browser)
-- ---------------------------------------------------------------------------

create function public._exam_config(
  out duration_seconds integer,
  out grace_seconds integer,
  out passing_percentage integer,
  out session_hours integer
) language sql immutable set search_path = public as $$
  select 5 * 60,  -- exam length
         60,      -- allowance for slow connections when the timer runs out
         80,      -- pass mark
         2        -- student session lifetime
$$;

create function public._ok(p_data jsonb) returns jsonb
language sql immutable set search_path = public as $$ select jsonb_build_object('ok', true, 'data', p_data) $$;

create function public._err(p_message text) returns jsonb
language sql immutable set search_path = public as $$ select jsonb_build_object('ok', false, 'error', p_message) $$;

create function public._student_json(p_student public.students) returns jsonb
language sql immutable set search_path = public as $$
  select jsonb_build_object('id', p_student.id, 'name', p_student.name, 'email', coalesce(p_student.email, ''))
$$;

create function public._session_student(p_token text) returns public.students
language sql stable set search_path = public as $$
  select s.*
  from students s
  join exam_sessions es on es.student_id = s.id
  where es.token::text = p_token and es.expires_at > now()
$$;

create function public._record_failure(p_key text) returns void
language sql set search_path = public as $$
  insert into login_failures (key, failures, window_started_at)
  values (p_key, 1, now())
  on conflict (key) do update set
    failures = case when login_failures.window_started_at < now() - interval '15 minutes'
                    then 1 else login_failures.failures + 1 end,
    window_started_at = case when login_failures.window_started_at < now() - interval '15 minutes'
                             then now() else login_failures.window_started_at end
$$;

create function public._is_rate_limited(p_key text, p_max integer) returns boolean
language sql stable set search_path = public as $$
  select exists (
    select 1 from login_failures
    where key = p_key
      and window_started_at > now() - interval '15 minutes'
      and failures >= p_max
  )
$$;

create function public._is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

-- Grades an attempt, records the result and locks the exam on failure.
create function public._exam_grade(p_student_id text, p_attempt_id bigint, p_answers jsonb) returns jsonb
language plpgsql set search_path = public as $$
declare
  cfg record;
  q record;
  v_chosen integer;
  v_correct boolean;
  v_score integer := 0;
  v_total integer := 0;
  v_percentage integer;
  v_passed boolean;
  v_review jsonb := '[]'::jsonb;
  v_explanations jsonb := '[]'::jsonb;
begin
  select * into cfg from _exam_config();

  for q in select * from exam_questions where active order by id loop
    v_total := v_total + 1;
    v_chosen := nullif(left(regexp_replace(coalesce(p_answers ->> q.id::text, ''), '[^0-9]', '', 'g'), 2), '')::integer;
    v_correct := v_chosen is not null and v_chosen = q.correct_option;
    if v_correct then
      v_score := v_score + 1;
    end if;
    v_review := v_review || jsonb_build_array(jsonb_build_object(
      'questionId', q.id::text, 'chosenOption', v_chosen, 'isCorrect', v_correct));
    v_explanations := v_explanations || jsonb_build_array(jsonb_build_object(
      'questionId', q.id::text, 'correctOption', q.correct_option, 'rationale', q.rationale));
  end loop;

  v_percentage := case when v_total = 0 then 0 else round(v_score * 100.0 / v_total) end;
  v_passed := v_total > 0 and v_percentage >= cfg.passing_percentage;

  update exam_attempts
  set submitted_at = now(), score = v_score, total = v_total,
      percentage = v_percentage, passed = v_passed, answers = p_answers
  where id = p_attempt_id;

  if not v_passed then
    insert into exam_locks (student_id, attempt_id, score, percentage)
    values (p_student_id, p_attempt_id, v_score, v_percentage)
    on conflict (student_id) do update set
      attempt_id = excluded.attempt_id, score = excluded.score,
      percentage = excluded.percentage, created_at = now();
  end if;

  -- Correct answers and explanations are only revealed to students who passed,
  -- so a failed student can't memorise the key before a retake.
  return jsonb_build_object(
      'status', case when v_passed then 'passed' else 'locked' end,
      'result', jsonb_build_object('score', v_score, 'total', v_total, 'percentage', v_percentage, 'passed', v_passed),
      'review', v_review)
    || case when v_passed then jsonb_build_object('explanations', v_explanations) else '{}'::jsonb end;
end $$;

-- ---------------------------------------------------------------------------
-- Student API
-- ---------------------------------------------------------------------------

create function public.exam_login(p_student_id text, p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  cfg record;
  v_id text := upper(trim(coalesce(p_student_id, '')));
  v_key text := 'login:' || upper(trim(coalesce(p_student_id, '')));
  v_student students;
  v_token uuid;
begin
  select * into cfg from _exam_config();

  if _is_rate_limited(v_key, 5) then
    return _err('Too many failed attempts. Please wait 15 minutes and try again.');
  end if;

  select * into v_student from students where id = v_id;
  if v_student.id is null
     or coalesce(trim(p_pin), '') = ''
     or v_student.pin <> crypt(trim(p_pin), v_student.pin) then
    perform _record_failure(v_key);
    return _err('Invalid Student ID or PIN.');
  end if;

  delete from login_failures where key = v_key;
  delete from exam_sessions where expires_at < now();

  insert into exam_sessions (student_id, expires_at)
  values (v_id, now() + make_interval(hours => cfg.session_hours))
  returning token into v_token;

  return _ok(jsonb_build_object('sessionToken', v_token, 'student', _student_json(v_student)));
end $$;

create function public.exam_get(p_session_token text) returns jsonb
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

  v_student := _session_student(p_session_token);
  if v_student.id is null then
    return _err('Your session has expired. Please log in again.');
  end if;

  -- Serialise requests per student so double-clicks can't create two attempts.
  perform 1 from students where id = v_student.id for update;

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

create function public.exam_submit(p_session_token text, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  cfg record;
  v_student students;
  v_lock exam_locks;
  v_attempt exam_attempts;
  v_answers jsonb := p_answers;
begin
  select * into cfg from _exam_config();

  v_student := _session_student(p_session_token);
  if v_student.id is null then
    return _err('Your session has expired. Please log in again.');
  end if;

  perform 1 from students where id = v_student.id for update;

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
-- Admin API (requires a Supabase Auth user listed in public.admins)
-- ---------------------------------------------------------------------------

create function public.admin_list_locks() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(jsonb_build_object(
             'studentId', l.student_id, 'studentName', s.name, 'email', coalesce(s.email, ''),
             'score', l.score, 'percentage', l.percentage, 'createdAt', l.created_at)
           order by l.created_at desc)
    from exam_locks l join students s on s.id = l.student_id), '[]'::jsonb));
end $$;

create function public.admin_unlock(p_student_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  delete from exam_locks where student_id = upper(trim(coalesce(p_student_id, '')));
  if not found then
    return _err('No locked exam was found for that student ID.');
  end if;

  return _ok(jsonb_build_object('cleared', true));
end $$;

create function public.admin_recent_attempts(p_limit integer default 50) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin() then
    return _err('This account is not an exam administrator.');
  end if;

  return _ok(coalesce((
    select jsonb_agg(row_json order by started_at desc)
    from (
      select a.started_at,
             jsonb_build_object(
               'id', a.id, 'studentId', a.student_id, 'studentName', s.name,
               'startedAt', a.started_at, 'submittedAt', a.submitted_at,
               'score', a.score, 'total', a.total, 'percentage', a.percentage, 'passed', a.passed) as row_json
      from exam_attempts a join students s on s.id = a.student_id
      order by a.started_at desc
      limit least(greatest(coalesce(p_limit, 50), 1), 500)
    ) recent), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------------------------
-- Public certificate lookup (one ID at a time - the list itself stays private)
-- ---------------------------------------------------------------------------

create function public.verify_certificate(p_id text) returns jsonb
language sql stable security definer set search_path = public as $$
  select _ok((
    select jsonb_build_object('id', c.id, 'name', c.name, 'course', c.course,
                              'issued_on', c.issued_on, 'drive_link', c.drive_link)
    from certificates c where c.id = upper(trim(coalesce(p_id, '')))
  ))
$$;

-- ---------------------------------------------------------------------------
-- Permissions. Postgres and Supabase grant EXECUTE on new functions to everyone
-- by default, so revoke everything first and then grant only the public API.
-- ---------------------------------------------------------------------------

revoke execute on function
  public.students_before_write(), public.certificates_before_write(),
  public._exam_config(), public._ok(jsonb), public._err(text),
  public._student_json(public.students), public._session_student(text),
  public._record_failure(text), public._is_rate_limited(text, integer), public._is_admin(),
  public._exam_grade(text, bigint, jsonb),
  public.exam_login(text, text), public.exam_get(text), public.exam_submit(text, jsonb),
  public.admin_list_locks(), public.admin_unlock(text), public.admin_recent_attempts(integer),
  public.verify_certificate(text)
from public, anon, authenticated;

grant execute on function
  public.exam_login(text, text), public.exam_get(text), public.exam_submit(text, jsonb),
  public.verify_certificate(text)
to anon, authenticated;

grant execute on function
  public.admin_list_locks(), public.admin_unlock(text), public.admin_recent_attempts(integer)
to authenticated;
