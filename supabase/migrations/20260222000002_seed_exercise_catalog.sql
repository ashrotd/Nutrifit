-- =====================
-- SEED: global exercise catalog (user_id null = visible to everyone)
-- =====================

insert into exercise_catalog (name, muscle_group, equipment, instructions) values
  -- Chest
  ('Barbell Bench Press', 'chest', 'barbell', 'Lower the bar to mid-chest, press back up to lockout.'),
  ('Incline Barbell Bench Press', 'chest', 'barbell', 'Bench set to 30-45 degrees, bar to upper chest.'),
  ('Dumbbell Bench Press', 'chest', 'dumbbell', 'Press dumbbells from chest level to full extension.'),
  ('Incline Dumbbell Press', 'chest', 'dumbbell', 'Incline bench, press dumbbells up and slightly in.'),
  ('Dumbbell Flyes', 'chest', 'dumbbell', 'Wide arc, slight elbow bend, squeeze at the top.'),
  ('Cable Crossover', 'chest', 'cable', 'High-to-low or low-to-high cable arc, squeeze at midline.'),
  ('Machine Chest Press', 'chest', 'machine', 'Seated press, control the negative.'),
  ('Push-Up', 'chest', 'bodyweight', 'Keep core tight, lower chest to floor, press up.'),

  -- Back
  ('Deadlift', 'back', 'barbell', 'Hip hinge, flat back, bar close to shins throughout.'),
  ('Barbell Row', 'back', 'barbell', 'Hinge forward, row bar to lower ribs.'),
  ('Pull-Up', 'back', 'pull_up_bar', 'Dead hang to chin over bar, control the descent.'),
  ('Chin-Up', 'back', 'pull_up_bar', 'Underhand grip, chin over bar.'),
  ('Lat Pulldown', 'back', 'cable', 'Pull bar to upper chest, lead with elbows.'),
  ('Seated Cable Row', 'back', 'cable', 'Neutral spine, row to torso, squeeze shoulder blades.'),
  ('T-Bar Row', 'back', 'machine', 'Chest-supported or hinged, row to sternum.'),
  ('Single-Arm Dumbbell Row', 'back', 'dumbbell', 'Flat back, row dumbbell to hip.'),
  ('Face Pull', 'back', 'cable', 'Rope to face height, external rotation at the end.'),

  -- Legs — quads
  ('Barbell Back Squat', 'quads', 'barbell', 'Bar on upper traps, hips back and down, drive through mid-foot.'),
  ('Front Squat', 'quads', 'barbell', 'Bar on front delts, elbows high, upright torso.'),
  ('Leg Press', 'quads', 'machine', 'Feet shoulder-width, control depth, avoid locking knees hard.'),
  ('Leg Extension', 'quads', 'machine', 'Full extension, controlled tempo, avoid swinging.'),
  ('Walking Lunge', 'quads', 'dumbbell', 'Long step, front knee tracks over foot.'),
  ('Bulgarian Split Squat', 'quads', 'dumbbell', 'Rear foot elevated, drop straight down on front leg.'),

  -- Legs — hamstrings
  ('Romanian Deadlift', 'hamstrings', 'barbell', 'Soft knees, hinge at hips, bar stays close to legs.'),
  ('Lying Leg Curl', 'hamstrings', 'machine', 'Curl heels to glutes, controlled negative.'),
  ('Seated Leg Curl', 'hamstrings', 'machine', 'Full range, avoid hips rising off the pad.'),
  ('Good Morning', 'hamstrings', 'barbell', 'Bar on traps, hinge forward keeping back flat.'),

  -- Legs — glutes
  ('Hip Thrust', 'glutes', 'barbell', 'Shoulders on bench, drive hips up, squeeze glutes at top.'),
  ('Glute Bridge', 'glutes', 'bodyweight', 'Feet flat, drive hips up, squeeze at the top.'),
  ('Cable Kickback', 'glutes', 'cable', 'Ankle cuff, kick leg back and up, squeeze glute.'),
  ('Sumo Deadlift', 'glutes', 'barbell', 'Wide stance, toes out, vertical shins, drive hips forward.'),

  -- Legs — calves
  ('Standing Calf Raise', 'calves', 'machine', 'Full stretch at bottom, rise onto toes.'),
  ('Seated Calf Raise', 'calves', 'machine', 'Knees bent, press through balls of feet.'),
  ('Leg Press Calf Raise', 'calves', 'machine', 'Balls of feet on platform edge, press through toes.'),

  -- Shoulders
  ('Overhead Press', 'shoulders', 'barbell', 'Bar from front rack to lockout overhead, brace core.'),
  ('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', 'Press dumbbells from shoulder height to overhead.'),
  ('Arnold Press', 'shoulders', 'dumbbell', 'Rotate palms out as you press overhead.'),
  ('Lateral Raise', 'shoulders', 'dumbbell', 'Raise arms to shoulder height, slight elbow bend.'),
  ('Front Raise', 'shoulders', 'dumbbell', 'Raise dumbbell to eye level, controlled tempo.'),
  ('Rear Delt Flye', 'shoulders', 'dumbbell', 'Hinge forward, raise arms out to sides.'),
  ('Cable Lateral Raise', 'shoulders', 'cable', 'Low pulley, raise arm out to the side.'),

  -- Biceps
  ('Barbell Curl', 'biceps', 'barbell', 'Elbows pinned to sides, curl to shoulder height.'),
  ('Dumbbell Curl', 'biceps', 'dumbbell', 'Supinate as you curl, control the descent.'),
  ('Hammer Curl', 'biceps', 'dumbbell', 'Neutral grip throughout the curl.'),
  ('Preacher Curl', 'biceps', 'barbell', 'Arms on pad, full extension at the bottom.'),
  ('Cable Curl', 'biceps', 'cable', 'Constant tension, elbows fixed at sides.'),

  -- Triceps
  ('Close-Grip Bench Press', 'triceps', 'barbell', 'Hands shoulder-width, elbows tucked, press to lockout.'),
  ('Triceps Pushdown', 'triceps', 'cable', 'Elbows pinned to sides, extend to full lockout.'),
  ('Overhead Triceps Extension', 'triceps', 'dumbbell', 'Elbows close to head, lower behind the neck.'),
  ('Skull Crusher', 'triceps', 'barbell', 'Lower bar to forehead, elbows stay fixed.'),
  ('Dips', 'triceps', 'bodyweight', 'Lean forward slightly less to target triceps, lockout at top.'),

  -- Forearms
  ('Wrist Curl', 'forearms', 'dumbbell', 'Forearms on bench, curl wrists up through full range.'),
  ('Reverse Wrist Curl', 'forearms', 'dumbbell', 'Forearms on bench, extend wrists upward.'),
  ('Farmer''s Carry', 'forearms', 'dumbbell', 'Heavy dumbbells at sides, walk with tall posture.'),

  -- Core
  ('Plank', 'core', 'bodyweight', 'Straight line from head to heels, brace core.'),
  ('Hanging Leg Raise', 'core', 'pull_up_bar', 'Hang from bar, raise legs to hip height or higher.'),
  ('Cable Crunch', 'core', 'cable', 'Kneel facing anchor, crunch down flexing the spine.'),
  ('Russian Twist', 'core', 'bodyweight', 'Rotate torso side to side, feet optionally lifted.'),
  ('Ab Wheel Rollout', 'core', 'bodyweight', 'Roll forward keeping core braced, avoid arching the back.'),
  ('Sit-Up', 'core', 'bodyweight', 'Feet anchored, curl torso up to knees.'),

  -- Full body
  ('Kettlebell Swing', 'full_body', 'kettlebell', 'Hip hinge drives the swing, arms stay relaxed.'),
  ('Clean and Press', 'full_body', 'barbell', 'Explosive pull to front rack, then press overhead.');
