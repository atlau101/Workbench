alter table public.assignment_attempts
  add column if not exists instructor_flagged boolean not null default false;

create policy "Instructors can flag attempts for their assignments"
on public.assignment_attempts
for update
to authenticated
using (
  exists (
    select 1
    from public.assignments
    where assignments.id = assignment_attempts.assignment_id
      and assignments.instructor_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assignments
    where assignments.id = assignment_attempts.assignment_id
      and assignments.instructor_id = (select auth.uid())
  )
);
