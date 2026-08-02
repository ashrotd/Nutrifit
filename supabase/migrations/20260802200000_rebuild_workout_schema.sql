-- Drop old workout tables (wrong schema from initial migration)
drop table if exists workout_logs cascade;
drop table if exists exercises cascade;
drop table if exists workout_exercises cascade;
drop table if exists workout_days cascade;
drop table if exists workout_plans cascade;

-- Workout plan
create table workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  goal text not null,
  workout_type text not null,
  split_days int not null,
  experience text not null,
  created_at timestamptz default now()
);

-- Each day in the plan
create table workout_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references workout_plans on delete cascade not null,
  day_number int not null,
  name text not null,
  muscle_groups text[] not null,
  is_rest boolean default false
);

-- Exercises within each day
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references workout_days on delete cascade not null,
  order_index int not null,
  name text not null,
  sets int not null,
  reps text,
  rest_seconds int default 90,
  muscle_primary text not null,
  muscles_secondary text[],
  why text,
  tips text,
  alternatives jsonb
);

-- Simple completion log
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  day_id uuid references workout_days not null,
  completed_at timestamptz default now()
);

-- RLS
alter table workout_plans     enable row level security;
alter table workout_days      enable row level security;
alter table workout_exercises enable row level security;
alter table workout_logs      enable row level security;

create policy "own plans"
  on workout_plans for all using (auth.uid() = user_id);

create policy "own days"
  on workout_days for all using (
    plan_id in (select id from workout_plans where user_id = auth.uid())
  );

create policy "own exercises"
  on workout_exercises for all using (
    day_id in (
      select id from workout_days where plan_id in (
        select id from workout_plans where user_id = auth.uid()
      )
    )
  );

create policy "own logs"
  on workout_logs for all using (auth.uid() = user_id);
