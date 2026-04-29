create type public.gate_level as enum ('high', 'low', 'progressive');

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  prompt text not null,
  gate_level public.gate_level not null default 'high',
  ai_msg_limit int not null default 20,
  scaffolding_prompts jsonb not null default '[]',
  stage_instructions jsonb,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create policy "Instructors can manage their own assignments"
on public.assignments
for all
to authenticated
using ((select auth.uid()) = instructor_id)
with check ((select auth.uid()) = instructor_id);

create policy "Public can read assignments by id"
on public.assignments
for select
to anon, authenticated
using (true);

create table public.assignment_templates (
  id uuid primary key default gen_random_uuid(),
  discipline text not null,
  task_type text not null,
  title text not null,
  prompt text not null,
  default_scaffolding jsonb not null default '[]',
  default_gate_level public.gate_level not null default 'high'
);

alter table public.assignment_templates enable row level security;

create policy "Public can read templates"
on public.assignment_templates
for select
to anon, authenticated
using (true);

-- Seed templates (5 disciplines, 1 each)
insert into public.assignment_templates (discipline, task_type, title, prompt, default_scaffolding, default_gate_level) values
(
  'Humanities',
  'Analytical Essay',
  'Logical Fallacies in Everyday Media',
  'Find two examples of logical fallacies in recent news articles or advertisements. Identify the fallacy type for each, explain why it qualifies, and discuss the rhetorical effect it may have on its audience.',
  '[
    {"id":"h1","text":"What is your initial reaction to the fallacy you found? Why does it feel persuasive despite being flawed?","enabled":true},
    {"id":"h2","text":"Can you state the argument in a neutral way before labeling the fallacy?","enabled":true},
    {"id":"h3","text":"Who is the intended audience and how might they be affected?","enabled":true}
  ]'::jsonb,
  'high'
),
(
  'STEM',
  'Problem-Solving Report',
  'Algorithmic Complexity Analysis',
  'Select a classic algorithm (e.g., bubble sort, binary search, Dijkstra''s). Describe how it works, analyze its time and space complexity, and explain a real-world scenario where choosing the wrong algorithm would cause a measurable performance problem.',
  '[
    {"id":"s1","text":"In plain language, what problem does this algorithm solve?","enabled":true},
    {"id":"s2","text":"Walk through a small example step by step before writing any formulas.","enabled":true},
    {"id":"s3","text":"What assumption does the algorithm make about the input, and when does that break down?","enabled":true}
  ]'::jsonb,
  'high'
),
(
  'Social Sciences',
  'Case Study',
  'Confirmation Bias in Research Design',
  'Identify a real or hypothetical research study where confirmation bias may have affected the methodology or conclusions. Describe how the bias manifested, what alternative design choices could have mitigated it, and what this reveals about scientific objectivity.',
  '[
    {"id":"ss1","text":"What result do you think the researchers wanted to find? What evidence suggests that?","enabled":true},
    {"id":"ss2","text":"What control or comparison group was missing, and why does that matter?","enabled":true},
    {"id":"ss3","text":"How might the conclusions have differed with a double-blind design?","enabled":true}
  ]'::jsonb,
  'progressive'
),
(
  'Business',
  'Strategic Memo',
  'Economies of Scale — Cost vs. Risk Tradeoff',
  'A mid-size manufacturing company is considering doubling production capacity to reduce per-unit costs. Write a strategic memo that evaluates the potential economies of scale, the associated risks (financial, operational, market), and your recommendation with supporting rationale.',
  '[
    {"id":"b1","text":"What is the core trade-off this decision hinges on?","enabled":true},
    {"id":"b2","text":"What data would you need to feel confident in your recommendation?","enabled":true},
    {"id":"b3","text":"Who are the stakeholders most affected, and how might their interests conflict?","enabled":true}
  ]'::jsonb,
  'progressive'
),
(
  'Computer Science',
  'Design Document',
  'API Design: Trade-offs Between REST and GraphQL',
  'You are designing the data layer for a new mobile application with a complex, nested data model. Write a design document that compares REST and GraphQL for this use case, evaluates the trade-offs for your specific constraints, and justifies your final choice.',
  '[
    {"id":"cs1","text":"What are the primary read patterns for this app? How frequently and in what combinations is data fetched?","enabled":true},
    {"id":"cs2","text":"What are the team''s existing skills and toolchain constraints?","enabled":true},
    {"id":"cs3","text":"What does the worst-case scenario look like for each option at 10x your initial user load?","enabled":true}
  ]'::jsonb,
  'low'
);
