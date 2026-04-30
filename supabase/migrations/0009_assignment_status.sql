create type public.assignment_status as enum ('draft', 'published', 'hidden');

alter table public.assignments
  add column status public.assignment_status not null default 'draft';

-- Backfill existing rows to published so current access links keep working
update public.assignments set status = 'published';

drop policy if exists "Public can read assignments by id" on public.assignments;
drop policy if exists "Public can view all assignments" on public.assignments;

create policy "published_assignments_readable"
  on public.assignments for select
  using (status = 'published' and auth.uid() is not null);
-- Note: the existing instructor "manage own" policy from 0002 still covers draft reads for instructors.
