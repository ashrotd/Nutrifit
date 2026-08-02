-- =====================
-- ROW LEVEL SECURITY — exercise_catalog, workout_exercises
-- =====================

alter table exercise_catalog enable row level security;
alter table workout_exercises enable row level security;

-- Exercise catalog: everyone can read global (user_id is null) exercises
-- plus their own custom ones; users can only write their own custom ones.
create policy "Users can view global or own exercises"
  on exercise_catalog for select
  using (user_id is null or user_id = auth.uid());

create policy "Users can insert own custom exercises"
  on exercise_catalog for insert
  with check (user_id = auth.uid());

create policy "Users can update own custom exercises"
  on exercise_catalog for update
  using (user_id = auth.uid());

create policy "Users can delete own custom exercises"
  on exercise_catalog for delete
  using (user_id = auth.uid());

-- Workout exercises (via workout_log ownership)
create policy "Users can crud own workout exercises"
  on workout_exercises for all using (
    exists (
      select 1 from workout_logs
      where workout_logs.id = workout_exercises.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );
