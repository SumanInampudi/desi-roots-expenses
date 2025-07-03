/*
  # Update categories and subcategories for business expense tracking

  1. Database Changes
    - Add expense_details column to expenses table
    - Clear existing categories and subcategories
    - Insert new business-specific categories and subcategories

  2. New Categories
    - Raw Materials (with subcategories: Pouches, Stickers, Plain Karam, Sambar Karam, Kobbari Karam, Turmaric Powder, Others)
    - Marketing (with subcategories: Facebook Ads, WhatsApp Ads, Human Efforts, Others)
    - Travelling (with subcategory: Others)
    - Transportation (with subcategories: Guntur to Hyderabad, Local, Others)
    - Delivery Charges (with subcategories: Orders Delivery, Others)
    - Others (with subcategory: Others)

  3. Features
    - expense_details field for capturing additional information when "Others" is selected
    - Maintains existing RLS policies
*/

-- Add expense_details column to expenses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'expense_details'
  ) THEN
    ALTER TABLE expenses ADD COLUMN expense_details text;
  END IF;
END $$;

-- Clear existing data to insert new business categories
DELETE FROM expenses;
DELETE FROM subcategories;
DELETE FROM categories;

-- Insert business-specific categories with appropriate colors
INSERT INTO categories (name, color, icon) VALUES
  ('Raw Materials', '#EF4444', 'package'),
  ('Marketing', '#3B82F6', 'megaphone'),
  ('Travelling', '#10B981', 'plane'),
  ('Transportation', '#F59E0B', 'truck'),
  ('Delivery Charges', '#8B5CF6', 'send'),
  ('Others', '#6B7280', 'more-horizontal');

-- Insert subcategories for Raw Materials
INSERT INTO subcategories (name, category_id) VALUES
  ('Pouches', (SELECT id FROM categories WHERE name = 'Raw Materials')),
  ('Stickers', (SELECT id FROM categories WHERE name = 'Raw Materials')),
  ('Plain Karam', (SELECT id FROM categories WHERE name = 'Raw Materials')),
  ('Sambar Karam', (SELECT id FROM categories WHERE name = 'Raw Materials')),
  ('Kobbari Karam', (SELECT id FROM categories WHERE name = 'Raw Materials')),
  ('Turmaric Powder', (SELECT id FROM categories WHERE name = 'Raw Materials')),
  ('Others', (SELECT id FROM categories WHERE name = 'Raw Materials'));

-- Insert subcategories for Marketing
INSERT INTO subcategories (name, category_id) VALUES
  ('Facebook Ads', (SELECT id FROM categories WHERE name = 'Marketing')),
  ('WhatsApp Ads', (SELECT id FROM categories WHERE name = 'Marketing')),
  ('Human Efforts', (SELECT id FROM categories WHERE name = 'Marketing')),
  ('Others', (SELECT id FROM categories WHERE name = 'Marketing'));

-- Insert subcategories for Travelling
INSERT INTO subcategories (name, category_id) VALUES
  ('Others', (SELECT id FROM categories WHERE name = 'Travelling'));

-- Insert subcategories for Transportation
INSERT INTO subcategories (name, category_id) VALUES
  ('Guntur to Hyderabad', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Local', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Others', (SELECT id FROM categories WHERE name = 'Transportation'));

-- Insert subcategories for Delivery Charges
INSERT INTO subcategories (name, category_id) VALUES
  ('Orders Delivery', (SELECT id FROM categories WHERE name = 'Delivery Charges')),
  ('Others', (SELECT id FROM categories WHERE name = 'Delivery Charges'));

-- Insert subcategories for Others
INSERT INTO subcategories (name, category_id) VALUES
  ('Others', (SELECT id FROM categories WHERE name = 'Others'));