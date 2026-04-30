create type public.enrollment_status as enum ('pending', 'accepted', 'declined');

create extension if not exists citext;

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_email citext not null,
  student_id uuid references public.profiles(id) on delete set null,
  status public.enrollment_status not null default 'pending',
  invited_by uuid not null references public.profiles(id),
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(course_id, student_email)
);

alter table public.enrollments enable row level security;

-- Security definer function avoids infinite recursion:
-- courses policy → enrollments → courses would loop; definer bypasses RLS on the inner courses query
create or replace function public.is_course_instructor(p_course_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.courses where id = p_course_id and instructor_id = auth.uid()
  );
$$;

create policy "instructors_manage_course_enrollments"
  on public.enrollments for all
  using  (public.is_course_instructor(course_id))
  with check (public.is_course_instructor(course_id));

create policy "students_read_own_enrollments"
  on public.enrollments for select
  using (
    student_id = auth.uid()
    or lower(student_email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "students_respond_to_invite"
  on public.enrollments for update
  using (
    student_id = auth.uid()
    or lower(student_email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (status in ('accepted', 'declined'));

create or replace function public.link_enrollment_on_signup()
returns trigger language plpgsql security definer as $$
begin
  update public.enrollments
  set student_id = NEW.id
  where lower(student_email::text) = lower(NEW.email)
    and student_id is null;
  return NEW;
end;
$$;

create trigger trg_link_enrollment_on_signup
  after insert on public.profiles
  for each row execute function public.link_enrollment_on_signup();

create policy "students_read_enrolled_courses"
  on public.courses for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = id
        and e.status = 'accepted'
        and (
          e.student_id = auth.uid()
          or lower(e.student_email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );
