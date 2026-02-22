-- =====================
-- ROW LEVEL SECURITY
-- Users can only access their own data
-- =====================

alter table profiles enable row level security;
alter table metrics enable row level security;
alter table workout_plans enable row level security;
alter table workout_days enable row level security;
alter table exercises enable row level security;
alter table workout_logs enable row level security;
alter table set_logs enable row level security;
alter table food_logs enable row level security;
alter table food_items enable row level security;
alter table health_data enable row level security;
alter table chat_messages enable row level security;
alter table user_notes enable row level security;
alter table personal_records enable row level security;
alter table water_logs enable row level security;

-- Profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Metrics
create policy "Users can crud own metrics"
  on metrics for all using (auth.uid() = user_id);

-- Workout Plans
create policy "Users can crud own workout plans"
  on workout_plans for all using (auth.uid() = user_id);

-- Workout Days (via plan ownership)
create policy "Users can crud own workout days"
  on workout_days for all using (
    exists (
      select 1 from workout_plans
      where workout_plans.id = workout_days.plan_id
      and workout_plans.user_id = auth.uid()
    )
  );

-- Exercises (via day → plan ownership)
create policy "Users can crud own exercises"
  on exercises for all using (
    exists (
      select 1 from workout_days
      join workout_plans on workout_plans.id = workout_days.plan_id
      where workout_days.id = exercises.day_id
      and workout_plans.user_id = auth.uid()
    )
  );

-- Workout Logs
create policy "Users can crud own workout logs"
  on workout_logs for all using (auth.uid() = user_id);

-- Set Logs (via workout log ownership)
create policy "Users can crud own set logs"
  on set_logs for all using (
    exists (
      select 1 from workout_logs
      where workout_logs.id = set_logs.workout_log_id
      and workout_logs.user_id = auth.uid()
    )
  );

-- Food Logs
create policy "Users can crud own food logs"
  on food_logs for all using (auth.uid() = user_id);

-- Food Items (via food log ownership)
create policy "Users can crud own food items"
  on food_items for all using (
    exists (
      select 1 from food_logs
      where food_logs.id = food_items.log_id
      and food_logs.user_id = auth.uid()
    )
  );

-- Health Data
create policy "Users can crud own health data"
  on health_data for all using (auth.uid() = user_id);

-- Chat Messages
create policy "Users can crud own chat messages"
  on chat_messages for all using (auth.uid() = user_id);

-- User Notes
create policy "Users can crud own notes"
  on user_notes for all using (auth.uid() = user_id);

-- Personal Records
create policy "Users can crud own personal records"
  on personal_records for all using (auth.uid() = user_id);

-- Water Logs
create policy "Users can crud own water logs"
  on water_logs for all using (auth.uid() = user_id);