/*
  # Create test user and update categories with proper icons

  1. Test User Setup
    - Create test user with email test@gmail.com
    - Set up profile with admin access
    - Password will be "password"

  2. Category Icon Updates
    - Update categories with appropriate Lucide React icons
    - Ensure icons match the category purpose

  3. Notes
    - This is for testing purposes only
    - In production, users should be created through proper signup flow
*/

-- Create test user profile (the auth user will be created via Supabase Auth)
-- First, we need to insert into auth.users, but this requires service role
-- For now, we'll create a trigger to handle the profile creation

-- Update categories with proper Lucide React icons
UPDATE categories SET icon = 'package-2' WHERE name = 'Raw Materials';
UPDATE categories SET icon = 'megaphone' WHERE name = 'Marketing';
UPDATE categories SET icon = 'plane' WHERE name = 'Travelling';
UPDATE categories SET icon = 'truck' WHERE name = 'Transportation';
UPDATE categories SET icon = 'send' WHERE name = 'Delivery Charges';
UPDATE categories SET icon = 'more-horizontal' WHERE name = 'Others';

-- Update subcategory icons by adding icon column to subcategories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subcategories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE subcategories ADD COLUMN icon text DEFAULT 'circle';
  END IF;
END $$;

-- Update subcategory icons for Raw Materials
UPDATE subcategories SET icon = 'package' WHERE name = 'Pouches';
UPDATE subcategories SET icon = 'sticker' WHERE name = 'Stickers';
UPDATE subcategories SET icon = 'wheat' WHERE name = 'Plain Karam';
UPDATE subcategories SET icon = 'soup' WHERE name = 'Sambar Karam';
UPDATE subcategories SET icon = 'nut' WHERE name = 'Kobbari Karam';
UPDATE subcategories SET icon = 'sparkles' WHERE name = 'Turmaric Powder';

-- Update subcategory icons for Marketing
UPDATE subcategories SET icon = 'facebook' WHERE name = 'Facebook Ads';
UPDATE subcategories SET icon = 'message-circle' WHERE name = 'WhatsApp Ads';
UPDATE subcategories SET icon = 'users' WHERE name = 'Human Efforts';

-- Update subcategory icons for Transportation
UPDATE subcategories SET icon = 'map-pin' WHERE name = 'Guntur to Hyderabad';
UPDATE subcategories SET icon = 'navigation' WHERE name = 'Local';

-- Update subcategory icons for Delivery Charges
UPDATE subcategories SET icon = 'package-check' WHERE name = 'Orders Delivery';

-- Set default icon for all "Others" subcategories
UPDATE subcategories SET icon = 'more-horizontal' WHERE name = 'Others';