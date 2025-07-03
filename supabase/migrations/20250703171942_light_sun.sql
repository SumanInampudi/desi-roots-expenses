/*
  # Add receipt storage functionality

  1. Storage
    - Create receipts bucket for storing receipt images
    - Set up proper policies for authenticated users

  2. Database Changes
    - Add receipt_url column to expenses table
*/

-- Add receipt_url column to expenses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE expenses ADD COLUMN receipt_url text;
  END IF;
END $$;

-- Create storage bucket for receipts (this will be handled by Supabase dashboard)
-- The bucket should be created with the following settings:
-- - Name: receipts
-- - Public: true (for easy access to receipt images)
-- - File size limit: 5MB
-- - Allowed MIME types: image/*

-- Note: Storage bucket creation and policies need to be set up in Supabase dashboard
-- as they cannot be created via SQL migrations in the current setup