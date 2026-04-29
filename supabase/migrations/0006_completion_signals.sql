do $$
begin
  if exists (
    select 1
    from pg_type
    where typname = 'attempt_status'
      and typnamespace = 'public'::regnamespace
  ) and not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.attempt_status'::regtype
      and enumlabel = 'submitted'
  ) then
    alter type public.attempt_status add value 'submitted';
  end if;
end
$$;

alter table public.assignment_attempts
add column if not exists submitted_at timestamptz;
