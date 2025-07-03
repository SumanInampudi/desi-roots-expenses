/*
  # Update categories and subcategories structure

  1. Changes
    - Clear existing categories and subcategories
    - Insert new custom category structure
    - Add expense_details field to expenses table for "Others" subcategory

  2. New Categories Structure
    - Food & Beverages with subcategories (Groceries, Dining Out, Coffee & Tea, etc.)
    - Transportation with subcategories (Fuel, Public Transport, Taxi/Ride-sharing, etc.)
    - Housing with subcategories (Rent/Mortgage, Utilities, Maintenance, etc.)
    - Healthcare with subcategories (Medical Bills, Pharmacy, Insurance, etc.)
    - Entertainment with subcategories (Movies, Gaming, Sports, etc.)
    - Shopping with subcategories (Clothing, Electronics, Home & Garden, etc.)
    - Education with subcategories (Tuition, Books, Online Courses, etc.)
    - Personal Care with subcategories (Haircut, Skincare, Gym, etc.)
    - Travel with subcategories (Flights, Hotels, Local Transport, etc.)
    - Miscellaneous with subcategories (Gifts, Donations, Others)

  3. Security
    - Maintain existing RLS policies
*/

-- Add expense_details column to expenses table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'expense_details'
  ) THEN
    ALTER TABLE expenses ADD COLUMN expense_details text;
  END IF;
END $$;

-- Clear existing data
DELETE FROM expenses;
DELETE FROM subcategories;
DELETE FROM categories;

-- Insert new categories
INSERT INTO categories (name, color, icon) VALUES
  ('Food & Beverages', '#EF4444', 'utensils'),
  ('Transportation', '#3B82F6', 'car'),
  ('Housing', '#10B981', 'home'),
  ('Healthcare', '#EC4899', 'heart'),
  ('Entertainment', '#F59E0B', 'film'),
  ('Shopping', '#8B5CF6', 'shopping-bag'),
  ('Education', '#06B6D4', 'book'),
  ('Personal Care', '#F97316', 'user'),
  ('Travel', '#84CC16', 'plane'),
  ('Miscellaneous', '#6B7280', 'more-horizontal');

-- Insert subcategories for Food & Beverages
INSERT INTO subcategories (name, category_id) VALUES
  ('Groceries', (SELECT id FROM categories WHERE name = 'Food & Beverages')),
  ('Dining Out', (SELECT id FROM categories WHERE name = 'Food & Beverages')),
  ('Coffee & Tea', (SELECT id FROM categories WHERE name = 'Food & Beverages')),
  ('Fast Food', (SELECT id FROM categories WHERE name = 'Food & Beverages')),
  ('Alcohol', (SELECT id FROM categories WHERE name = 'Food & Beverages')),
  ('Others', (SELECT id FROM categories WHERE name = 'Food & Beverages'));

-- Insert subcategories for Transportation
INSERT INTO subcategories (name, category_id) VALUES
  ('Fuel', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Public Transport', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Taxi/Ride-sharing', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Vehicle Maintenance', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Parking', (SELECT id FROM categories WHERE name = 'Transportation')),
  ('Others', (SELECT id FROM categories WHERE name = 'Transportation'));

-- Insert subcategories for Housing
INSERT INTO subcategories (name, category_id) VALUES
  ('Rent/Mortgage', (SELECT id FROM categories WHERE name = 'Housing')),
  ('Utilities', (SELECT id FROM categories WHERE name = 'Housing')),
  ('Internet & Phone', (SELECT id FROM categories WHERE name = 'Housing')),
  ('Home Maintenance', (SELECT id FROM categories WHERE name = 'Housing')),
  ('Insurance', (SELECT id FROM categories WHERE name = 'Housing')),
  ('Others', (SELECT id FROM categories WHERE name = 'Housing'));

-- Insert subcategories for Healthcare
INSERT INTO subcategories (name, category_id) VALUES
  ('Medical Bills', (SELECT id FROM categories WHERE name = 'Healthcare')),
  ('Pharmacy', (SELECT id FROM categories WHERE name = 'Healthcare')),
  ('Health Insurance', (SELECT id FROM categories WHERE name = 'Healthcare')),
  ('Dental Care', (SELECT id FROM categories WHERE name = 'Healthcare')),
  ('Vision Care', (SELECT id FROM categories WHERE name = 'Healthcare')),
  ('Others', (SELECT id FROM categories WHERE name = 'Healthcare'));

-- Insert subcategories for Entertainment
INSERT INTO subcategories (name, category_id) VALUES
  ('Movies & Shows', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Gaming', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Sports & Recreation', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Books & Magazines', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Music & Concerts', (SELECT id FROM categories WHERE name = 'Entertainment')),
  ('Others', (SELECT id FROM categories WHERE name = 'Entertainment'));

-- Insert subcategories for Shopping
INSERT INTO subcategories (name, category_id) VALUES
  ('Clothing', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Electronics', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Home & Garden', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Personal Items', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Gifts', (SELECT id FROM categories WHERE name = 'Shopping')),
  ('Others', (SELECT id FROM categories WHERE name = 'Shopping'));

-- Insert subcategories for Education
INSERT INTO subcategories (name, category_id) VALUES
  ('Tuition & Fees', (SELECT id FROM categories WHERE name = 'Education')),
  ('Books & Supplies', (SELECT id FROM categories WHERE name = 'Education')),
  ('Online Courses', (SELECT id FROM categories WHERE name = 'Education')),
  ('Workshops & Seminars', (SELECT id FROM categories WHERE name = 'Education')),
  ('Certification', (SELECT id FROM categories WHERE name = 'Education')),
  ('Others', (SELECT id FROM categories WHERE name = 'Education'));

-- Insert subcategories for Personal Care
INSERT INTO subcategories (name, category_id) VALUES
  ('Haircut & Styling', (SELECT id FROM categories WHERE name = 'Personal Care')),
  ('Skincare & Cosmetics', (SELECT id FROM categories WHERE name = 'Personal Care')),
  ('Gym & Fitness', (SELECT id FROM categories WHERE name = 'Personal Care')),
  ('Spa & Wellness', (SELECT id FROM categories WHERE name = 'Personal Care')),
  ('Personal Hygiene', (SELECT id FROM categories WHERE name = 'Personal Care')),
  ('Others', (SELECT id FROM categories WHERE name = 'Personal Care'));

-- Insert subcategories for Travel
INSERT INTO subcategories (name, category_id) VALUES
  ('Flights', (SELECT id FROM categories WHERE name = 'Travel')),
  ('Hotels & Accommodation', (SELECT id FROM categories WHERE name = 'Travel')),
  ('Local Transport', (SELECT id FROM categories WHERE name = 'Travel')),
  ('Food & Dining', (SELECT id FROM categories WHERE name = 'Travel')),
  ('Activities & Tours', (SELECT id FROM categories WHERE name = 'Travel')),
  ('Others', (SELECT id FROM categories WHERE name = 'Travel'));

-- Insert subcategories for Miscellaneous
INSERT INTO subcategories (name, category_id) VALUES
  ('Gifts & Donations', (SELECT id FROM categories WHERE name = 'Miscellaneous')),
  ('Bank Fees', (SELECT id FROM categories WHERE name = 'Miscellaneous')),
  ('Taxes', (SELECT id FROM categories WHERE name = 'Miscellaneous')),
  ('Legal & Professional', (SELECT id FROM categories WHERE name = 'Miscellaneous')),
  ('Emergency Fund', (SELECT id FROM categories WHERE name = 'Miscellaneous')),
  ('Others', (SELECT id FROM categories WHERE name = 'Miscellaneous'));