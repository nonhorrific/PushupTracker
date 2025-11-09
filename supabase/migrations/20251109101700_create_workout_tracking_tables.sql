/*
  # Workout Tracking System

  1. New Tables
    - `workouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_type` (text) - 'pushup' or 'squat'
      - `total_reps` (integer)
      - `average_quality` (integer) - 0-100 score
      - `duration_seconds` (integer)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `reps`
      - `id` (uuid, primary key)
      - `workout_id` (uuid, references workouts)
      - `rep_number` (integer)
      - `quality_score` (integer) - 0-100
      - `duration_ms` (integer)
      - `form_issues_count` (integer)
      - `timestamp` (timestamptz)
    
    - `form_issues`
      - `id` (uuid, primary key)
      - `rep_id` (uuid, references reps)
      - `issue_type` (text) - e.g., 'back_sag', 'asymmetry'
      - `severity` (text) - 'CRITICAL', 'WARNING', 'TIP'
      - `message` (text)
      - `timestamp` (timestamptz)
    
    - `user_calibrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_type` (text)
      - `baseline_angles` (jsonb) - stores user-specific angle baselines
      - `flexibility_score` (integer)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  exercise_type text NOT NULL CHECK (exercise_type IN ('pushup', 'squat')),
  total_reps integer DEFAULT 0,
  average_quality integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  rep_number integer NOT NULL,
  quality_score integer DEFAULT 100,
  duration_ms integer DEFAULT 0,
  form_issues_count integer DEFAULT 0,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reps from own workouts"
  ON reps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = reps.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reps to own workouts"
  ON reps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = reps.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reps from own workouts"
  ON reps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = reps.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = reps.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reps from own workouts"
  ON reps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = reps.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS form_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id uuid REFERENCES reps(id) ON DELETE CASCADE,
  issue_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING', 'TIP')),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE form_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view form issues from own reps"
  ON form_issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reps
      JOIN workouts ON workouts.id = reps.workout_id
      WHERE reps.id = form_issues.rep_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert form issues to own reps"
  ON form_issues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reps
      JOIN workouts ON workouts.id = reps.workout_id
      WHERE reps.id = form_issues.rep_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS user_calibrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  exercise_type text NOT NULL CHECK (exercise_type IN ('pushup', 'squat')),
  baseline_angles jsonb DEFAULT '{}'::jsonb,
  flexibility_score integer DEFAULT 50,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_type)
);

ALTER TABLE user_calibrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calibrations"
  ON user_calibrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calibrations"
  ON user_calibrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calibrations"
  ON user_calibrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calibrations"
  ON user_calibrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_started_at ON workouts(started_at);
CREATE INDEX IF NOT EXISTS idx_reps_workout_id ON reps(workout_id);
CREATE INDEX IF NOT EXISTS idx_form_issues_rep_id ON form_issues(rep_id);
CREATE INDEX IF NOT EXISTS idx_user_calibrations_user_id ON user_calibrations(user_id);
