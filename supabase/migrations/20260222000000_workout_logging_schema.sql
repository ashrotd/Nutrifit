-- =====================
-- EXERCISE CATALOG (global + user-created exercises for the workout logger)
-- Distinct from `exercises` (which is scoped to a workout_plan day / routine
-- template). This is the searchable catalog used to add exercises to a
-- live/finished session.
-- =====================
create table exercise_catalog (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  muscle_group text not null check (muscle_group in (
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'core', 'quads', 'hamstrings', 'glutes', 'calves', 'full_body'
  )),
  equipment text not null check (equipment in (
    'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight',
    'kettlebell', 'resistance_band', 'pull_up_bar'
  )),
  instructions text,
  is_custom boolean default false,
  user_id uuid references profiles(id) on delete cascade, -- null = global seed exercise
  created_at timestamptz default now()
);

create index idx_exercise_catalog_muscle_group on exercise_catalog(muscle_group);
create index idx_exercise_catalog_user_id on exercise_catalog(user_id);

-- =====================
-- WORKOUT EXERCISES (exercises added to a session, in order)
-- =====================
create table workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid references workout_logs(id) on delete cascade not null,
  exercise_id uuid references exercise_catalog(id) not null,
  order_index integer default 0,
  rest_seconds integer default 90,
  created_at timestamptz default now()
);

create index idx_workout_exercises_workout_log_id on workout_exercises(workout_log_id);
create index idx_workout_exercises_exercise_id on workout_exercises(exercise_id);

-- =====================
-- SET LOGS — extend with catalog link, session grouping, completion state
-- =====================
alter table set_logs
  add column workout_exercise_id uuid references workout_exercises(id) on delete cascade,
  add column exercise_id uuid references exercise_catalog(id),
  add column is_warmup boolean default false,
  add column completed boolean default true;

create index idx_set_logs_workout_exercise_id on set_logs(workout_exercise_id);
create index idx_set_logs_exercise_id on set_logs(exercise_id);
