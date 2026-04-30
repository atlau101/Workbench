-- courses table
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "instructors_manage_own_courses"
  on public.courses for all
  using (instructor_id = auth.uid())
  with check (instructor_id = auth.uid());

-- Add course_id to assignments (nullable for backfill)
alter table public.assignments
  add column course_id uuid references public.courses(id) on delete set null;

-- Backfill: for each instructor with assignments, create "My Course" and wire it up
do $$
declare
  r record;
  cid uuid;
begin
  for r in
    select distinct instructor_id from public.assignments where course_id is null
  loop
    insert into public.courses(instructor_id, name)
    values (r.instructor_id, 'My Course')
    returning id into cid;

    update public.assignments
    set course_id = cid
    where instructor_id = r.instructor_id and course_id is null;
  end loop;
end $$;

-- Now enforce NOT NULL
alter table public.assignments alter column course_id set not null;
