-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES
-- =====================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,
  age integer,
  sex text check (sex in ('male', 'female')),
  height numeric(5,2), -- cm
  weight numeric(5,2), -- kg
  weight_unit text default 'kg' check (weight_unit in ('kg', 'lbs')),
  height_unit text default 'cm' check (height_unit in ('cm', 'ft')),
  goal text check (goal in ('fat_loss', 'muscle_gain', 'recomposition', 'endurance', 'maintenance')),
  activity_level text check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  target_calories integer,
  target_protein integer,
  target_carbs integer,
  target_fat integer,
  bmr numeric(7,2),
  tdee numeric(7,2),
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- METRICS (weight, body fat, measurements over time)
-- =====================
create table metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  weight numeric(5,2),
  body_fat numeric(5,2),
  waist numeric(5,2),
  chest numeric(5,2),
  hips numeric(5,2),
  biceps numeric(5,2),
  thighs numeric(5,2),
  bmi numeric(5,2),
  bmr numeric(7,2),
  tdee numeric(7,2),
  notes text,
  recorded_at timestamptz default now()
);

-- =====================
-- WORKOUT PLANS
-- =====================
create table workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  weeks integer default 4,
  current_week integer default 1,
  is_active boolean default false,
  generated_by_ai boolean default false,
  created_at timestamptz default now()
);

-- =====================
-- WORKOUT DAYS
-- =====================
create table workout_days (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references workout_plans(id) on delete cascade not null,
  day_of_week integer check (day_of_week between 0 and 6), -- 0=Sunday
  name text not null, -- e.g. "Push Day", "Leg Day"
  order_index integer default 0
);

-- =====================
-- EXERCISES (in a plan)
-- =====================
create table exercises (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references workout_days(id) on delete cascade not null,
  name text not null,
  muscle_group text,
  equipment text,
  sets integer default 3,
  reps text default '8-12', -- range support e.g. "8-12"
  rest_seconds integer default 90,
  notes text,
  order_index integer default 0
);

-- =====================
-- WORKOUT LOGS (actual sessions)
-- =====================
create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  plan_id uuid references workout_plans(id) on delete set null,
  workout_day_id uuid references workout_days(id) on delete set null,
  name text not null,
  date date default current_date,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes integer,
  total_volume numeric(10,2) default 0, -- total kg lifted
  notes text,
  created_at timestamptz default now()
);

-- =====================
-- SET LOGS (individual sets in a session)
-- =====================
create table set_logs (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid references workout_logs(id) on delete cascade not null,
  exercise_name text not null,
  muscle_group text,
  set_number integer not null,
  weight numeric(6,2) default 0,
  reps integer not null,
  rpe numeric(3,1), -- rate of perceived exertion 1-10
  is_personal_record boolean default false,
  created_at timestamptz default now()
);

-- =====================
-- FOOD LOGS
-- =====================
create table food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date default current_date,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  raw_input text, -- original voice transcript
  created_at timestamptz default now()
);

-- =====================
-- FOOD ITEMS (within a food log)
-- =====================
create table food_items (
  id uuid default gen_random_uuid() primary key,
  log_id uuid references food_logs(id) on delete cascade not null,
  name text not null,
  quantity numeric(8,2) not null,
  unit text not null,
  calories numeric(8,2) not null,
  protein numeric(8,2) default 0,
  carbs numeric(8,2) default 0,
  fat numeric(8,2) default 0,
  fiber numeric(8,2) default 0,
  sugar numeric(8,2) default 0,
  sodium numeric(8,2) default 0,
  source text, -- 'edamam', 'barcode', 'manual', 'ai'
  created_at timestamptz default now()
);

-- =====================
-- HEALTH DATA (wearables sync)
-- =====================
create table health_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  steps integer,
  heart_rate integer,
  resting_heart_rate integer,
  active_calories numeric(8,2),
  total_calories numeric(8,2),
  sleep_hours numeric(4,2),
  sleep_quality text check (sleep_quality in ('poor', 'fair', 'good', 'excellent')),
  hrv numeric(6,2),
  vo2_max numeric(6,2),
  spo2 numeric(5,2),
  recorded_at timestamptz default now(),
  source text default 'healthkit' -- 'healthkit', 'health_connect', 'fitbit', 'garmin'
);

-- =====================
-- AI COACH CHAT
-- =====================
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- =====================
-- USER NOTES (long term AI memory)
-- =====================
create table user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  note text not null, -- e.g. "has knee injury", "prefers morning workouts"
  category text, -- 'injury', 'preference', 'goal', 'medical'
  created_at timestamptz default now()
);

-- =====================
-- PERSONAL RECORDS
-- =====================
create table personal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  exercise_name text not null,
  weight numeric(6,2) not null,
  reps integer not null,
  one_rep_max numeric(6,2), -- calculated
  achieved_at timestamptz default now(),
  workout_log_id uuid references workout_logs(id) on delete set null
);

-- =====================
-- WATER LOGS
-- =====================
create table water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount_ml integer not null,
  logged_at timestamptz default now(),
  date date default current_date
);

-- =====================
-- INDEXES for performance
-- =====================
create index idx_metrics_user_id on metrics(user_id);
create index idx_metrics_recorded_at on metrics(recorded_at desc);
create index idx_workout_logs_user_id on workout_logs(user_id);
create index idx_workout_logs_date on workout_logs(date desc);
create index idx_food_logs_user_id on food_logs(user_id);
create index idx_food_logs_date on food_logs(date desc);
create index idx_health_data_user_id on health_data(user_id);
create index idx_health_data_recorded_at on health_data(recorded_at desc);
create index idx_chat_messages_user_id on chat_messages(user_id);
create index idx_chat_messages_created_at on chat_messages(created_at desc);
create index idx_set_logs_workout_log_id on set_logs(workout_log_id);
create index idx_personal_records_user_id on personal_records(user_id);
create index idx_water_logs_user_date on water_logs(user_id, date);

-- =====================
-- UPDATED_AT trigger for profiles
-- =====================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- =====================
-- AUTO CREATE PROFILE on signup
-- =====================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();