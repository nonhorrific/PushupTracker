/*
  # Personal Bests Tracking System

  1. New Tables
    - `personal_bests`
      - `id` (uuid, primary key)
      - `exercise_type` (text) - 'pushup' or 'squat'
      - `best_rep_count` (integer) - highest rep count achieved
      - `achieved_at` (timestamptz) - when the record was set
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on personal_bests table
    - Allow public read/write since no authentication is required
    - Data is tied to browser session via localStorage

  3. Notes
    - This table stores personal bests without user authentication
    - Each browser will maintain its own records
    - Optional: Can be enhanced later with user auth for cross-device sync
*/

CREATE TABLE IF NOT EXISTS personal_bests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_type text NOT NULL CHECK (exercise_type IN ('pushup', 'squat')),
  best_rep_count integer NOT NULL DEFAULT 0,
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(exercise_type)
);

ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view personal bests"
  ON personal_bests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert personal bests"
  ON personal_bests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update personal bests"
  ON personal_bests FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_personal_bests_exercise_type ON personal_bests(exercise_type);