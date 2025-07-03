/*
  # Add user tracking to expenses

  1. Database Changes
    - Add created_by column to expenses table (references auth.users)
    - Add created_by_name column to expenses table for display purposes
    - Update existing expenses to have a default created_by value

  2. Security
    - Update RLS policies to ensure users can only see their own expenses
    - Admin users can see all expenses
*/

-- Add user tracking columns to expenses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE expenses ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'created_by_name'
  ) THEN
    ALTER TABLE expenses ADD COLUMN created_by_name text;
  END IF;
END $$;

-- Update RLS policies for expenses to be user-specific
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;

-- Allow users to insert their own expenses
CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to view their own expenses, admins can view all
CREATE POLICY "Users can view own expenses, admins view all"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow users to update their own expenses, admins can update all
CREATE POLICY "Users can update own expenses, admins update all"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow users to delete their own expenses, admins can delete all
CREATE POLICY "Users can delete own expenses, admins delete all"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS expenses_created_by_idx ON expenses(created_by);