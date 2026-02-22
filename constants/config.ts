export const config = {
  // Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,

  // API endpoints
  edamamBaseUrl: 'https://api.edamam.com/api/nutrition-data',
  openFoodFactsBaseUrl: 'https://world.openfoodfacts.org/api/v2',
  whisperBaseUrl: 'https://api.openai.com/v1/audio/transcriptions',

  // App settings
  appName: 'NutriFit',
  version: '1.0.0',

  // Fitness defaults
  defaultRestSeconds: 90,
  minCalorieTarget: 1200,   // never go below this
  maxCalorieTarget: 6000,

  // Macro ratios (fallback)
  defaultProteinRatio: 0.30,
  defaultCarbsRatio: 0.45,
  defaultFatRatio: 0.25,

  // Voice recording
  maxRecordingSeconds: 30,

  // Health sync interval (minutes)
  healthSyncInterval: 30,

  // Chat history limit
  maxChatHistory: 20,

  // Pagination
  pageSize: 20,
}

export const muscleGroupLabels: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  full_body: 'Full Body',
}

export const goalLabels: Record<string, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  recomposition: 'Body Recomposition',
  endurance: 'Endurance',
  maintenance: 'Maintenance',
}

export const activityLabels: Record<string, string> = {
  sedentary: 'Sedentary (desk job, no exercise)',
  lightly_active: 'Lightly Active (1-3 days/week)',
  moderately_active: 'Moderately Active (3-5 days/week)',
  very_active: 'Very Active (6-7 days/week)',
  extremely_active: 'Extremely Active (athlete/physical job)',
}