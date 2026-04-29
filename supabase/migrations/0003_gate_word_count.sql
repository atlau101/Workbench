-- 1. Create the new enum type
do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'gate_level_v2'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.gate_level_v2 as enum ('standard', 'progressive');
  end if;
end
$$;

-- 2. Add new column
alter table public.assignments
  add column if not exists min_word_count int not null default 150;

-- 3. Migrate assignments.gate_level directly to the new type (skip the intermediate UPDATE)
alter table public.assignments
  alter column gate_level drop default,
  alter column gate_level type public.gate_level_v2
  using (
    case
      when gate_level::text = 'progressive' then 'progressive'
      else 'standard'
    end
  )::public.gate_level_v2,
  alter column gate_level set default 'standard';

-- 4. Migrate assignment_templates.default_gate_level directly to the new type
alter table public.assignment_templates
  alter column default_gate_level drop default,
  alter column default_gate_level type public.gate_level_v2
  using (
    case
      when default_gate_level::text = 'progressive' then 'progressive'
      else 'standard'
    end
  )::public.gate_level_v2,
  alter column default_gate_level set default 'standard';

-- 5. Rename old enum out of the way, then rename v2 into its place
do $$
begin
  if exists (
    select 1 from pg_type
    where typname = 'gate_level'
      and typnamespace = 'public'::regnamespace
  ) then
    alter type public.gate_level rename to gate_level_legacy;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1 from pg_type
    where typname = 'gate_level_v2'
      and typnamespace = 'public'::regnamespace
  ) then
    alter type public.gate_level_v2 rename to gate_level;
  end if;
end
$$;