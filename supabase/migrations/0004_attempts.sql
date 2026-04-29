do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'attempt_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.attempt_status as enum ('reflect', 'ai_assist', 'synthesize', 'complete');
  end if;
end
$$;

create table public.assignment_attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status public.attempt_status not null default 'reflect',
  started_at timestamptz not null default now(),
  gate_passed_at timestamptz,
  final_draft_saved_at timestamptz,
  unique (assignment_id, student_id)
);

create table public.reflection_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assignment_attempts(id) on delete cascade,
  prompt_id text not null,
  response text not null default '',
  word_count int not null default 0,
  frozen boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (attempt_id, prompt_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assignment_attempts(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table public.final_outputs (
  attempt_id uuid primary key references public.assignment_attempts(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.assignment_attempts enable row level security;
alter table public.reflection_responses enable row level security;
alter table public.chat_messages enable row level security;
alter table public.final_outputs enable row level security;

create policy "Students can manage their own attempts"
on public.assignment_attempts
for all
to authenticated
using ((select auth.uid()) = student_id)
with check ((select auth.uid()) = student_id);

create policy "Instructors can read attempts for their assignments"
on public.assignment_attempts
for select
to authenticated
using (
  exists (
    select 1
    from public.assignments
    where assignments.id = assignment_attempts.assignment_id
      and assignments.instructor_id = (select auth.uid())
  )
);

create policy "Students can manage their own reflection responses"
on public.reflection_responses
for all
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    where assignment_attempts.id = reflection_responses.attempt_id
      and assignment_attempts.student_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assignment_attempts
    where assignment_attempts.id = reflection_responses.attempt_id
      and assignment_attempts.student_id = (select auth.uid())
  )
);

create policy "Instructors can read reflection responses for their assignments"
on public.reflection_responses
for select
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    join public.assignments
      on assignments.id = assignment_attempts.assignment_id
    where assignment_attempts.id = reflection_responses.attempt_id
      and assignments.instructor_id = (select auth.uid())
  )
);

create policy "Students can manage their own chat messages"
on public.chat_messages
for all
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    where assignment_attempts.id = chat_messages.attempt_id
      and assignment_attempts.student_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assignment_attempts
    where assignment_attempts.id = chat_messages.attempt_id
      and assignment_attempts.student_id = (select auth.uid())
  )
);

create policy "Instructors can read chat messages for their assignments"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    join public.assignments
      on assignments.id = assignment_attempts.assignment_id
    where assignment_attempts.id = chat_messages.attempt_id
      and assignments.instructor_id = (select auth.uid())
  )
);

create policy "Students can manage their own final outputs"
on public.final_outputs
for all
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    where assignment_attempts.id = final_outputs.attempt_id
      and assignment_attempts.student_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.assignment_attempts
    where assignment_attempts.id = final_outputs.attempt_id
      and assignment_attempts.student_id = (select auth.uid())
  )
);

create policy "Instructors can read final outputs for their assignments"
on public.final_outputs
for select
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    join public.assignments
      on assignments.id = assignment_attempts.assignment_id
    where assignment_attempts.id = final_outputs.attempt_id
      and assignments.instructor_id = (select auth.uid())
  )
);
