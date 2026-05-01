create policy "Instructors can read gym sessions for enrolled students"
on public.gym_sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.student_id = gym_sessions.student_id
      and e.status = 'accepted'
      and c.instructor_id = (select auth.uid())
  )
);

create policy "Instructors can read gym messages for enrolled students"
on public.gym_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.gym_sessions gs
    join public.enrollments e on e.student_id = gs.student_id
    join public.courses c on c.id = e.course_id
    where gs.id = gym_messages.session_id
      and e.status = 'accepted'
      and c.instructor_id = (select auth.uid())
  )
);
