create or replace function public.is_student_enrolled_in_course(p_course_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments
    where course_id = p_course_id
      and status = 'accepted'
      and (
        student_id = auth.uid()
        or lower(student_email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

drop policy if exists "students_read_enrolled_courses" on public.courses;

create policy "students_read_enrolled_courses"
  on public.courses
  for select
  using (public.is_student_enrolled_in_course(id));
