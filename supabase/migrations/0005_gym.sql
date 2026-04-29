do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'gym_mode'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.gym_mode as enum (
      'brainstorming',
      'critical_analysis',
      'structured_argumentation',
      'problem_decomposition',
      'reflective_writing'
    );
  end if;
end
$$;

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  prompt text not null,
  discipline text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  mode_tags public.gym_mode[] not null,
  created_at timestamptz not null default now()
);

create table public.gym_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  mode public.gym_mode not null,
  scenario_id uuid references public.scenarios(id) on delete set null,
  custom_topic text,
  scaffolding jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.gym_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.gym_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.scenarios enable row level security;
alter table public.gym_sessions enable row level security;
alter table public.gym_messages enable row level security;

create policy "Anyone can read scenarios"
on public.scenarios
for select
to public
using (true);

create policy "Students can manage their own gym sessions"
on public.gym_sessions
for all
to authenticated
using ((select auth.uid()) = student_id)
with check ((select auth.uid()) = student_id);

create policy "Students can manage messages for their own gym sessions"
on public.gym_messages
for all
to authenticated
using (
  exists (
    select 1
    from public.gym_sessions
    where gym_sessions.id = gym_messages.session_id
      and gym_sessions.student_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.gym_sessions
    where gym_sessions.id = gym_messages.session_id
      and gym_sessions.student_id = (select auth.uid())
  )
);

insert into public.scenarios (title, prompt, discipline, difficulty, mode_tags)
values
  (
    'Reframing a Campus Food-Waste Campaign',
    'Your student organization wants a fresh campaign to reduce food waste in dining halls. Generate approaches that go beyond posters and guilt-based messaging while still being realistic for a semester-long pilot.',
    'Humanities',
    'beginner',
    array['brainstorming', 'problem_decomposition']::public.gym_mode[]
  ),
  (
    'Reading a Novel Through Competing Lenses',
    'You need to compare how a single novel changes when read through feminist, postcolonial, and psychoanalytic lenses. Surface where each lens highlights different details and what each one might obscure.',
    'Humanities',
    'intermediate',
    array['critical_analysis', 'structured_argumentation']::public.gym_mode[]
  ),
  (
    'Museum Exhibit on Historical Memory',
    'A local museum is designing an exhibit about a contested historical event. Think through how curators might present multiple narratives without flattening the political stakes.',
    'Humanities',
    'advanced',
    array['critical_analysis', 'reflective_writing']::public.gym_mode[]
  ),
  (
    'Writing About a Failed Group Presentation',
    'Reflect on a group presentation that went poorly because roles were unclear and preparation broke down. Use the session to turn the experience into a more honest account of communication, responsibility, and repair.',
    'Humanities',
    'beginner',
    array['reflective_writing']::public.gym_mode[]
  ),
  (
    'Choosing Variables for a Heat-Transfer Study',
    'You are planning a small heat-transfer experiment and can only vary a few parameters. Break the study into measurable subproblems so you can decide which variables matter most first.',
    'STEM',
    'beginner',
    array['problem_decomposition']::public.gym_mode[]
  ),
  (
    'Explaining a Counterintuitive Statistics Result',
    'A dataset shows a trend that seems to reverse when segmented by subgroup. Analyze what could explain the reversal and what evidence you would need before making a public claim.',
    'STEM',
    'intermediate',
    array['critical_analysis', 'structured_argumentation']::public.gym_mode[]
  ),
  (
    'New Angles on Microplastics Research',
    'You want ideas for a research proposal on microplastics that does not repeat the most common environmental-health framing. Generate adjacent, plausible angles worth exploring.',
    'STEM',
    'intermediate',
    array['brainstorming']::public.gym_mode[]
  ),
  (
    'Reflecting on a Debugging Breakthrough',
    'Think through a moment when a technical problem finally made sense after hours of confusion. Focus on what changed in your process, not just the final fix.',
    'STEM',
    'beginner',
    array['reflective_writing']::public.gym_mode[]
  ),
  (
    'Urban Transit and Equity Tradeoffs',
    'A city wants to redesign bus routes for efficiency, but the changes could reduce service in lower-income neighborhoods. Analyze the tradeoffs and the assumptions hiding inside the “efficiency” framing.',
    'Social Sciences',
    'advanced',
    array['critical_analysis', 'structured_argumentation']::public.gym_mode[]
  ),
  (
    'Interview Study on Student Burnout',
    'You are planning interviews about student burnout. Break the project into stages so you can decide what questions, sampling choices, and ethical safeguards need attention first.',
    'Social Sciences',
    'beginner',
    array['problem_decomposition']::public.gym_mode[]
  ),
  (
    'Reimagining Civic Engagement on Campus',
    'Generate a wider range of ways a campus might support civic engagement beyond voter-registration drives. Push for ideas that include students who distrust formal political channels.',
    'Social Sciences',
    'intermediate',
    array['brainstorming', 'critical_analysis']::public.gym_mode[]
  ),
  (
    'Field Notes After a Difficult Observation',
    'You left a field observation feeling uncomfortable about how your own presence shaped the interaction. Reflect on that discomfort and what it reveals about power, interpretation, and method.',
    'Social Sciences',
    'advanced',
    array['reflective_writing']::public.gym_mode[]
  ),
  (
    'Pricing a New Subscription Tier',
    'A software company is considering a mid-tier subscription plan. Break the pricing problem into demand signals, positioning questions, cannibalization risks, and rollout decisions.',
    'Business',
    'intermediate',
    array['problem_decomposition', 'structured_argumentation']::public.gym_mode[]
  ),
  (
    'Stress-Testing a “Remote Work Hurts Culture” Claim',
    'An executive argues that remote work inevitably weakens company culture. Challenge the claim, identify the hidden assumptions, and surface what evidence would actually support it.',
    'Business',
    'beginner',
    array['critical_analysis']::public.gym_mode[]
  ),
  (
    'Generating Partnerships for a Small Startup',
    'A startup needs creative partnership ideas that would expand trust and distribution without a large ad budget. Produce options across institutions, creators, and communities.',
    'Business',
    'beginner',
    array['brainstorming']::public.gym_mode[]
  ),
  (
    'Leading Through a Missed Quarterly Goal',
    'Reflect on how a team leader should communicate after missing a major quarterly goal. Focus on accountability, narrative framing, and what trust repair would require.',
    'Business',
    'intermediate',
    array['reflective_writing', 'structured_argumentation']::public.gym_mode[]
  ),
  (
    'Breaking Down a Recommendation-System Failure',
    'A recommendation system keeps amplifying low-quality content. Decompose the problem into data, objectives, ranking logic, feedback loops, and measurement.',
    'Computer Science',
    'advanced',
    array['problem_decomposition', 'critical_analysis']::public.gym_mode[]
  ),
  (
    'Defending a Privacy-First Product Decision',
    'You need to argue for a privacy-preserving product choice that may reduce short-term growth metrics. Structure the case with claims, evidence, tradeoffs, and counterarguments.',
    'Computer Science',
    'advanced',
    array['structured_argumentation']::public.gym_mode[]
  ),
  (
    'New Uses for a Campus LLM Tool',
    'Generate responsible, non-obvious use cases for a campus LLM tool that do not collapse into generic chatbot support. Explore instructional, administrative, and peer-learning angles.',
    'Computer Science',
    'intermediate',
    array['brainstorming']::public.gym_mode[]
  ),
  (
    'Reflecting on Shipping Too Fast',
    'You shipped a feature quickly and later discovered you had ignored edge cases that mattered to users. Reflect on what pressures drove the decision and how you would work differently next time.',
    'Computer Science',
    'intermediate',
    array['reflective_writing', 'critical_analysis']::public.gym_mode[]
  )
on conflict (title) do nothing;
